const BookImportSlip = require('../models/BookImportSlip');
const Book = require('../models/Book');
const Rule = require('../models/Rule')
const fs = require("fs");
const csv = require('csv-parser');
const mongoose = require('mongoose');

const BookImportService = {
    async createImportSlip({ userId, items }) {
        if (!items || items.length === 0) throw new Error("No items provided");
        const rule = await Rule.findOne({ code: "QD1" });

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Cập nhật tồn kho từng sách
            let slipItems = []
            for (const item of items) {
                const book = await Book.findById(item.bookId).session(session);
                if (!book) {
                    throw new Error(`Book not found: ${item.bookId}`);
                }

                //Quy định 1
                if (item.quantity < rule.ruleValue.min_import && book.currentStock > rule.ruleValue.min_stock) {
                    continue;
                }

                book.currentStock += item.quantity;
                await book.save({ session });

                slipItems.push({
                    book: item.bookId,
                    quantity: item.quantity,
                    unitImportPrice: item.unitImportPrice
                });
            }

            const importSlip = await new BookImportSlip({
                user: userId,
                items: slipItems,
                totalItem: slipItems.reduce((sum, item) => sum + item.quantity, 0)
            });

            await importSlip.save({ session });
            await session.commitTransaction();
            session.endSession();

            return importSlip;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    },
    async createImportSlipFromCSV(filePath, userId) {

        function parseCSV(filePath) {
            return new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath)
                    .pipe(csv())
                    .on("data", (data) => results.push(data))
                    .on("end", () => resolve(results))
                    .on("error", reject);
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const rule = await Rule.findOne({ code: "QD1" });
            const rows = await parseCSV(filePath);
            console.log(rows)
            const items = [];
            const errors = [];

            for (const row of rows) {
                const title = row.bookTitle?.trim();
                const quantity = parseInt(row.quantity);
                const unitImportPrice = parseFloat(row.unitImportPrice);

                if (!title || isNaN(quantity) || isNaN(unitImportPrice)) {
                    errors.push({ row, error: "Invalid or missing data" });
                    continue;
                }

                let book = await Book.findOne({ title });
                if (!book) {
                    throw new Error(`Book ${title} chưa có trong cơ sở dữ liệu`)
                }

                //Quy định 1
                if (quantity < rule.ruleValue.min_import && book.currentStock > rule.ruleValue.min_stock) {
                    continue;
                }

                // Cập nhật stock (nếu muốn tracking tồn kho luôn)
                book.currentStock += quantity;
                await book.save({ session });

                items.push({
                    book: book._id,
                    quantity,
                    unitImportPrice
                });
            }

            if (items.length === 0) {
                throw new Error("No valid book entries found.");
            }

            const slip = new BookImportSlip({
                user: userId,
                items: items,
                totalItem: items.reduce((sum, i) => sum + i.quantity, 0),
            });


            await slip.save({ session });
            await session.commitTransaction();
            session.endSession();
            return { slip, successCount: items.length, items, failed: errors };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }

    },
};

module.exports = BookImportService;