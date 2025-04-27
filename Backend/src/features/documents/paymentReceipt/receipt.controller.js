const Receipt = require('./receipt.model');
const Book = require('../../../models/Book');
const User = require('../../../models/User');

exports.createPaymentReceipt = async function (req, res) {
    const { customer_name, details } = req.body; // fix typo từ custormer_name

    try {
        const customer = await User.findOne({ name: customer_name });
        if (!customer) {
            return res.status(404).json({
                status: 'error',
                message: "Khách hàng không tồn tại"
            });
        }

        if (customer.debt > 20000) {
            return res.status(400).json({
                status: 'error',
                message: `Khách hàng ${customer.name} nợ quá 20000đ`
            });
        }

        if (!details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: "Danh sách sản phẩm không hợp lệ"
            });
        }

        const titles = details.map(item => item.title);
        const existingBooks = await Book.find({ title: { $in: titles } }).populate('category');
        console.log(existingBooks);

        const bookMap = new Map();
        existingBooks.forEach(book => {
            bookMap.set(book.title, book);
        });

        const receiptDetails = [];

        for (const item of details) {
            const book = bookMap.get(item.title);

            if (!book) {
                return res.status(400).json({
                    status: 'error',
                    message: `Sách "${item.title}" chưa tồn tại trong hệ thống, vui lòng thêm sách trước.`
                });
            }
            if (book.stock - item.quantity < 20) {
                return res.status(400).json({
                    status: 'error',
                    message: `Lượng tồn kho sách "${item.title}" không đủ`
                });
            }
            // cập nhật tồn kho
            book.stock -= item.quantity;
            await book.save();

            console.log(book.category);
            // chuẩn hóa dữ liệu chi tiết hóa đơn
            receiptDetails.push({
                book: book._id,
                category: book.category,
                quantity: item.quantity,
                cost: book.cost.selling_price
            });
        }

        const receipt = new Receipt({
            staff: req.user.id,
            customer: customer._id,
            detail: receiptDetails // đúng format
        });

        await receipt.save();

        res.json({
            status: 'success',
            message: "Tạo hóa đơn thành công",
            data: receipt
        });

    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getReceipt = async function (req, res) {
    const { customer_name, date } = req.body;

    try {
        // 1. Tìm khách hàng trong database
        const customer = await User.findOne({ name: customer_name });
        if (!customer) {
            return res.status(404).json({
                status: 'error',
                message: "Khách hàng không tồn tại"
            });
        }

        // 2. Xây dựng query tìm hóa đơn
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

        // 3. Tìm hóa đơn và populate thông tin cần thiết
        const receipts = await Receipt.find(query)
            .populate({
                path: 'staff',
                select: 'name'
            })
            .populate({
                path: 'customer',
                select: 'name'
            })
            .populate({
                path: 'detail.book',
                select: 'title'
            })
            .populate({
                path: 'detail.category',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        // 4. Format dữ liệu trả về theo mẫu hóa đơn
        const formattedReceipts = receipts.map(receipt => {
            const receiptDetails = receipt.detail.map((item, index) => ({
                stt: index + 1,
                book: item.book?.title || 'Đã xóa',
                category: item.category?.name || 'Đã xóa',
                quantity: item.quantity,
                price: item.cost,
                subtotal: item.quantity * item.cost
            }));

            return {
                receiptId: receipt._id,
                customerName: receipt.customer?.name || customer.name,
                date: receipt.createdAt.toLocaleDateString('vi-VN'),
                details: receiptDetails,
                staffName: receipt.staff?.name || 'Nhân viên đã xóa',
                total: receipt.detail.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
                createdAt: receipt.createdAt,
                updatedAt: receipt.updatedAt
            };
        });

        // 5. Trả về kết quả
        res.json({
            status: 'success',
            data: formattedReceipts
        });

    } catch (error) {
        console.error('Lỗi khi lấy hóa đơn:', error);
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi lấy thông tin hóa đơn',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}