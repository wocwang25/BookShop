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

// const Transaction = require('../../../models/Transaction');

// BookImport_Schema.post('save', async function (doc, next) {
//     try {
//         const transaction = await new Transaction({
//             type: 'import',
//             book_import: doc._id,
//             staff: doc.staff,
//             date: doc.importDate
//         });
//         await transaction.save();
//     } catch (err) {
//         console.error('Failed to create import transaction:', err);
//     }
//     next();
// });


module.exports = mongoose.model('BookImport', BookImport_Schema);