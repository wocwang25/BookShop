const mongoose = require('mongoose');

const BookImportDetail_Schema = new mongoose.Schema(
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
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    },
    {
        autoIndex: true
    }
);

const BookImport_Schema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    importDate: {
        type: Date,
        default: Date.now,
    },
    detail: [BookImportDetail_Schema]
},
    {
        timestamps: true

    }
);

module.exports = mongoose.model('BookImport', BookImport_Schema);