const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const ReviewController = require('../controllers/review.controller');

// Lấy tất cả review của một sách
router.get('/:id', ReviewController.getAllReviewByBookId);

// Tạo review mới cho một sách (cần đăng nhập)
router.post('/:id', AuthService.verifyToken, ReviewController.createReview);

// Cập nhật review (cần đăng nhập)
router.patch('/:id', AuthService.verifyToken, ReviewController.updateReview);

// Xóa review (cần đăng nhập)
router.delete('/:id', AuthService.verifyToken, ReviewController.deleteReview);
module.exports = router;