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
        type: ['buy', 'rent'],
        priceForBuy: Number,
        priceForRent: Number
    }
);

const Cart = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer'
        }
    }
)