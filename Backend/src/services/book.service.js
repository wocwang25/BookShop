const Book = require('../models/Book');
const Author = require('../models/Author');
const Category = require('../models/Category');
const csv = require("csv-parser");
const fs = require("fs");

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
        const {
            title,
            author,
            category,
            description,
            price,
            publicationYear
        } = data;

        if (!title || !author || !category) {
            throw new Error("Title, author, and category are required");
        }

        const authorDoc = await this.findOrCreateAuthor(author);
        const categoryDoc = await this.findOrCreateCategory(category);

        // Tìm sách theo tiêu đề
        let book = await Book.findOne({ title });

        if (!book) {
            book = new Book({
                title,
                author: authorDoc._id,
                category: categoryDoc._id,
                description,
                price,
                publicationYear
            });

            await book.save();
        }

        return book;
    },
    async importFromCSV(filePath) {
        const rows = [];
        const results = [];
        const errors = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    rows.push(row); // thu thập dữ liệu trước
                })
                .on("end", async () => {
                    for (const row of rows) {
                        try {
                            const book = await this.findOrCreateBook(row);
                            results.push(book);
                        } catch (err) {
                            errors.push({ row, error: err.message });
                        }
                    }
                    resolve({ successCount: results.length, data: results, failed: errors });
                })
                .on("error", reject);
        });
    }

}

module.exports = BookService;