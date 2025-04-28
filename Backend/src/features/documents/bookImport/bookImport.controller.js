const BookImport = require('./bookImport.model');
const Book = require('../../../models/Book');
const Author = require('../../../models/Author')
const Category = require('../../../models/Category');
const User = require('../../../models/User');

exports.createBookImport = async function (req, res) {
    try {
        const { details } = req.body;

        if (!details || !Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: 'false',
                message: "Danh sách nhập kho không hợp lệ"
            });
        }

        // Lấy danh sách title, category, author
        const titles = details.map(item => item.title);
        const categoryNames = details.map(item => item.category);
        const authorNames = details.map(item => item.author);

        // Find trong DB
        const existingBooks = await Book.find({ title: { $in: titles } });
        const existingCategories = await Category.find({ name: { $in: categoryNames } });
        const existingAuthors = await Author.find({ name: { $in: authorNames } });

        const bookMap = new Map();
        existingBooks.forEach(book => bookMap.set(book.title, book));
        const categoryMap = new Map();
        existingCategories.forEach(cate => categoryMap.set(cate.name, cate));
        const authorMap = new Map();
        existingAuthors.forEach(auth => authorMap.set(auth.name, auth));

        const detailForSave = [];

        for (const item of details) {
            const book = bookMap.get(item.title);
            const category = categoryMap.get(item.category);
            const author = authorMap.get(item.author);

            if (!book || !category || !author) {
                return res.status(400).json({
                    status: 'false',
                    message: `Thông tin sách "${item.title}" không hợp lệ`
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

            detailForSave.push({
                book: book._id,
                category: category._id,
                author: author._id,
                quantity: item.quantity
            });
        }

        const bookImport = new BookImport({
            staff: req.user.id,
            detail: detailForSave
        });

        await bookImport.save();

        res.json({
            status: 'success',
            message: "Nhập kho thành công",
            data: bookImport
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};


exports.getBookImport = async function (req, res) {
    const { staff_name, date } = req.body;

    try {
        // 1. Tìm nhân viên
        const staff = await User.findOne({ name: staff_name });
        if (!staff) {
            return res.status(404).json({
                status: 'error',
                message: 'Nhân viên không tồn tại'
            });
        }

        // 2. Xây dựng query (sửa lỗi chính tả 'satff' -> 'staff')
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

        // 3. Tìm phiếu nhập (sửa lỗi populate)
        const bookImports = await BookImport.find(query)
            .populate({
                path: 'staff',
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
            .populate({
                path: 'detail.author',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        console.log(bookImports);
        // 4. Format dữ liệu trả về
        const formattedBookImports = bookImports.map(bookimport => {
            const bookImportDetails = bookimport.detail.map((item, index) => ({
                stt: index + 1,
                book: item.book?.title || 'Đã xóa',
                category: item.category?.name || 'Đã xóa',
                author: item.author?.name || 'Đã xóa',
                quantity: item.quantity,
            }));

            return {
                bookImportID: bookimport._id,
                staffName: bookimport.staff?.name || staff.name,
                date: bookimport.createdAt.toLocaleDateString('vi-VN'),
                details: bookImportDetails,
                createdAt: bookimport.createdAt,
                updatedAt: bookimport.updatedAt
            };
        });

        // 5. Trả về kết quả
        res.json({
            status: 'success',
            data: formattedBookImports
        });

    } catch (error) {
        console.error('Lỗi khi lấy phiếu nhập sách:', error);
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi lấy thông tin phiếu nhập sách',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}