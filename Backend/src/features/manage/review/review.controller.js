const User = require('../../../models/User');
const Book = require('../../../models/Book');
const Review = require('./review.model');
exports.createReview = async function (req, res) {
    try {
        const review_details = req.body;
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        // Kiểm tra sách tồn tại
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({
                status: 'error',
                message: 'Book not found'
            });
        }
        const review = new Review({
            reviewer: user._id,
            book: book._id,
            content: review_details.content,
            rating: review_details.rating
        });
        await review.save();
        res.json({
            status: 'success',
            data: review
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.getReviewsByBook = async function (req, res) {
    try {
        const bookId = req.params.id
        const reviews = await Review.find({ book: bookId })
            .populate({ path: 'reviewer', select: 'name' })
            .select('content rating date')

        res.json({
            status: 'success',
            data: reviews
        })

    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.updateReview = async function (req, res) {
    try {
        const review_details = req.body;
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found'
            });
        }
        if (!review.reviewer.equals(req.user.id)) {
            return res.status(400).json({
                status: 'error',
                message: 'You have no permission to adjust this review'
            });
        }

        review.content = review_details.content;
        if (review_details.rating !== undefined) {
            review.rating = review_details.rating;
        }
        await review.save();

        res.json({
            status: 'success',
            data: review
        })

    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.deleteReview = async function (req, res) {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found'
            });
        }

        if (
            !review.reviewer.equals(req.user.id) &&
            req.user.role !== 'admin' &&
            req.user.role !== 'staff'
        ) {
            return res.status(400).json({
                status: 'error',
                message: 'You have no permission to adjust this review'
            });
        }

        await Review.findByIdAndDelete(req.params.id);

        res.json({
            status: 'success',
            message: "Delete review successfully"
        })

    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}