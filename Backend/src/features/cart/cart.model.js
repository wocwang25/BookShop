const mongoose = require('mongoose');

const CartSchema = mongoose.Schema({
    books: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    ],
    quantity: {
        type: Number,
        default: 0
    },
    total_cost: Number,
    custormer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

CartSchema.post('save', async function (doc, next) {
    try {
        await doc.populate('books');
        doc.quantity = doc.books.length;

        let total = 0;
        for (const book of doc.books) {
            if (book.cost && book.cost.selling_price) {
                total += book.cost.selling_price;
            }
        }
        doc.total_cost = total;

        await doc.save();
        next();
    } catch (error) {
        next(error);
    }
})