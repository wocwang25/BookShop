const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const CategoryController = require('../controllers/category.controller');

router.get('/', CategoryController.getAllCategory);
router.get('/:id', CategoryController.getCategoryById);
router.post('/', AuthService.verifyToken, AuthService.checkRole('admin'), CategoryController.createCategory);
router.delete('/:id', AuthService.verifyToken, AuthService.checkRole('admin'), CategoryController.deleteCategory);

module.exports = router;
