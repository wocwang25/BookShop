const Invoice = require('./invoice.model');
const User = require('../../../models/User');
const invoiceService = require('./invoice.service');
const utils = require('./invoice.utils');
const mongoose = require('mongoose');

exports.createInvoice = async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { customer_name, details } = req.body;
    try {
        const { customer, invoiceDetails, transactions } = await invoiceService.create(customer_name, details);

        const invoice = new Invoice({
            staff: req.user.id,
            customer: customer._id,
            detail: invoiceDetails
        });

        console.log(transactions)

        await invoice.save({ session });
        await customer.save({ session });
        await invoiceService.transact(transactions, req.user.id, session);

        await session.commitTransaction();
        session.endSession();

        res.json({
            status: 'success',
            message: "Tạo hóa đơn thành công",
            data: invoice
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getInvoice = async function (req, res) {
    const { customer_name, date } = req.body;

    try {
        const customer = await User.findOne({ name: customer_name });
        utils.validateUser(customer);

        const query = { customer: customer._id };

        // Thêm điều kiện ngày nếu có
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            query.createdAt = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const formattedInvoice = await invoiceService.get(query);

        res.json({
            status: 'success',
            data: formattedInvoice
        });

    } catch (error) {
        console.error('Lỗi khi lấy hóa đơn:', error);
        res.status(error.status || 500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi lấy thông tin hóa đơn',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}