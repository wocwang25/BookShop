const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema({
    reviewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    content: {
        type: String,
        trim: true,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Review', ReviewSchema);