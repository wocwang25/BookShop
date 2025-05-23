const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../../auth/auth.middleware');
const { createReview, getReviewsByBook, updateReview, deleteReview } = require('./review.controller');

router.post('/:id', verifyToken, createReview);
router.get('/:id', verifyToken, getReviewsByBook);
router.patch('/:id', verifyToken, updateReview);
router.delete('/:id', verifyToken, deleteReview);
module.exports = router;
