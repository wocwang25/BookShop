const mongoose = require('mongoose');


const InventoryLog = mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    openning_stock: {
        type: Number,
        default: 0,
        required: true
    },
    transactions: [
        {
            type: { type: String, enum: ['import', 'export'], required: true },
            staff: String,
            quantity: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    current_stock: {
        type: Number,
        default: 0,
        required: true
    }
});

const DebtLog = mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    opening_debt: {
        type: Number,
        default: 0,
        required: true
    },
    transactions: [
        {
            type: { type: String, enum: ['add_debt', 'payment'], required: true },
            staff: String,
            amount: { type: Number, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    closing_debt: {
        type: Number,
        default: 0,
        // required: true
    }
});

const InventoryReportSchema = mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    inventory_log: [InventoryLog],
    month: {
        type: Number, // 1–12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const DebtReportSchema = mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    debt_log: [DebtLog],
    month: {
        type: Number, // 1–12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const DebtReport = mongoose.model('DebtReport', DebtReportSchema);
const InventoryReport = mongoose.model('InventoryReport', InventoryReportSchema);

module.exports = { DebtReport, InventoryReport };