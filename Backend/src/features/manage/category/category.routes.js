// features/categories/category.routes.js
const express = require('express');
const router = express.Router();
const {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    addFeaturedBook,
    removeFeaturedBook
} = require('./category.controller');
const { verifyToken, checkRole } = require('../../auth/middleware');

// Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

// Protected routes
router.post('/', verifyToken, checkRole('staff'), createCategory);
router.put('/:id', verifyToken, checkRole('staff'), updateCategory);
router.delete('/:id', verifyToken, checkRole('staff'), deleteCategory);
router.post('/:id/featured', verifyToken, checkRole('staff'), addFeaturedBook);
router.delete('/:id/featured', verifyToken, checkRole('staff'), removeFeaturedBook);

module.exports = router;