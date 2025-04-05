const mongoose = require('mongoose');

const Book_Schema = mongoose.Schema(
    {
        bookCode: {
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Book Code is required!']
        },
        title: {
            type: String,
            unique: true,
            trim: true,
            required: [true, 'Book title is required!'],
            index: true
        },
        author: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        cost: {
            cost_price: {
                type: Number,
                required: true,
                min: 0
            },
            selling_price: {
                type: Number,
                required: true,
                validate: {
                    validator: function (v) {
                        return v >= this.cost.cost_price;
                    },
                    message: 'Giá bán phải >= giá nhập'
                }
            },
            quantity_in_stock: {
                type: Number,
                default: 0,
                min: 0
            },
            rental_price: {
                type: Number,
                default: function () {
                    return this.cost.selling_price * 0.1;
                }
            }
        },
        description: String,
        image_url: String,
        rental_users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        metadata: {
            importedAt: {
                type: Date,
                default: Date.now()
            },
            lastUpdated: Date
        }
    },
    {
        Timestamp: true,
        autoIndex: true
    }
);

module.exports = mongoose.model('Book', Book_Schema);