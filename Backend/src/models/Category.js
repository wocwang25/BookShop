const mongoose = require('mongoose');

const Category_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        description: String
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Category', Category_Schema); 