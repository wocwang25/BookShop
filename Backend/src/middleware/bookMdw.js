const mongoose = require('mongoose');

const Book_Middleware = {
    PreQueryHandle: async function (next) {
        try {
            const Author = mongoose.model('Author');
            const Category = mongoose.model('Category');

            // Handle Category -> tìm hoặc tạo mới 
            let category = await Category.findOne({ name: this.category });
            if (!category) {
                category = await Category.create({
                    name: this.category,
                    bookCount: 0
                });
            }

            // Handle Author -> tìm hoặc tạo mới
            let author = await Author.findOne({ name: this.author });
            if (!author) {
                author = await Author.create({
                    name: this.author,
                    bookCount: 0
                })
            }

            this.category = category._id;
            this.author = author._id;
            next()
        }
        catch (error) {
            next(error);
        }
    },

    PostQueryHandle: async function (doc) {
        const Author = mongoose.model('Author');
        const Category = mongoose.model('Category');

        await Category.findByIdAndUpdate(doc.category, {
            $inc: { bookCount: 1 },
            $addToSet: { featuredBook: doc._id }
        });

        await Author.findByIdAndUpdate(doc.author, {
            $inc: { bookCount: 1 },
            $addToSet: { book: doc._id }
        });
    }
}

module.exports = Book_Middleware;