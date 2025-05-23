const BookImport = require('./import.model');
const utils = require('./import.utils');
const { InventoryReport } = require('../report/report.model');
const User = require('../../../models/User');

const handleBookImport = {
    create: async (details) => {
        utils.validateImportDetails(details);

        const { bookMap, categoryMap, authorMap } = await utils.fetchEntities(details);

        const detailForSave = [];
        const transactions = [];

        for (const item of details) {
            const book = bookMap.get(item.title);
            const category = categoryMap.get(item.category);
            const author = authorMap.get(item.author);

            await utils.validateBookImportItem(book, category, author, item);

            await utils.updateBookStock(book, item.quantity);

            transactions.push({
                type: 'import',
                quantity: item.quantity,
                book: book,

            });

            detailForSave.push({
                book: book._id,
                category: category._id,
                author: author._id,
                quantity: item.quantity
            });
        }

        return { detailForSave, transactions };
    },
    transact: async (transactions, staff_id, session) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const report = await InventoryReport.findOne({ month, year });
        const staff = await User.findById(staff_id);

        if (!report) throw new Error(`No inventory report found for ${month}/${year}`);

        for (const item of transactions) {
            const log = report.inventory_log.find(log => log.book.toString() === item.book._id.toString());

            if (log) {
                // Cập nhật tồn kho và thêm giao dịch mới
                log.current_stock += item.quantity;

                log.transactions.push({
                    type: 'import',
                    staff: staff.name, //Tên nhân viên nhập
                    quantity: item.quantity,
                    date: new Date()
                });
            } else {
                throw new Error(`Sách "${log.book.title}" chưa được cập nhật trong báo cáo tồn`);
            }
            // console.log(log);
        }

        await report.save({ session });
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