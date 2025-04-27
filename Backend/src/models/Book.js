const mongoose = require('mongoose');
const { removeVietnameseTones } = require('../utils/removeVNtones');

const Book_Schema = mongoose.Schema(
    {
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
                required: false,
                min: 0
            },
            selling_price: {
                type: Number,
                required: false,
                validate: {
                    validator: function (v) {
                        return v >= this.cost.cost_price;
                    },
                    message: 'Giá bán phải >= giá nhập'
                }
            },
            rental_price: {
                type: Number,
                default: function () {
                    return this.cost.selling_price * 0.1;
                }
            }
        },
        stock: {
            type: Number,
            default: 0,
            min: 0
        },
        search: {
            title_search: String,
            author_search: String,
            category_search: String,
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

Book_Schema.pre('save', async function (next) {
    try {
        const Author = mongoose.model('Author');
        const Category = mongoose.model('Category');

        // Handle Category -> tìm hoặc tạo mới 
        let category = await Category.findOne({ name: this.category });
        if (!category) {
            category = await Category.create({
                name: this.category,
                bookCount: 0
            });
        }

        // Handle Author -> tìm hoặc tạo mới
        let author = await Author.findOne({ name: this.author });
        if (!author) {
            author = await Author.create({
                name: this.author,
                bookCount: 0
            })
        }

        this.category = category._id;
        this.author = author._id;

        this.search.title_search = removeVietnameseTones(this.title);
        this.search.author_search = removeVietnameseTones(this.author);
        this.search.category_search = removeVietnameseTones(this.category);
        next()
    }
    catch (error) {
        next(error);
    }
});
Book_Schema.post('save', async function (doc) {
    const Author = mongoose.model('Author');
    const Category = mongoose.model('Category');

    await Category.findByIdAndUpdate(doc.category, {
        $inc: { bookCount: 1 },
        $addToSet: { featuredBook: doc._id }
    });

    await Author.findByIdAndUpdate(doc.author, {
        $inc: { bookCount: 1 },
        $addToSet: { book: doc._id }
    });
});

module.exports = mongoose.model('Book', Book_Schema);