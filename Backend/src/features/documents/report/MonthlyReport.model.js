const mongoose = require('mongoose');
const InventoryLog = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            require: true
        },
        openning_stock: {
            type: Number,
            default: 0,
            require: true
        },
        transactions: [],
        current_stock: {
            type: Number,
            default: 0,
            require: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
)

const DebtLog = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        opening_debt: {
            type: Number,
            default: 0,
            require: true
        },
        transaction: [],
        closing_debt: {
            type: Number,
            default: 0,
            require: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }
);

const DebtLogSchema = mongoose.model('DebtLog', DebtLog);
const InventoryLogSchema = mongoose.model('InventoryLog', InventoryLog);

module.exports = { DebtLogSchema, InventoryLogSchema };