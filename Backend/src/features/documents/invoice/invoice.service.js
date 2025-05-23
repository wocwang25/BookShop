const User = require('../../../models/User');
const { DebtReport, InventoryReport } = require('../report/report.model');
const Invoice = require('./invoice.model');
const utils = require('./invoice.utils');

const invoiceService = {
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
        const { invoiceDetails, total_cost, export_transaction } = await utils.prepareInvoiceDetails(books, details);

        customer.debt += total_cost;
        // await customer.save(); // Chỉ gọi nếu muốn cập nhật ngay

        const addDebt_transaction = {
            type: 'add_debt',
            amount: total_cost,
            customer: customer // hoặc customer._id tùy vào cách xử lý sau đó
        };

        const transactions = { addDebt_transaction, export_transaction };

        return { customer, invoiceDetails, transactions };
    }
    ,

    transact: async (transactions, staff_id, session) => {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const staff = await User.findById(staff_id);

        const inventory_report = await InventoryReport.findOne({ month, year });
        const debt_report = await DebtReport.findOne({ month, year });

        if (!inventory_report) throw new Error(`No inventory report found for ${month}/${year}`);
        if (!debt_report) throw new Error(`No debt report found for ${month}/${year}`);

        // --- Xử lý xuất kho ---
        for (const item of transactions.export_transaction) {
            const inventory_log = inventory_report.inventory_log.find(log => log.book.toString() === item.book._id.toString());

            if (inventory_log) {
                inventory_log.current_stock -= item.quantity;

                inventory_log.transactions.push({
                    type: 'export',
                    staff: staff.name,
                    quantity: item.quantity,
                    date: new Date()
                });
            } else {
                throw new Error(`Sách ID "${item.book.title}" chưa được cập nhật trong báo cáo tồn`);
            }
        }

        // --- Xử lý cập nhật nợ ---
        const debtLog = debt_report.debt_log.find(log => log.customer.toString() === transactions.addDebt_transaction.customer._id.toString());

        if (debtLog) {
            debtLog.closing_debt += transactions.addDebt_transaction.amount;

            debtLog.transactions.push({
                type: transactions.addDebt_transaction.type,
                staff: staff.name,
                amount: transactions.addDebt_transaction.amount,
                date: new Date()
            });
        } else {
            throw new Error(`Khách hàng ID "${transactions.addDebt_transaction.customer.name}" chưa được cập nhật trong báo cáo nợ`);
        }

        await inventory_report.save();
        await debt_report.save();
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

module.exports = invoiceService;