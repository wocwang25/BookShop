const Cart = require('./cart.model');
const Book = require('../../models/Book');
const User = require('../../models/User');

exports.addItem = async function (req, res) {
    try {
        const { bookId, quantity } = req.body;
        const userId = req.user.id; // giả sử đã có middleware xác thực

        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            cart = new Cart({
                customer: userId,
                items: [{ book: bookId, quantity: quantity, selected: false }]
            });
        } else {
            // Kiểm tra sách đã có trong cart chưa
            const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ book: bookId, quantity: quantity, selected: false });
            }
        }

        await cart.save();

        res.json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

exports.removeItem = async function (req, res) {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            })
        }
        // Kiểm tra sách đã có trong cart chưa
        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex > -1) {
            cart.items.splice(itemIndex, 1); // Xóa phần tử khỏi mảng
        }

        await cart.save();

        res.json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Tăng số lượng (+)
exports.increaseItemQuantity = async function (req, res) {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += 1;
        } else {
            cart.items.push({ book: bookId, quantity: 1, selected: false });
        }

        await cart.save();

        res.json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Giảm số lượng (-)
exports.decreaseItemQuantity = async function (req, res) {
    try {
        const { bookId } = req.body;
        const userId = req.user.id;

        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex > -1) {
            if (cart.items[itemIndex].quantity > 1) {
                cart.items[itemIndex].quantity -= 1;
            }
        }

        await cart.save();

        res.json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}

// Nhập số lượng mong muốn
exports.setItemQuantity = async function (req, res) {
    try {
        const { bookId, quantity } = req.body;
        const userId = req.user.id;

        if (quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Quantity must be at least 1'
            });
        }

        let cart = await Cart.findOne({ customer: userId });
        if (!cart) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            cart.items.push({ book: bookId, quantity: quantity, selected: false });
        }

        await cart.save();

        res.json({
            status: 'success',
            data: cart
        });
    } catch (error) {
        res.status(error.status || 500).json({
            status: 'error',
            message: error.message
        });
    }
}
