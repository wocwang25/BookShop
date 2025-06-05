const mongoose = require('mongoose');

const SalesItem = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unitPrice: {
        type: Number,
        required: true
    }
}, {
    _id: false
}
);

const SalesInvoice = mongoose.Schema(
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
        totalAmount: Number,
        items: [SalesItem],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('SalesInvoice', SalesInvoice)
