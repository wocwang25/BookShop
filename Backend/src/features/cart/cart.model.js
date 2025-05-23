const mongoose = require('mongoose');

const CartItemSchema = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    quantity: {
        type: Number,
        default: 1
    },
    cost: Number,
    selected: {
        type: Boolean,
        default: false
    }
});

const CartSchema = mongoose.Schema({
    items: [CartItemSchema],
    total_cost: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
        default: 0
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

CartSchema.pre('save', async function (next) {
    try {
        let total = 0;
        let qty = 0;
        for (const item of this.items) {
            // if (item.selected) {
            total += (item.cost * item.quantity);
            qty += item.quantity;
            // }
        }
        this.total_cost = total;
        this.quantity = qty;
        next();
    } catch (error) {
        next(error);
    }
})

module.exports = mongoose.model('Cart', CartSchema)