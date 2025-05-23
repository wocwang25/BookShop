const BookImport = require('./import.model');
const User = require('../../../models/User');
const handleBookImport = require('./import.service');
const mongoose = require('mongoose');

exports.createBookImport = async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { details } = req.body;

        const { detailForSave, transactions } = await handleBookImport.create(details);

        const bookImport = new BookImport({
            staff: req.user.id,
            detail: detailForSave
        });

        await bookImport.save({ session });

        await handleBookImport.transact(transactions, req.user.id, session)

        await session.commitTransaction();
        session.endSession();

        res.json({
            status: 'success',
            message: "Nhập kho thành công",
            data: bookImport
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error(error);
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
};


exports.getBookImport = async function (req, res) {
    const { staff_name, date } = req.body;

    try {
        const staff = await User.findOne({ name: staff_name });
        if (!staff) {
            return res.status(404).json({
                status: 'error',
                message: 'Nhân viên không tồn tại'
            });
        }

        const query = { staff: staff._id };

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

        const formattedBookImports = await handleBookImport.get(query);
        console.log(formattedBookImports);

        // 5. Trả về kết quả
        res.json({
            status: 'success',
            data: formattedBookImports
        });

    } catch (error) {
        console.error('Lỗi khi lấy phiếu nhập sách:', error);
        res.status(error.status || 500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi lấy thông tin phiếu nhập sách',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
