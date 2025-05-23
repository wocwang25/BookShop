const mongoose = require('mongoose');

const Author_Schema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        bio: String,
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('Author', Author_Schema);