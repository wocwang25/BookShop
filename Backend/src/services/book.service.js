const Book = require('../models/Book')
const Author = require('../models/Author')
const Category = require('../models/Category')

const BookService = {
    async findOrCreateCategory(name) {
        let category = await Category.findOne({ name });
        if (!category) {
            category = await new Category({ name });
            await category.save();
        }
        return category;
    },

    async findOrCreateAuthor(name) {
        let author = await Author.findOne({ name });
        if (!author) {
            author = await new Author({ name });
            await author.save();
        }
        return author;
    },

    async findOrCreateBook(data) {
        const { title, author, category, quantity } = data;

        let book = await Book.findOne({ title: title });
        const existing_author = this.findOrCreateAuthor(author);
        const existing_category = this.findOrCreateAuthor(category);

        if (!book) {
            book = new Book({
                title: title,
                author: existing_author,
                category: existing_category,
                currentStock: quantity
            })

            await book.save();
        }
        return book;
    }
}

module.exports = BookService;