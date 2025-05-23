const Book = require('../../../models/Book');
const Author = require('../../../models/Author')
const Category = require('../../../models/Category');
const Regulation = require('../regulation/regulation.model')
const utils = {

    validateImportDetails: (details) => {
        if (!details || !Array.isArray(details) || details.length === 0) {
            const error = new Error("Danh sách nhập kho không hợp lệ");
            error.status = 400;
            throw error;
        }
    },

    fetchEntities: async (details) => {
        const titles = details.map(d => d.title);
        const categories = details.map(d => d.category);
        const authors = details.map(d => d.author);
        const [books, categoryDocs, authorDocs] = await Promise.all([
            Book.find({ title: { $in: titles } }),
            Category.find({ name: { $in: categories } }),
            Author.find({ name: { $in: authors } })
        ]);

        const bookMap = new Map(books.map(b => [b.title, b]));
        const categoryMap = new Map(categoryDocs.map(c => [c.name, c]));
        const authorMap = new Map(authorDocs.map(a => [a.name, a]));
        return { bookMap, categoryMap, authorMap };
    },

    validateBookImportItem: async (book, category, author, item) => {
        const QD1 = await Regulation.findOne({ code: 'QD1' });
        if (!book || !category || !author) {
            const error = new Error(`Thông tin sách "${item.title}" không hợp lệ`);
            error.status = 400;
            throw error;
        }

        if (item.quantity < QD1.value.min_import_quantity) {
            const error = new Error(`Số lượng nhập tối thiểu là ${QD1.value.min_import_quantity} cho sách "${item.title}"`);
            error.status = 400;
            throw error;
        }

        if (book.stock >= QD1.value.min_inventory_before_import) {
            const error = new Error(`Không thể nhập sách "${item.title}" vì tồn kho đã >= ${QD1.value.min_inventory_before_import}`);
            error.status = 400;
            throw error;
        }
    },

    updateBookStock: async (book, quantity) => {
        // console.log(book)
        book.stock += quantity;
        await book.save();
    }
}
module.exports = utils;
