const express = require('express');
const router = express.Router();

const BookRoutes = require('./book/book.routes');
const CategoryRoutes = require('./category/category.routes');

router.use('/book', BookRoutes);
router.use('/category', CategoryRoutes);

module.exports = router;