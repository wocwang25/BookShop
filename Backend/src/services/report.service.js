const Book = require('../models/Book')
const Customer = require('../models/Customer')
const BookImportSlip = require('../models/BookImportSlip')
const SalesInvoice = require('../models/SalesInvoice')
const PaymentReceipt = require('../models/PaymentReceipt')
const mongoose = require('mongoose');
const moment = require('moment');

const ReportService = {
    async getMonthlyInventoryReport(month, year) {
        if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
            throw new Error('Invalid month or year');
        }
        const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        // STEP 1: Get Imported Quantities
        const imported = await BookImportSlip.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.book',
                    imported: { $sum: '$items.quantity' }
                }
            }
        ]);

        // STEP 2: Get Sold Quantities
        const sold = await SalesInvoice.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.book',
                    sold: { $sum: '$items.quantity' }
                }
            }
        ]);

        console.log(imported)

        // Convert arrays to Map for easy lookup
        const importedMap = new Map(imported.map(item => [item._id.toString(), item.imported]));
        const soldMap = new Map(sold.map(item => [item._id.toString(), item.sold]));

        // STEP 3: Get all books with current stock
        const books = await Book.find({});

        // STEP 4: Build report
        const report = books.map(book => {
            const bookId = book._id.toString();
            const closingStock = book.currentStock;
            const importedQty = importedMap.get(bookId) || 0;
            const soldQty = soldMap.get(bookId) || 0;
            const openingStock = closingStock - importedQty + soldQty;

            return {
                bookId: book._id,
                title: book.title,
                openingStock,
                imported: importedQty,
                sold: soldQty,
                closingStock
            };
        });

        return report;
    },
    async getMonthlyDebtReport(month, year) {
        const startDate = new Date(year, month - 1, 1, 0, 0, 0); // yyyy-mm-01 00:00:00
        const endDate = new Date(year, month, 0, 23, 59, 59, 999); // yyyy-mm-last-day 23:59:59.999

        // 1. Tổng tiền bán hàng trong tháng cho từng khách hàng
        const salesAgg = await SalesInvoice.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$customer',
                    salesAmount: { $sum: '$totalAmount' }
                }
            }
        ]);

        // 2. Tổng tiền đã thu trong tháng
        const paymentAgg = await PaymentReceipt.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$customer',
                    amountPaid: { $sum: '$paymentAmount' }
                }
            }
        ]);

        // 3. Map dữ liệu lại
        const salesMap = new Map(salesAgg.map(e => [e._id.toString(), e.salesAmount]));
        const paymentMap = new Map(paymentAgg.map(e => [e._id.toString(), e.amountPaid]));

        // 4. Lấy danh sách tất cả khách hàng
        const customers = await Customer.find({});

        // 5. Tính toán báo cáo
        const report = customers.map(customer => {
            const id = customer._id.toString();
            const closingDebt = customer.debt;
            const salesAmount = salesMap.get(id) || 0;
            const amountPaid = paymentMap.get(id) || 0;
            const openingDebt = closingDebt - salesAmount + amountPaid;

            return {
                customerId: customer._id,
                name: customer.name,
                openingDebt,
                salesAmount,
                amountPaid,
                closingDebt
            };
        });

        return report;
    }
}

module.exports = ReportService