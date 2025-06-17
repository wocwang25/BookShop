const RentalInvoice = require('../models/RentalInvoice');
const Rule = require('../models/Rule')
const Book = require('../models/Book');
const CustomerService = require('./customer.service');
const mongoose = require('mongoose');
const BookCopy = require('../models/BookCopy');


const RentalInvoiceService = {
    async getAllRentInvoice(month, year) {
        // Xác định ngày đầu và cuối tháng
        const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
        const endDate = new Date(year, month, 0, 23, 59, 59, 999);

        // Lấy danh sách hóa đơn thuê trong tháng/năm
        const invoices = await RentalInvoice.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
            .populate('customer', 'name email')
            .populate('user', 'name email')
            .populate({
                path: 'items.book',
                select: 'title author category',
                populate: [
                    { path: 'author', select: 'name' },
                    { path: 'category', select: 'name' }
                ]
            })
            .populate({
                path: 'items.bookCopy',
                select: 'identifier status'
            })
            .populate({
                path: 'items.category',
                select: 'name'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Tính tổng tiền thuê
        const totalAmount = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

        return {
            invoices,
            totalAmount
        };
    },

    async createRentalInvoice(userId, customer_name, items, rent_info) {
        if (!items || items.length === 0) throw new Error("No items provided");

        const rule7 = await Rule.findOne({ code: "QD7" });
        const default_duration = rule7?.ruleValue?.default_duration;
        const overdue_fee = rule7?.ruleValue?.overdue_fee;
        const rent_fee = rule7?.ruleValue?.rent_fee ?? 5000;

        if (typeof rent_fee !== 'number' || isNaN(rent_fee)) {
            throw new Error('Phí thuê sách (rent_fee) không hợp lệ. Vui lòng kiểm tra cấu hình QD7.');
        }

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

            // Tính số ngày thuê (ít nhất 1 ngày)
            const start = new Date(startDate);
            const due = new Date(dueDate);
            const days = Math.max(1, Math.ceil((due - start) / (1000 * 60 * 60 * 24)));

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

                if (availableCopies < minStock) {
                    throw new Error(`Không đủ bản copy có sẵn cho sách "${book.title}". Có sẵn: ${availableCopies}.`);
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

            // Tổng tiền = số sách * số ngày thuê * phí thuê/ngày
            rentalInvoice.items = invoiceItems;
            rentalInvoice.totalAmount = rent_fee * items.length * days;

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
            customer.rentalInvoices.push(rentalInvoice._id);
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