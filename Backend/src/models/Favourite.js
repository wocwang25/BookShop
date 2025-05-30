const mongoose = require('mongoose')

const FavouriteItem = mongoose.Schema(
    {
        book: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book'
        }
    },
    {
        _id: false
    }
)

const FavouriteBook = mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CustomerAccount',
            required: true,
            unique: true
        },
        items: [FavouriteItem]
    }
);

module.exports = mongoose.model('FavouriteBook', FavouriteBook);