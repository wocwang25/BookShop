const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require('../models/User');
const ReviewService = {
    async createReview(customerId, bookId, string, rating) {
        try {
            const customer = await User.findById(customerId);
            if (!customer) {
                throw new Error("Không có dữ liệu khách hàng");
            }
            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Không có dữ liệu sách");
            }

            const exist = await Review.findOne({ reviewer: customerId, book: bookId });
            if (exist) {
                throw new Error("Bạn đã review sách này");
            }

            const review = await new Review({
                reviewer: customer._id,
                book: book._id,
                content: string,
                rating: rating
            })

            await review.save();
            return review;
        } catch (error) {
            throw error;
        }
    },

    async getAllReviewByBookId(bookId) {
        try {
            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Không có dữ liệu sách");
            }

            const reviews = await Review.find({ book: bookId })
                .populate({
                    path: 'reviewer',
                    select: 'name email'
                })
            return reviews;
        } catch (error) {
            throw error;
        }
    },

    async updateReview(customerId, reviewId, content, rating) {
        try {
            const customer = await User.findById(customerId);
            if (!customer) {
                throw new Error("Không có dữ liệu khách hàng");
            }

            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error("Không tìm thấy review");
            }

            // Chỉ cho phép chủ review hoặc admin sửa (nếu cần)
            if (review.reviewer.toString() !== customerId) {
                throw new Error("Bạn không có quyền sửa review này");
            }

            review.content = content;
            review.rating = rating;
            await review.save();

            return review;
        } catch (error) {
            throw error;
        }
    },

    async deleteReview(requesterId, reviewId, role) {
        try {
            const review = await Review.findById(reviewId);
            if (!review) {
                throw new Error("Không tìm thấy review");
            }

            // Nếu không phải admin, chỉ cho phép xóa review của chính mình
            if (role !== 'admin' && review.reviewer.toString() !== requesterId) {
                throw new Error("Bạn không có quyền xóa review này");
            }

            await Review.deleteOne({ _id: reviewId });

            return { message: "Xóa review thành công" };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ReviewService;