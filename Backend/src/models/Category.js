const mongoose = require('mongoose');

const Category_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
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
        timestamps: true,
        // toJSON: { virtuals: true },
        // toObject: { virtuals: true }
    }
);

// Virtual field for all books in this category
// Category_Schema.virtual('books', {
//     ref: 'Book',
//     localField: '_id',
//     foreignField: 'category'
// });

// Pre-save middleware to update bookCount
Category_Schema.pre('save', function (next) {
    try {
        this.bookCount = this.featuredBook ? this.featuredBook.length : 0;
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-remove middleware to handle book references
Category_Schema.pre('remove', async function (next) {
    try {
        // Remove category reference from all books
        await mongoose.model('Book').updateMany(
            { category: this._id },
            { $unset: { category: 1 } }
        );
        next();
    } catch (error) {
        next(error);
    }
});


module.exports = mongoose.model('Category', Category_Schema); 