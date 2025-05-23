const mongoose = require('mongoose');

const Receipt_Schema = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        address: {
            type: String,
            required: true
        },
        phoneNumber: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        },
        deposit: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Receipt', Receipt_Schema);

