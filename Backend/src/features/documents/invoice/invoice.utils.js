const Book = require('../../../models/Book');
const Regulation = require('../regulation/regulation.model')
const utils = {
    validateUser: async (customer) => {
        if (!customer) {
            const error = new Error(`Khách hàng ${customer.name} không tồn tại`);
            error.status = 400;
            throw error;
        }
    },
    validateCustomerDebt: async (customer) => {
        const QD2 = await Regulation.findOne({ code: 'QD2' });
        if (customer.debt > QD2.value.max_debt) {
            const error = new Error(`Khách hàng ${customer.name} nợ quá ${QD2.value.max_debt}đ`);
            error.status = 400;
            throw error;
        }
    },

    validateInvoiceDetails: (details) => {
        if (!details || !Array.isArray(details) || details.length === 0) {
            const error = new Error("Danh sách sản phẩm không hợp lệ");
            error.status = 400;
            throw error;
        }
    },

    fetchAndValidateBooks: async (details) => {
        const titles = details.map(item => item.title);
        const books = await Book.find({ title: { $in: titles } }).populate('category');
        const QD2 = await Regulation.findOne({ code: 'QD2' });

        const bookMap = new Map();
        books.forEach(book => bookMap.set(book.title, book));

        for (const item of details) {
            const book = bookMap.get(item.title);
            if (!book) {
                const error = new Error(`Sách "${item.title}" chưa tồn tại trong hệ thống.`);
                error.status = 400;
                throw error;
            }
            if (book.stock - item.quantity < QD2.value.min_inventory_after_sale) {
                const error = new Error(`Lượng tồn kho sách "${item.title}" hiện tại (${book.stock})không đủ`);
                error.status = 400;
                throw error;
            }
        }

        return bookMap;
    },

    prepareInvoiceDetails: async (bookMap, details) => {
        const invoiceDetails = [];

        var total_cost = 0;

        for (const item of details) {
            const book = bookMap.get(item.title);
            book.stock -= item.quantity;
            await book.save();

            invoiceDetails.push({
                book: book._id,
                category: book.category,
                quantity: item.quantity,
                cost: book.cost.selling_price * item.quantity
            });
            total_cost += book.cost.selling_price * item.quantity;
        }
        // console.log(invoiceDetails, total_cost)

        return { invoiceDetails, total_cost };
    }
}

module.exports = utils;