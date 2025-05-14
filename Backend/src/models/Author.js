const mongoose = require('mongoose');

const Author_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        book: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }],
        bookCount: {
            type: Number,
            default: 0
        }
    },
    {
        Timestamp: true
    }
);

Author_Schema.pre('save', function (next) {
    try {
        this.bookCount = this.book ? this.book.length : 0;
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model('Author', Author_Schema);