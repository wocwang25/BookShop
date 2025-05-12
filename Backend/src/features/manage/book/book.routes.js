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

router.post('/', verifyToken, checkRole('staff'), createBook);
router.get('/', getAllBooks);
router.get('/search', searchBooks);
router.get('/:id', getBookById);
router.put('/:id', verifyToken, checkRole('staff'), updateBook);
router.delete('/:id', verifyToken, checkRole('staff'), deleteBook);
// router.patch('/:id/stock', verifyToken, checkRole, updateStock);

module.exports = router;