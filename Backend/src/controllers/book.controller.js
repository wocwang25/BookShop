const BookService = require('../services/book.service');

const BookController = {
    // Thêm một sách
    async createBook(req, res) {
        try {
            const book = await BookService.findOrCreateBook(req.body);
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
            const { keyword } = req.body;
            const results = await BookService.searchBook({ keyword });
            res.status(201).json(results);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = BookController;