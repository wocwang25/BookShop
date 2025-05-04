const { DebtReport, InventoryReport } = require('./report.model');
const User = require('../../../models/User');
const Book = require('../../../models/Book');

const Report = {
    createReport: async function (req, res) {
        try {
            const books = await Book.find();
            const customers = await User.find({ role: 'customer' });

            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            // Kiểm tra báo cáo đã tồn tại chưa
            const [existingInventoryReport, existingDebtReport] = await Promise.all([
                InventoryReport.findOne({ month, year }),
                DebtReport.findOne({ month, year })
            ]);

            if (existingInventoryReport || existingDebtReport) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Báo cáo tháng này đã tồn tại'
                });
            }

            // Tạo các InventoryLog
            const inventoryLogs = books.map(book => ({
                book: book._id,
                openning_stock: book.stock,
                current_stock: book.stock,
                transactions: []
            }));

            const inventoryReport = new InventoryReport({
                staff: req.user.id,
                inventory_log: inventoryLogs,
                month,
                year,
                date: now
            });
            await inventoryReport.save();

            // Tạo các DebtLog
            const debtLogs = [];
            for (const customer of customers) {
                debtLogs.push({
                    customer: customer._id,
                    opening_debt: customer.debt,
                    closing_debt: customer.debt,
                    transactions: []
                });
            }

            const debtReport = new DebtReport({
                staff: req.user.id,
                debt_log: debtLogs,
                month,
                year,
                date: now
            });
            await debtReport.save();

            res.status(200).json({
                status: 'success',
                message: 'Tạo báo cáo đầu tháng thành công'
            });

        } catch (error) {
            console.error('Lỗi khi tạo báo cáo đầu tháng:', error);
            res.status(500).json({
                status: 'error',
                message: 'Đã xảy ra lỗi khi tạo báo cáo đầu tháng',
                error: error.message
            });
        }
    },

    getDebtReport: async function (req, res) {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();

            const debt_report = await DebtReport.findOne({ month, year }).populate('debt_log.customer', 'name');
            if (!debt_report) throw new Error(`No debt report found for ${month}/${year}`);

            const customer_debtLog = debt_report.debt_log.map(log => ({
                customer_name: log.customer.name, // giờ đã có name
                opening_debt: log.opening_debt,
                transactions: log.transactions,
                closing_debt: log.closing_debt
            }));

            const formatedReport = {
                month: debt_report.month,
                year: debt_report.year,
                list_debt: customer_debtLog
            }

            res.status(200).json({
                status: 'success',
                data: formatedReport
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            });
        }
    },

    getInventoryReport: async function (req, res) {
        try {
            const now = new Date();
            const month = now.getMonth() + 1;
            const year = now.getFullYear();
            const inventory_report = await InventoryReport.findOne({
                month: month,
                year: year
            }).populate({
                path: 'inventory_log.book',
                select: 'title'
            })
            if (!inventory_report) throw new Error(`No inventory report found for ${month}/${year}`);

            const book_inventoryLogs = await inventory_report.inventory_log.map(log => ({
                book_title: log.book.title,
                opening_stock: log.opening_stock,
                transactions: log.transactions,
                current_stock: log.current_stock
            }));

            const formatedReport = {
                month: inventory_report.month,
                year: inventory_report.year,
                list_book: book_inventoryLogs
            }

            res.status(200).json({
                status: 'success',
                data: formatedReport
            });
        } catch (error) {
            res.status(error.status || 500).json({
                status: 'error',
                message: error.message
            })
        }
    },

}

module.exports = Report;