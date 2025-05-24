const mongoose = require('mongoose');

const PaymentReceipt = mongoose.Schema(
    {
        paymentDate: {
            type: Date,
            default: Date.now
        },
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
        note: String
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('PaymentReceipt', PaymentReceipt)