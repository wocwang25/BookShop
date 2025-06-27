const Cart = require('../models/Cart');
const Book = require('../models/Book');

const CartService = {
    // Tạo mới hoặc thêm/cập nhật item trong giỏ hàng
    async createOrUpdate(userId, item) {
        try {
            const book = await Book.findById(item.bookId);
            if (!book) {
                throw new Error("Sách không tồn tại");
            }
            let cart = await Cart.findOne({ customer: userId });

            const cartItem = {
                book: book._id,
                price: book.price,
                type: item.type || 'buy', // Default to 'buy' if not specified
                quantity: item.quantity || 1
            };
            if (!cart) {
                // Nếu chưa có giỏ hàng, tạo mới
                cart = new Cart({
                    customer: userId,
                    items: [cartItem]
                });
            } else {
                // Sửa ở đây: so sánh với item.bookId
                const index = cart.items.findIndex(
                    cartItem => cartItem.book && cartItem.book.toString() === item.bookId
                );
                if (index > -1) {
                    cart.items[index].quantity += item.quantity > 0 ? item.quantity : 1;
                } else {
                    cart.items.push(cartItem);
                }
            }
            await cart.save();
            return cart.items;
        } catch (error) {
            throw error;
        }
    },

    // Xóa một item cụ thể khỏi giỏ hàng
    async removeItem(userId, bookId) {
        try {
            const cart = await Cart.findOne({ customer: userId });
            if (!cart) {
                throw new Error('Không tìm thấy giỏ hàng');
            }
            cart.items = cart.items.filter(
                item => !(item.book.toString() === bookId)
            );
            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    },

    async getCartItems(userId) {
        const cart = await Cart.findOne({ customer: userId })
            .populate({
                path: 'items.book',
                populate: [
                    { path: 'author', select: 'name' },
                    { path: 'category', select: 'name' }
                ]
            });
        if (!cart) {
            return [];
        }
        return cart.items;
    },

    async getItems(userId, type) {
        const cart = await Cart.findOne({ customer: userId })
            .populate({
                path: 'items.book',
                populate: [
                    { path: 'author', select: 'name' },
                    { path: 'category', select: 'name' }
                ]
            });
        if (!cart) {
            throw new Error('Không tìm thấy giỏ hàng');
        }
        const filteredItems = cart.items.filter(item => item.type === type);
        return filteredItems;
    }
}

module.exports = CartService;