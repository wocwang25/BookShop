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
    },

    async searchBook({ keyword = '', page = 1, limit = 10 }) {
        console.log(keyword)

        let filter = {};

        if (keyword) {
            const regex = new RegExp(keyword, 'i'); // tìm kiếm không phân biệt hoa thường

            // 1. Tìm authorId theo tên
            const authors = await Author.find({ name: regex }).select('_id');
            const authorIds = authors.map(a => a._id);

            // 2. Tìm categoryId theo tên
            const categories = await Category.find({ name: regex }).select('_id');
            const categoryIds = categories.map(c => c._id);

            // 3. Xây dựng filter cho Book
            filter = {
                $or: [
                    { title: regex },
                    { author: { $in: authorIds } },
                    { category: { $in: categoryIds } }
                ]
            };
        }

        const skip = (page - 1) * limit;

        const books = await Book.find(filter)
            .populate({
                path: 'author',
                select: 'name'
            })
            .populate({
                path: 'category',
                select: 'name'
            })
            .skip(skip)
            .limit(limit);

        // Transform data để phù hợp với frontend
        const transformedBooks = books.map(book => ({
            _id: book._id,
            title: book.title,
            author: book.author?.name || 'Unknown',
            genre: book.category?.name || 'Unknown',
            price: book.price,
            quantity: book.currentStock,
            description: book.description,
            publishedYear: book.publicationYear,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        }));

        const total = await Book.countDocuments(filter);

        return transformedBooks;
    },

    async getBookById(id) {
        const book = await Book.findById(id)
            .populate({
                path: 'author',
                select: 'name'
            })
            .populate({
                path: 'category',
                select: 'name'
            });

        if (!book) {
            return null;
        }

        // Transform data để phù hợp với frontend
        return {
            _id: book._id,
            title: book.title,
            author: book.author?.name || 'Unknown',
            genre: book.category?.name || 'Unknown',
            price: book.price,
            quantity: book.availableStock,
            description: book.description,
            publishedYear: book.publicationYear,
            createdAt: book.createdAt,
            updatedAt: book.updatedAt
        };
    },

    async updateBook(id, data) {
        const {
            title,
            author,
            category,
            description,
            price,
            publicationYear,
        } = data;

        let authorDoc, categoryDoc;

        if (author) {
            authorDoc = await this.findOrCreateAuthor(author);
        }

        if (category) {
            categoryDoc = await this.findOrCreateCategory(category);
        }

        const updateData = {};
        if (title) updateData.title = title;
        if (authorDoc) updateData.author = authorDoc._id;
        if (categoryDoc) updateData.category = categoryDoc._id;
        if (description) updateData.description = description;
        if (price) updateData.price = price;
        if (publicationYear) updateData.publicationYear = publicationYear;

        const updatedBook = await Book.findByIdAndUpdate(id, updateData, { new: true })
            .populate('author', 'name')
            .populate('category', 'name');

        if (!updatedBook) {
            return null;
        }

        // Transform data để phù hợp với frontend
        return {
            _id: updatedBook._id,
            title: updatedBook.title,
            author: updatedBook.author?.name || 'Unknown',
            genre: updatedBook.category?.name || 'Unknown',
            price: updatedBook.price,
            description: updatedBook.description,
            publishedYear: updatedBook.publicationYear,
            createdAt: updatedBook.createdAt,
            updatedAt: updatedBook.updatedAt
        };
    },

    async deleteBook(id) {
        return await Book.findByIdAndDelete(id);
    }
}

module.exports = BookService;