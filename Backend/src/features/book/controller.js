const Book = require('../../models/Book');
const { removeVietnameseTones } = require('../../utils/removeVNtones');

exports.addBook = async function (req, res) {
    try {
        const {
            title,
            author,
            category,
            cost,
            description,
            image_url
        } = req.body; // lấy trực tiếp từ body luôn

        const book = new Book({
            title,
            author,
            category,
            cost,
            description,
            image_url
        });

        await book.save();

        res.status(201).json({
            status: 'success',
            message: "Add book into database successfully",
            data: book
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message
        });
    }
}

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
        }).limit(5);

        res.json({
            status: 'success',
            results: books.length,
            data: books
        });

    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: error.message
        });
    }
}
