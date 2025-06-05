const mongoose = require('mongoose');

const CartItem = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        },
        quantity: {
            type: Number,
            default: 1
        },
        type: {
            type: String,
            enum: ['buy', 'rent'],
            default: 'buy'
        },
        price: {
            type: Number
        },
        rentDuration: {
            type: Number,
            default: 10
        }
    },
    {
        _id: false
    }
);

const Cart = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        items: [CartItem],

    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Cart', Cart);
