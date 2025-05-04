const User = require('../../../models/User');
const receiptService = require('./receipt.service');
const utils = require('./receipt.utils');
const mongoose = require('mongoose');

exports.createReceipt = async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    const { customer_info } = req.body;
    try {
        const { receipt, customer, transaction } = await receiptService.create(customer_info);
        await receipt.save({ session });
        await customer.save({ session });

        await receiptService.transact(transaction, req.user.id, session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            status: 'success',
            data: receipt
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        res.status(error.status || 500).json({
            status: 'error',
            message: `Đã xảy ra lỗi khi tạo phiếu thu tiền: ${error.message}`,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.getReceipt = async function (req, res) {
    const { customer_name, date } = req.body;

    try {
        const customer = await User.findOne({ name: customer_name });
        utils.validateUser(customer);

        // Tạo query theo customer (và date nếu có)
        const query = { customer: customer._id };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: startDate, $lte: endDate };
        }

        // Truyền query và customer vào service
        const receipts = await receiptService.get(query);

        return res.status(200).json({
            status: 'success',
            data: receipts
        });

    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: 'Không thể lấy danh sách phiếu thu',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
