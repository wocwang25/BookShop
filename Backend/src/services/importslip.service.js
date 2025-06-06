const BookImportSlip = require('../models/BookImportSlip');
const Book = require('../models/Book');
const BookCopy = require('../models/BookCopy');
const Rule = require('../models/Rule');
const { generateCopyIdentifier } = require('../utils/bookCopyIdentifierGenerator');
const fs = require("fs");
const csv = require('csv-parser');
const mongoose = require('mongoose');

const BookImportService = {
    async createImportSlip({ userId, items }) {
        if (!items || items.length === 0) throw new Error("No items provided");
        const rule = await Rule.findOne({ code: "QD1" });
        const min_import = rule.ruleValue.min_import;
        const min_stock = rule.ruleValue.min_stock;

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const importSlip = new BookImportSlip({
                user: userId
            });

            // Cập nhật tồn kho từng sách
            let slipItems = []
            for (const item of items) {
                const book = await Book.findById(item.bookId).session(session)
                    .populate({
                        path: 'author',
                        select: 'name'
                    })
                    .select('title');
                if (!book) {
                    throw new Error(`Book not found: ${item.bookId}`);
                }

                //Quy định 1 về số lượng nhập tối thiểu
                if (item.quantity < min_import) {
                    continue;
                }

                const availableCopies = await BookCopy.countDocuments(
                    { book: item.bookId, status: 'available' },
                    { session }
                );

                //Quy định 1 về số lượng sách tối đa
                if (availableCopies >= min_stock) {
                    continue;
                }

                for (let index = 0; index < item.quantity; index++) {
                    const copyIdentifier = await generateCopyIdentifier(item.bookId, book.title, book.author.name, session);

                    // console.log('copyIdentifier:', copyIdentifier, 'book:', item.bookId, 'author:', book.author.name);
                    if (!copyIdentifier || !item.bookId) {
                        throw new Error('Thiếu copyIdentifier hoặc bookId khi tạo BookCopy');
                    }
                    const copy = await new BookCopy({
                        book: item.bookId,
                        copyIdentifier: copyIdentifier,
                        status: 'available',
                        importedBySlip: slip._id
                    });
                    await copy.save({ session });
                }

                slipItems.push({
                    book: item.bookId,
                    quantity: item.quantity,
                    unitImportPrice: item.unitImportPrice,
                });
            }

            importSlip.items = items;
            importSlip.totalItem = items.reduce((sum, i) => sum + i.quantity, 0);

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
            const min_import = rule.ruleValue.min_import;
            const min_stock = rule.ruleValue.min_stock;

            const rows = await parseCSV(filePath);
            console.log(rows)
            const items = [];
            const errors = [];

            const slip = new BookImportSlip({
                user: userId
            });


            for (const row of rows) {
                const title = row.bookTitle?.trim();
                const quantity = parseInt(row.quantity);
                const unitImportPrice = parseFloat(row.unitImportPrice);

                if (!title || isNaN(quantity) || isNaN(unitImportPrice)) {
                    errors.push({ row, error: "Invalid or missing data" });
                    continue;
                }

                const book = await Book.findOne({ title: title }).session(session)
                    .populate({
                        path: 'author',
                        select: 'name'
                    })
                    .select('title');
                if (!book) {
                    throw new Error(`Book ${title} chưa có trong cơ sở dữ liệu`)
                }

                //Quy định 1 về số lượng nhập tối thiểu
                if (quantity < min_import) {
                    continue;
                }

                const availableCopies = await BookCopy.countDocuments(
                    { book: book._id, status: 'available' },
                    { session }
                );

                //Quy định 1 về số lượng sách tối đa
                if (availableCopies >= min_stock) {
                    continue;
                }

                for (let index = 0; index < quantity; index++) {
                    const copyIdentifier = await generateCopyIdentifier(book._id, book.title, book.author.name, session);

                    // console.log('copyIdentifier:', copyIdentifier, 'book:', item.bookId, 'author:', book.author.name);
                    if (!copyIdentifier || !book._id) {
                        throw new Error('Thiếu copyIdentifier hoặc bookId khi tạo BookCopy');
                    }
                    const copy = await new BookCopy({
                        book: book._id,
                        copyIdentifier: copyIdentifier,
                        status: 'available',
                        importedBySlip: slip._id
                    });

                    console.log(copy)

                    await copy.save({ session });
                }


                items.push({
                    book: book._id,
                    quantity,
                    unitImportPrice
                });
            }

            if (items.length === 0) {
                throw new Error("No valid book entries found.");
            }

            slip.items = items;
            slip.totalItem = items.reduce((sum, i) => sum + i.quantity, 0);

            await slip.save({ session });
            await session.commitTransaction();
            return { slip, successCount: items.length, items, failed: errors };

        } catch (error) {
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            throw error;
        } finally {
            session.endSession();
        }

    },
};

module.exports = BookImportService;