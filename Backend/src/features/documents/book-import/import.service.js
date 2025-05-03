const BookImport = require('./import.model');
const utils = require('./import.utils');

const handleBookImport = {
    create: async (details) => {
        utils.validateImportDetails(details);

        const { bookMap, categoryMap, authorMap } = await utils.fetchEntities(details);

        console.log(bookMap);
        const detailForSave = [];

        for (const item of details) {
            const book = bookMap.get(item.title);
            const category = categoryMap.get(item.category);
            const author = authorMap.get(item.author);

            await utils.validateBookImportItem(book, category, author, item);

            await utils.updateBookStock(book, item.quantity);

            detailForSave.push({
                book: book._id,
                category: category._id,
                author: author._id,
                quantity: item.quantity
            });
        }

        return detailForSave;
    },

    get: async (query) => {
        const bookImports = await BookImport.find(query)
            .populate({
                path: 'staff',
                select: 'name'
            })
            .populate({
                path: 'detail.book',
                select: 'title'
            })
            .populate({
                path: 'detail.category',
                select: 'name'
            })
            .populate({
                path: 'detail.author',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        // Format dữ liệu trả về
        const formattedBookImports = bookImports.map(bookimport => {
            const bookImportDetails = bookimport.detail.map((item, index) => ({
                stt: index + 1,
                book: item.book?.title || 'Đã xóa',
                category: item.category?.name || 'Đã xóa',
                author: item.author?.name || 'Đã xóa',
                quantity: item.quantity,
            }));

            return {
                bookImportID: bookimport._id,
                staffName: bookimport.staff?.name || staff.name,
                date: bookimport.createdAt.toLocaleDateString('vi-VN'),
                details: bookImportDetails,
                createdAt: bookimport.createdAt,
                updatedAt: bookimport.updatedAt
            };
        });
        console.log(formattedBookImports);

        return formattedBookImports;
    }
}

module.exports = handleBookImport;