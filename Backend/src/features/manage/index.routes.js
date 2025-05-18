const express = require('express');
const router = express.Router();

const BookRoutes = require('./book/book.routes');
const CategoryRoutes = require('./category/category.routes');
const AdminRoutes = require('./admin/admin.routes')

router.use('/book', BookRoutes);
router.use('/category', CategoryRoutes);
router.use('/admin', AdminRoutes);

module.exports = router;