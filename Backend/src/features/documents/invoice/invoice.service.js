const User = require('../../../models/User');
const Invoice = require('./invoice.model');
const utils = require('./invoice.utils');

const handleInvoice = {
    create: async (customerName, details) => {
        utils.validateInvoiceDetails(details);

        const customer = await User.findOne({ name: customerName });
        if (!customer) {
            const error = new Error("Khách hàng không tồn tại");
            error.status = 404;
            throw error;
        }

        utils.validateCustomerDebt(customer);

        const books = await utils.fetchAndValidateBooks(details);
        const { invoiceDetails, total_cost } = await utils.prepareInvoiceDetails(books, details);
        // console.log(customer, total_cost)
        customer.debt += total_cost;

        return { customer, invoiceDetails }
    },

    get: async (query) => {
        const invoices = await Invoice.find(query)
            .populate({
                path: 'staff',
                select: 'name'
            })
            .populate({
                path: 'customer',
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
            .sort({ createdAt: -1 });

        //Format dữ liệu trả về theo mẫu hóa đơn
        const formattedInvoice = invoices.map(invoice => {
            const invoiceDetails = invoice.detail.map((item, index) => ({
                stt: index + 1,
                book: item.book?.title || 'Đã xóa',
                category: item.category?.name || 'Đã xóa',
                quantity: item.quantity,
                price: item.cost,
                subtotal: item.quantity * item.cost
            }));

            return {
                receiptId: invoice._id,
                customerName: invoice.customer?.name || customer.name,
                date: invoice.createdAt.toLocaleDateString('vi-VN'),
                details: invoiceDetails,
                staffName: invoice.staff?.name || 'Nhân viên đã xóa',
                total: invoice.detail.reduce((sum, item) => sum + (item.quantity * item.cost), 0),
                createdAt: invoice.createdAt,
                updatedAt: invoice.updatedAt
            };
        });

        return formattedInvoice;
    }

}

module.exports = handleInvoice;