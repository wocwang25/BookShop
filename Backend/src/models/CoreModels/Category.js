const mongoose = require('mongoose')
const Category_Middleware = require('../../middleware/categoryMdw');
const Category_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        bookCount: {
            type: Number,
            default: 0
        },
        featuredBook: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }]

    },
    {
        Timestamp: true,
        toJSON: { virtual: true },
        toObject: { virtual: true }
    }
);

Category_Schema.virtual('books', {
    ref: 'Book',
    localField: __dirname,
    foreignField: 'category',
    justOne: false
});

Category_Schema.pre('remove', Category_Middleware.removeCategoryReference);
Category_Schema.post('save', Category_Middleware.updateBookCount);

module.exports = mongoose.model('Category', Category_Schema);


