const mongoose = require('mongoose');

const PaymentReceipt = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        paymentAmount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['BUY', 'RENT'],
            default: 'BUY'
        },
        note: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('PaymentReceipt', PaymentReceipt)