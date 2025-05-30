const ReviewService = require('../services/review.service');

const ReviewController = {
    async createReview(req, res) {
        try {
            const customerId = req.user.id;
            const bookId = req.params.id;
            const { review, rating } = req.body;

            const results = await ReviewService.createReview(customerId, bookId, review, rating);
            res.json(results)
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getAllReviewByBookId(req, res) {
        try {
            const bookId = req.params.id;
            const results = await ReviewService.getAllReviewByBookId(bookId);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async updateReview(req, res) {
        try {
            const customerId = req.user.id;
            const bookId = req.params.id;
            const { review, rating } = req.body;

            const results = await ReviewService.updateReview(customerId, bookId, review, rating);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async deleteReview(req, res) {
        try {
            const userId = req.user.id;
            const reviewId = req.params.id;
            const role = req.user.role;

            const results = await ReviewService.deleteReview(userId, reviewId, role);
            res.json(results);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ReviewController;