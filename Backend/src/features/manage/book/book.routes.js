const express = require('express');
const router = express.Router();
const { createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook,
} = require('./book.controller');
const { searchBooks } = require('../../search/search.controller');
const { verifyToken, checkRole } = require('../../auth/middleware');

// Public routes
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);

// Protected routes
router.post('/', verifyToken, checkRole('staff'), createBook);
router.put('/:id', verifyToken, checkRole('staff'), updateBook);
router.delete('/:id', verifyToken, checkRole('staff'), deleteBook);

module.exports = router;