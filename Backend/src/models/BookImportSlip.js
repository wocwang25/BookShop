const mongoose = require('mongoose');

const ImportItem = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        unitImportPrice: {
            type: Number,
            required: true
        }
    },
    {
        _id: false
    }
);

const BookImportSlip = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        totalItem: {
            type: Number,
            default: 0
        },
        items: [ImportItem]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('BookImportSlip', BookImportSlip);