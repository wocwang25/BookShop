const CartService = require('../services/cart.service');

const CartController = {
    async addToCart(req, res) {
        try {
            const userId = req.user.id;
            const { bookId, quantity } = req.body
            console.log(req.body)
            const item = { bookId, quantity }

            const result = await CartService.createOrUpdate(userId, item);
            res.json({
                message: "Thêm vào giỏ hàng thành công",
                data: result
            })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async getCartItems(req, res) {
        try {
            const userId = req.user.id;
            const cart = await CartService.getCartItems(userId);

            res.json(cart);
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    },

    async removeItem(req, res) {
        try {
            const userId = req.user.id;
            const bookId = req.params.bookId;

            const result = await CartService.removeItem(userId, bookId);
            res.json({
                message: "Xóa item thành công",
                data: result
            })
        } catch (error) {
            res.status(500).json({ error: error.message })

        }
    },

    async getItems(req, res) {
        try {
            const userId = req.user.id;
            const type = req.params.type;

            const cartItems = await CartService.getItems(userId, type);
            res.json(cartItems);

        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }
}

module.exports = CartController;