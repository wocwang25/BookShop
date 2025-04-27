const BookImport = require('./bookImport.model');
const Book = require('../../../models/Book');
const Author = require('../../../models/Author')
const Category = require('../../../models/Category')

exports.createBookImport = async function (req, res) {
    try {
        const { details } = req.body;

        if (!details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'false',
                message: "Danh sách nhập kho không hợp lệ"
            });
        }

        const titles = details.map(item => item.title);
        const existingBooks = await Book.find({ title: { $in: titles } });

        // Tạo Map để lookup nhanh
        const bookMap = new Map();
        existingBooks.forEach(book => {
            bookMap.set(book.title, book);
        });

        const updatedBooks = [];

        for (const item of details) {
            const book = bookMap.get(item.title);

            if (!book) {
                return res.status(400).json({
                    status: 'false',
                    message: `Sách "${item.title}" chưa tồn tại trong hệ thống, vui lòng thêm sách trước.`
                });
            }

            if (item.quantity < 150) {
                return res.status(400).json({
                    status: 'false',
                    message: `Số lượng nhập tối thiểu là 150 cho sách "${item.title}"`
                });
            }

            if (book.stock >= 300) {
                return res.status(400).json({
                    status: 'false',
                    message: `Không thể nhập sách "${book.title}" vì tồn kho hiện tại đã >= 300`
                });
            }

            // Update stock
            book.stock += item.quantity;
            await book.save();

            updatedBooks.push({
                title: book.title,
                stock: book.stock
            });
        }

        // Tạo phiếu nhập kho
        const bookImport = new BookImport({
            staff: req.user.id,
            details
        });

        await bookImport.save();

        res.json({
            status: 'success',
            message: "Nhập kho thành công",
            data: {
                bookImport,
                updatedBooks
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};
