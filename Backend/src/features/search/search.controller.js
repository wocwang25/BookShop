const Author = require('../../models/Author');
const Book = require('../../models/Book');
const Category = require('../../models/Category');
const { removeVietnameseTones } = require('../../utils/removeVNtones');

exports.searchBooks = async function (req, res) {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({
            status: 'error',
            message: "Vui lòng nhập từ khóa tìm kiếm"
        });
    }

    try {
        const normalizedQuery = removeVietnameseTones(query);

        // Nếu nhiều từ thì tách ra
        const keywords = normalizedQuery.split(' ').filter(Boolean);

        const regexConditions = keywords.map(word => ({
            $or: [
                { 'search.title_search': { $regex: word, $options: 'i' } },
                { 'search.author_search': { $regex: word, $options: 'i' } },
                { 'search.category_search': { $regex: word, $options: 'i' } }
            ]
        }));

        const books = await Book.find({
            $and: regexConditions
        })
            .limit(5)
            .select('title author category stock');

        // Lấy tất cả authorId và categoryId duy nhất
        const authorIds = [...new Set(books.map(b => b.author))];
        const categoryIds = [...new Set(books.map(b => b.category))];

        // Query song song
        const [authors, categories] = await Promise.all([
            Author.find({ _id: { $in: authorIds } }).select('name'),
            Category.find({ _id: { $in: categoryIds } }).select('name')
        ]);

        // Biến thành một cặp [id, name]
        const authorMap = new Map(authors.map(a => [a._id.toString(), a.name]));
        const categoryMap = new Map(categories.map(c => [c._id.toString(), c.name]));

        const filteredBooks = books.map(book => ({
            title: book.title,
            author: authorMap.get(book.author) || 'Unknown',
            category: categoryMap.get(book.category) || 'Unknown',
            stock: book.stock
        }));

        res.json({
            status: 'success',
            results: books.length,
            data: filteredBooks
        });

    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: error.message
        });
    }
}

