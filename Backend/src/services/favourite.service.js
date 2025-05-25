const CustomerAccount = require('../models/CustomerAccount');
const FavouriteBook = require('../models/Favourite');
const Book = require('../models/Book');

const FavouriteService = {
    async addBookToFavourite(customerId, bookId) {
        try {
            const customer = await CustomerAccount.findById(customerId);
            if (!customer) {
                throw new Error("Dữ liệu khách hàng không hợp lệ");
            }

            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Sách không tồn tại");
            }

            let favouriteBook = await FavouriteBook.findOne({ customer: customer._id });
            if (!favouriteBook) {
                favouriteBook = new FavouriteBook({
                    customer: customer._id,
                    items: []
                });
            }

            // Kiểm tra đã có trong danh sách yêu thích chưa
            const existed = favouriteBook.items.some(
                item => item.book.toString() === book._id.toString()
            );
            if (existed) {
                throw new Error("Sách đã có trong danh sách yêu thích");
            }

            favouriteBook.items.push({ book: book._id });
            await favouriteBook.save();

            return { message: "Đã thêm sách vào danh sách yêu thích" };
        } catch (error) {
            throw error;
        }
    },

    async removeBookFromFavourite(customerId, bookId) {
        try {
            const customer = await CustomerAccount.findById(customerId);
            if (!customer) {
                throw new Error("Dữ liệu khách hàng không hợp lệ");
            }

            const book = await Book.findById(bookId);
            if (!book) {
                throw new Error("Sách không tồn tại");
            }

            const favouriteBook = await FavouriteBook.findOne({ customer: customer._id });
            if (!favouriteBook) {
                throw new Error("Danh sách yêu thích không tồn tại");
            }

            const existed = favouriteBook.items.some(
                item => item.book.toString() === book._id.toString()
            );
            if (!existed) {
                throw new Error("Sách không có trong danh sách yêu thích");
            }

            // Xóa book khỏi mảng items
            await FavouriteBook.updateOne(
                { customer: customer._id },
                { $pull: { items: { book: book._id } } }
            );
            await favouriteBook.save();

            return { message: "Đã xóa sách khỏi danh sách yêu thích" };
        } catch (error) {
            throw error;
        }
    },

    async getBookFavouriteList(customerId) {
        try {
            const customer = await CustomerAccount.findById(customerId);
            if (!customer) {
                throw new Error("Dữ liệu khách hàng không hợp lệ");
            }

            const list = await FavouriteBook.findOne({ customer: customer._id })
                .populate({
                    path: 'items.book',
                    select: 'title currentStock',
                    populate: [
                        { path: 'author', select: 'name' },
                        { path: 'category', select: 'name' }
                    ]
                })
                .lean();

            // Nếu chưa có danh sách yêu thích, trả về mảng rỗng
            if (!list) return [];

            // Trả về mảng sách đã populate
            return list.items.map(item => item.book);
        } catch (error) {
            throw error;
        }
    },
};

module.exports = FavouriteService;