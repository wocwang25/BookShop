const mongoose = require('mongoose')

const Category_Schema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Category', Category_Schema);


