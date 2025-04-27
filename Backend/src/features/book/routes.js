const express = require('express');
const router = express.Router();
const { addBook, searchBooks } = require('./controller');
const { isStaff } = require('../auth/middleware');
const { verifyToken } = require('../auth/middleware');

router.put('/addBook', verifyToken, isStaff, addBook);
router.get('/search', searchBooks);

module.exports = router;