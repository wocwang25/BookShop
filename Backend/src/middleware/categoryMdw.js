const { default: mongoose } = require('mongoose');

const Category_Middleware = {
    removeCategoryReference: async function (next) {
        await mongoose.model('Book').updateMany(
            { category: this._id },
            { $unset: { category: 1 } }
        );
        next();
    },

    updateBookCount: async function (doc) {
        if (doc.isModified('name')) {
            const Book = mongoose.model('Book');
            const count = await Book.countDocuments({ category: doc._id });
            doc.bookCount = count;
            await doc.save();
        }
    }
};

module.exports = Category_Middleware;