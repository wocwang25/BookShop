const ReviewService = require('../services/review.service');

const ReviewController = {
    async createReview(req, res) {
        try {
            const customerId = req.user.id;
            const bookId = req.params.bookId;
            const { rating, comment } = req.body;

            const results = await ReviewService.createReview(customerId, bookId, comment, rating);
            res.json(results)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllReviewByBookId(req, res) {
        try {
            const bookId = req.params.bookId;
            const results = await ReviewService.getAllReviewByBookId(bookId);
            res.json({ reviews: results });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateReview(req, res) {
        try {
            const customerId = req.user.id;
            const reviewId = req.params.reviewId;
            const { rating, comment } = req.body;

            const results = await ReviewService.updateReview(customerId, reviewId, comment, rating);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteReview(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.reviewId;
            const role = req.user.role;

            const results = await ReviewService.deleteReview(userId, reviewId, role);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ReviewController;