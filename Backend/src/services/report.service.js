const Book = require('../models/Book')
const Customer = require('../models/Customer')
const BookImportSlip = require('../models/BookImportSlip')
const SalesInvoice = require('../models/SalesInvoice')
const RentalInvoice = require('../models/RentalInvoice')
const PaymentReceipt = require('../models/PaymentReceipt')

const ReportService = {
    async getMonthlyInventoryReport(month, year) {
        try {
            if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
                throw new Error('Invalid month or year');
            }
            const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

            // Get current date to calculate current month's opening stock
            const currentDate = new Date();
            const currentMonth = currentDate.getMonth() + 1;
            const currentYear = currentDate.getFullYear();

            // STEP 1: Get Imported Quantities for target month
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

            // STEP 2: Get Sold Quantities for target month
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

            // STEP 3: Get Rent Quantities for target month
            const rent = await RentalInvoice.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                { $unwind: '$items' },
                {
                    $group: {
                        _id: '$items.book',
                        rent: { $sum: '$items.quantity' }
                    }
                }
            ]);

            // STEP 4: Calculate net changes from end of target month to current date
            // This will help us calculate the opening stock of target month from current stock
            let netChangesFromTargetEnd = new Map();

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                // Calculate start of next month after target month
                const nextMonthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0));
                const currentDateEnd = new Date();

                // Get all transactions from end of target month to current date
                const importedAfterTarget = await BookImportSlip.aggregate([
                    { $match: { createdAt: { $gte: nextMonthStart, $lte: currentDateEnd } } },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.book',
                            imported: { $sum: '$items.quantity' }
                        }
                    }
                ]);

                const soldAfterTarget = await SalesInvoice.aggregate([
                    { $match: { createdAt: { $gte: nextMonthStart, $lte: currentDateEnd } } },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.book',
                            sold: { $sum: '$items.quantity' }
                        }
                    }
                ]);

                const rentAfterTarget = await RentalInvoice.aggregate([
                    { $match: { createdAt: { $gte: nextMonthStart, $lte: currentDateEnd } } },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.book',
                            rent: { $sum: '$items.quantity' }
                        }
                    }
                ]);

                // Calculate net changes for each book
                const importedAfterMap = new Map(importedAfterTarget.map(item => [item._id.toString(), item.imported]));
                const soldAfterMap = new Map(soldAfterTarget.map(item => [item._id.toString(), item.sold]));
                const rentAfterMap = new Map(rentAfterTarget.map(item => [item._id.toString(), item.rent]));

                // Get all unique book IDs
                const allBookIds = new Set([
                    ...importedAfterMap.keys(),
                    ...soldAfterMap.keys(),
                    ...rentAfterMap.keys()
                ]);

                allBookIds.forEach(bookId => {
                    const importedAfter = importedAfterMap.get(bookId) || 0;
                    const soldAfter = soldAfterMap.get(bookId) || 0;
                    const rentAfter = rentAfterMap.get(bookId) || 0;
                    // Net change = imported - sold - rent
                    const netChange = importedAfter - soldAfter - rentAfter;
                    netChangesFromTargetEnd.set(bookId, netChange);
                });
            }

            // Convert target month arrays to Map for easy lookup
            const importedMap = new Map(imported.map(item => [item._id.toString(), item.imported]));
            const soldMap = new Map(sold.map(item => [item._id.toString(), item.sold]));
            const rentMap = new Map(rent.map(item => [item._id.toString(), item.rent]));

            // STEP 5: Get all books with current stock
            const books = await Book.find({}).populate('availableStock');

            // STEP 6: Build report
            const report = books.map(book => {
                const bookId = book._id.toString();
                const currentStock = book.availableStock;
                const importedQty = importedMap.get(bookId) || 0;
                const soldQty = soldMap.get(bookId) || 0;
                const rentQty = rentMap.get(bookId) || 0;

                let openingStock;
                let closingStock;

                if (year === currentYear && month === currentMonth) {
                    // For current month, calculate opening stock from current stock
                    openingStock = currentStock - importedQty + soldQty + rentQty;
                    closingStock = currentStock;
                } else {
                    // For past months, calculate closing stock at end of target month
                    // Current stock = closing stock of target month + net changes from target month end to now
                    const netChangeFromTargetEnd = netChangesFromTargetEnd.get(bookId) || 0;
                    closingStock = currentStock - netChangeFromTargetEnd;
                    
                    // Opening stock = closing stock - imported + sold + rent
                    openingStock = closingStock - importedQty + soldQty + rentQty;
                }

                return {
                    bookId: book._id,
                    title: book.title,
                    openingStock: Math.max(0, openingStock),
                    imported: importedQty,
                    sold: soldQty,
                    rent: rentQty,
                    closingStock: Math.max(0, closingStock)
                };
            });

            return report;

        } catch (error) {
            throw new Error(error.message);
        }
    },
    async getMonthlyDebtReport(month, year) {
        try {
            if (isNaN(month) || isNaN(year) || month < 1 || month > 12) {
                throw new Error('Invalid month or year');
            }
            const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0)); // yyyy-mm-01 00:00:00
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)); // yyyy-mm-last-day 23:59:59.999

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
            const rentAgg = await RentalInvoice.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $group: {
                        _id: '$customer',
                        rentAmount: { $sum: '$totalAmount' }
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
            const rentMap = new Map(rentAgg.map(e => [e._id.toString(), e.rentAmount]));
            const paymentMap = new Map(paymentAgg.map(e => [e._id.toString(), e.amountPaid]));

            // 4. Lấy danh sách tất cả khách hàng
            const customers = await Customer.find({});

            // 5. Tính toán báo cáo
            const report = customers.map(customer => {
                const id = customer._id.toString();
                const closingDebt = customer.debt;
                const salesAmount = salesMap.get(id) || 0;
                const rentAmount = rentMap.get(id) || 0;
                const amountPaid = paymentMap.get(id) || 0;
                // Opening Debt = Closing Debt - Sales Amount - Rent Amount + Amount Paid
                const openingDebt = closingDebt - salesAmount - rentAmount + amountPaid;

                return {
                    customerId: customer._id,
                    name: customer.name,
                    openingDebt,
                    salesAmount,
                    rentAmount,
                    amountPaid,
                    closingDebt
                };
            });

            return report;

        } catch (error) {
            throw new Error(error.message);
        }
    }
}

module.exports = ReportService