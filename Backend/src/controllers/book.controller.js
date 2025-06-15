const Book = require('../models/Book');
const BookService = require('../services/book.service');

const BookController = {
    // Thêm một sách
    async createBook(req, res) {
        try {
            const book = await BookService.findOrCreateBook(req.body);
            console.log(book);
            res.status(201).json(book);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Nhập từ file CSV
    async importBooksFromCSV(req, res) {
        try {
            const file = req.file; // file CSV gửi từ frontend (sử dụng multer)
            const result = await BookService.importFromCSV(file.path);
            res.status(200).json({ message: "Imported successfully", result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async searchBook(req, res) {
        try {
            const { keyword } = req.query; // Sử dụng query thay vì body cho GET request
            const results = await BookService.searchBook({ keyword });
            res.status(200).json({
                success: true,
                books: results.Books,
                total: results.total
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },

    // Lấy sách theo ID
    async getBookById(req, res) {
        try {
            const { id } = req.params;
            const book = await BookService.getBookById(id);
            if (!book) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }
            res.status(200).json({
                success: true,
                book: book
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },

    // Lấy all sách
    async getAllBook(req, res) {
        try {
            // Lấy limit và sort từ query params (nếu có)
            const limit = parseInt(req.query.limit) || 0;
            const sort = req.query.sort || '-createdAt';

            let query = Book.find({})
                .populate({
                    path: 'author',
                    select: 'name'
                })
                .populate({
                    path: 'category',
                    select: 'name'
                });

            // Áp dụng sort nếu có
            if (sort) {
                query = query.sort(sort);
            }

            // Áp dụng limit nếu có
            if (limit > 0) {
                query = query.limit(limit);
            }

            const books = await query;

            if (!books) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }
            res.status(200).json({
                success: true,
                books: books
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },

    // Cập nhật sách
    async updateBook(req, res) {
        try {
            const { id } = req.params;
            const updatedBook = await BookService.updateBook(id, req.body);
            if (!updatedBook) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }
            res.status(200).json({
                success: true,
                book: updatedBook
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    },

    // Xóa sách
    async deleteBook(req, res) {
        try {
            const { id } = req.params;
            const deletedBook = await BookService.deleteBook(id);
            if (!deletedBook) {
                return res.status(404).json({
                    success: false,
                    message: "Book not found"
                });
            }
            res.status(200).json({
                success: true,
                message: "Book deleted successfully"
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = BookController;