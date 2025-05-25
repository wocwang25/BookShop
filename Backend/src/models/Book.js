const mongoose = require('mongoose');

const Book_Schema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        publicationYear: Number,
        price: Number,
        currentStock: {
            type: Number,
            default: 0
        },
        description: String
    },
    {
        timestamps: true,
    }
);

Book_Schema.index({ title: 1 });
Book_Schema.index({ author: 1 });
Book_Schema.index({ category: 1 });

module.exports = mongoose.model('Book', Book_Schema);