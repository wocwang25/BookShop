const mongoose = require('mongoose')

const Custormer_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        address: String,
        phone: String,
        email: String,
        debt: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Customer', Custormer_Schema);



