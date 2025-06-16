const SalesInvoice = require('../models/SalesInvoice');
const Rule = require('../models/Rule')
const Book = require('../models/Book');
const CustomerService = require('./customer.service');
const mongoose = require('mongoose');
const BookCopy = require('../models/BookCopy');


const SalesInvoiceService = {

    async getAllSalesInvoice(month, year) {
        const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);
        // Lấy danh sách hóa đơn bán trong tháng hiện tại
        const invoices = await SalesInvoice.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate('customer', 'name email')
            .populate('user', 'name email')
            .populate({
                path: 'items.book',
                select: 'title author category',
                populate: [
                    { path: 'category', select: 'name' }
                ]
            })
            .populate({
                path: 'items.category',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Tính tổng tiền
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        return {
            invoices,
            totalAmount
        };
    },

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

            const salesInvoice = new SalesInvoice({
                customer: customer._id,
                user: userId
            });

            let invoiceItems = [];
            let totalAmount = 0;
            for (const item of items) {
                const { title, quantity } = item;

                const book = await Book.findOne({ title }).session(session);
                if (!book) throw new Error(`Book "${title}" not found`);

                const availableCopies = await BookCopy.countDocuments(
                    {
                        book: book._id,
                        status: 'available'
                    }
                );

                const copiesToSell = await BookCopy.find({ book: book._id, status: 'available' }).limit(item.quantity).session(session);
                if (rule?.is_active) {
                    if (availableCopies < quantity) {
                        throw new Error(`Not enough stock for "${title}". Current: ${availableCopies}, Required: ${quantity}`);
                    }

                    if ((availableCopies - quantity) < minStock) {
                        throw new Error(`Selling "${title}" would reduce stock below minimum (${minStock})`);
                    }


                    if (copiesToSell.length < quantity) {
                        throw new Error(`Not enough stock for "${title}". Current: ${copiesToSell.length}, Required: ${quantity}`);
                    }
                }
                // Đánh dấu từng bản copy là 'sold' và gán saleInvoiceId
                for (const copy of copiesToSell) {
                    copy.status = 'sold';
                    copy.saleInvoiceId = salesInvoice._id;
                    await copy.save({ session });
                }

                invoiceItems.push({
                    book: book._id,
                    category: book.category,
                    quantity: quantity,
                    unitPrice: book.price
                });

                totalAmount += quantity * book.price;
            }

            salesInvoice.items = invoiceItems;
            salesInvoice.totalAmount = totalAmount;

            await salesInvoice.save({ session });

            // Cập nhật nợ
            customer.debt += totalAmount;
            await customer.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { salesInvoice: salesInvoice };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = SalesInvoiceService;