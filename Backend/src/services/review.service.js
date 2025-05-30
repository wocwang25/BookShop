const Book = require('../models/Book');
const Review = require('../models/Review');
const CustomerAccount = require('../models/CustomerAccount');
const ReviewService = {
    async createReview(customerId, bookId, string, rating) {
        try {
            const customer = await CustomerAccount.findById(customerId);
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
                    select: 'email'
                })
                .select('content rating')

            return reviews;
        } catch (error) {
            throw error;
        }
    },

    async updateReview(customerId, bookId, content, rating) {
        try {
            const customer = await CustomerAccount.findById(customerId);
            if (!customer) {
                throw new Error("Không có dữ liệu khách hàng");
            }
            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Không có dữ liệu sách");
            }

            const review = await Review.findOneAndUpdate(
                { reviewer: customerId, book: bookId },
                {
                    $set: {
                        content: content,
                        rating: rating
                    }
                },
                { new: true }
            );
            return review;
        } catch (error) {
            throw error;
        }
    },

    async deleteReview(requesterId, bookId, role) {
        try {
            // Kiểm tra sách tồn tại
            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Không có dữ liệu sách");
            }

            let filter = { book: bookId };
            if (role !== 'admin') {
                // Nếu không phải admin, chỉ cho phép xóa review của chính mình
                filter.reviewer = requesterId;
            }

            const result = await Review.deleteOne(filter);
            if (result.deletedCount === 0) {
                throw new Error("Không tìm thấy review để xóa hoặc bạn không có quyền");
            }

            return { message: "Xóa review thành công" };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ReviewService;