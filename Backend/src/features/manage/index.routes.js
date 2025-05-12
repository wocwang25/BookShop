const express = require('express');
const router = express.Router();

const BookRoutes = require('./book/book.routes');

router.use('/book', BookRoutes);

module.exports = router;