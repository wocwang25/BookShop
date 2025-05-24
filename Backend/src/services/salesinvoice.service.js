const SalesInvoice = require('../models/SalesInvoice');
const Rule = require('../models/Rule')
const Book = require('../models/Book');
const CustomerService = require('./customer.service');
const mongoose = require('mongoose');


const SalesInvoiceService = {
    async createSalesInvoice(userId, customer_name, items) {
        if (!items || items.length === 0) throw new Error("No items provided");

        const rule = await Rule.findOne({ code: "QD2" });
        const minStock = rule?.ruleValue?.min_stock;
        const maxDebt = rule?.ruleValue?.max_debt;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const customer = await CustomerService.findOrCreateCustomer(customer_name);
            if (customer.debt > maxDebt) {
                throw new Error(`Customer debt (${customer.debt}) exceeds the allowed limit (${maxDebt})`);
            }

            let invoiceItems = [];
            let totalAmount = 0;
            for (const item of items) {
                const { title, quantity, unitPrice } = item;

                const book = await Book.findOne({ title }).session(session);
                if (!book) throw new Error(`Book "${title}" not found`);

                if (book.currentStock < quantity) {
                    throw new Error(`Not enough stock for "${title}". Current: ${book.currentStock}, Required: ${quantity}`);
                }

                if ((book.currentStock - quantity) < minStock) {
                    throw new Error(`Selling "${title}" would reduce stock below minimum (${minStock})`);
                }

                // Cập nhật tồn kho
                book.currentStock -= quantity;
                await book.save({ session });

                invoiceItems.push({
                    book: book._id,
                    category: book.category,
                    quantity: quantity,
                    unitPrice: unitPrice
                });

                totalAmount += quantity * unitPrice;
            }
            // Tạo hóa đơn bán sách
            const slip = new SalesInvoice({
                customer: customer._id,
                user: userId,
                items: invoiceItems,
                totalAmount: totalAmount
            });

            await slip.save({ session });

            // Cập nhật nợ
            customer.debt += totalAmount;
            await customer.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { slip, success: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = SalesInvoiceService;