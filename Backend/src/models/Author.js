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

Author_Schema.virtual('updateBookCount').get(function () {
    this.bookCount = this.book.length();
    return this.bookCount;
})

module.exports = mongoose.model('Author', Author_Schema);