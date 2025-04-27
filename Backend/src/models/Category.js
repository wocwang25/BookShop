const mongoose = require('mongoose')
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

Category_Schema.pre('remove', async function (next) {
    await mongoose.model('Book').updateMany(
        { category: this._id },
        { $unset: { category: 1 } }
    );
    next();
});
Category_Schema.post('save', async function (doc) {
    if (doc.isModified('name')) {
        const Book = mongoose.model('Book');
        const count = await Book.countDocuments({ category: doc._id });
        doc.bookCount = count;
        await doc.save();
    }
});

module.exports = mongoose.model('Category', Category_Schema);


