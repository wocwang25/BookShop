const RentalInvoice = require('../models/RentalInvoice');
const Rule = require('../models/Rule')
const Book = require('../models/Book');
const CustomerService = require('./customer.service');
const mongoose = require('mongoose');
const BookCopy = require('../models/BookCopy');


const RentalInvoiceService = {
    async createRentalInvoice(userId, customer_name, items, rent_info) {
        if (!items || items.length === 0) throw new Error("No items provided");

        const rule7 = await Rule.findOne({ code: "QD7" });
        const default_duration = rule7?.ruleValue?.default_duration;
        const overdue_fee = rule7?.ruleValue?.overdue_fee;
        const rent_fee = rule7?.ruleValue?.rent_fee;

        const rule2 = await Rule.findOne({ code: 'QD2' });
        const minStock = rule2?.ruleValue?.min_stock;
        const maxDebt = rule2?.ruleValue?.max_debt;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const customer = await CustomerService.findOrCreateCustomer(customer_name);
            if (customer.debt > maxDebt) {
                throw new Error(`Customer debt (${customer.debt}) exceeds the allowed limit (${maxDebt})`);
            }

            const rentalInvoice = new RentalInvoice({
                customer: customer._id,
                user: userId
            });

            let invoiceItems = [];
            let totalAmount = 0;

            const { startDate, dueDate } = rent_info;
            for (const item of items) {
                const { title } = item;

                const book = await Book.findOne({ title }).session(session);
                if (!book) throw new Error(`Book "${title}" not found`);

                const availableCopies = await BookCopy.countDocuments(
                    {
                        book: book._id,
                        status: 'available'
                    }
                );

                if (availableCopies.length < minStock) {
                    throw new Error(`Không đủ bản copy có sẵn cho sách "${bookInfo.title}". Có sẵn: ${availableCopies.length}.`);
                }

                const copyToRent = await BookCopy.findOneAndUpdate(
                    { book: book._id, status: 'available' },
                    {
                        $set: {
                            status: 'rent',
                            customer: customer._id,
                            rentalInvoiceId: rentalInvoice._id
                        }
                    },
                    { session, new: true }
                );

                invoiceItems.push({
                    book: book._id,
                    category: book.category,
                    bookCopy: copyToRent._id
                });
            }

            rentalInvoice.items = invoiceItems;
            rentalInvoice.totalAmount = rent_fee * items.length;

            // Nếu truyền startDate thì dùng, không thì lấy ngày hiện tại
            rentalInvoice.startDate = startDate ? new Date(startDate) : new Date();

            if (dueDate) {
                rentalInvoice.dueDate = new Date(dueDate);
            } else {
                const due = new Date(rentalInvoice.startDate);
                due.setDate(due.getDate() + (default_duration || 10));
                rentalInvoice.dueDate = due;
            }

            await rentalInvoice.save({ session });

            // Cập nhật nợ
            customer.debt += rentalInvoice.totalAmount;
            await customer.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { rentalInvoice, success: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = RentalInvoiceService;