const mongoose = require('mongoose');

const SalesItem = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    },
    subTotal: {
        type: Number,
        default: function () {
            return this.quantity * this.unitPrice;
        }
    }
});

const SalesInvoice = mongoose.Schema(
    {
        invoiceDate: {
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
        totalAmount: Number,
        items: [SalesItem],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('SalesInvoice', SalesInvoice)
