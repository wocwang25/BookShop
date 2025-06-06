const mongoose = require('mongoose');

const RentalItem = mongoose.Schema(
    {
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
        bookCopy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BookCopy',
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }, {
    _id: false
}
)

const RentalInvoice = mongoose.Schema(
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
        startDate: {
            type: Date,
            default: Date.now
        },
        dueDate: {
            type: Date,
            default: null
        },
        returnDate: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            enum: ['active', 'returned'],
            default: 'active'
        },
        totalAmount: Number,
        items: [RentalItem],
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('RentalInvoice', RentalInvoice)