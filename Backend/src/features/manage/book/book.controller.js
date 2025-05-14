const Book = require('../../../models/Book');
const Author = require('../../../models/Author');
const Category = require('../../../models/Category');
const mongoose = require('mongoose');
const { removeVietnameseTones } = require('../../../utils/removeVNtones');


exports.createBook = async (req, res) => {
    console.log(req.user)
    try {
        const bookData = req.body;
        const book = new Book(bookData);
        await book.save();

        res.status(201).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all books with pagination and filtering
exports.getAllBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.author) filter.author = req.query.author;
        if (req.query.search) {
            filter.$or = [
                { 'search.title_search': { $regex: req.query.search, $options: 'i' } },
                { 'search.author_search': { $regex: req.query.search, $options: 'i' } },
                { 'search.category_search': { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const books = await Book.find(filter)
            .populate('author', 'name')
            .populate('category', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ 'metadata.importedAt': -1 });

        const total = await Book.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: books,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
            .populate('author', 'name')
            .populate('category', 'name')
            .populate('rental_users', 'name email');

        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }

        res.status(200).json({
            success: true,
            data: book
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }

        // Nếu có cập nhật author, cần tìm hoặc tạo author mới
        if (req.body.author) {
            const Author = mongoose.model('Author');
            let author = await Author.findOne({ name: req.body.author });

            if (!author) {
                author = await new Author({
                    name: req.body.author,
                    book: book._id,
                });

                author.save();
            }

            // Chỉ lưu _id của author
            req.body.author = author._id;
            console.log(req.body.author)

        }

        // Nếu có cập nhật category, cần tìm hoặc tạo category mới
        if (req.body.category) {
            const Category = mongoose.model('Category');
            let category = await Category.findOne({ name: req.body.category });

            if (!category) {
                category = await Category.create({
                    name: req.body.category,
                    featuredBook: book._id,
                });

                category.save();
            }

            // Chỉ lưu _id của category
            req.body.category = category._id;
        }

        // Cập nhật search fields nếu title, author, hoặc category thay đổi
        if (req.body.title || req.body.author || req.body.category) {
            req.body.search = {
                ...book.search
            };

            if (req.body.title) {
                req.body.search.title_search = removeVietnameseTones(req.body.title);
            }
            if (req.body.author) {
                // Lấy tên author từ database
                const author = await Author.findById(req.body.author);
                if (author) {
                    req.body.search.author_search = removeVietnameseTones(author.name);
                }
            }
            if (req.body.category) {
                // Lấy tên category từ database
                const category = await Category.findById(req.body.category);
                if (category) {
                    req.body.search.category_search = removeVietnameseTones(category.name);
                }
            }
        }

        // Cập nhật metadata
        req.body.metadata = {
            ...book.metadata,
            lastUpdated: new Date()
        };

        // Cập nhật book
        const updatedBook = await Book.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('author', 'name')
            .populate('category', 'name');

        res.status(200).json({
            success: true,
            data: updatedBook
        });
    } catch (error) {
        console.error('Update error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};
// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }

        await book.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}; 