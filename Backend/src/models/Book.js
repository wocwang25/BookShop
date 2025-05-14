const mongoose = require('mongoose');
const { removeVietnameseTones } = require('../utils/removeVNtones');
const { InventoryReport } = require('../features/documents/report/report.model');

const Book_Schema = mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
            trim: true,
            required: true,
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
            trim: true,
            index: true

        },
        cost: {
            cost_price: {
                type: Number,
                required: false,
                min: 0,
                default: 0
            },
            selling_price: {
                type: Number,
                required: false,
                default: 0,
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
        timestamps: true,
        autoIndex: true
    }
);

// Middleware chỉ chạy khi tạo mới
Book_Schema.pre('save', async function (next) {
    // Nếu không phải document mới, bỏ qua
    if (!this.isNew) {
        return next();
    }

    try {
        const Author = mongoose.model('Author');
        const Category = mongoose.model('Category');

        // Lưu giá trị string ban đầu
        const authorName = this.author;
        const categoryName = this.category;

        // Handle Category -> tìm hoặc tạo mới 
        let category = await Category.findOne({ name: categoryName });
        if (!category) {
            category = await Category.create({
                name: categoryName,
                featuredBook: this._id
            });
        }

        // Handle Author -> tìm hoặc tạo mới 
        let author = await Author.findOne({ name: authorName });
        if (!author) {
            author = await Author.create({
                name: authorName,
                featuredBook: this._id
            })
        }

        // Đảm bảo trường search tồn tại
        if (!this.search) {
            this.search = {};
        }

        // Cập nhật trường search
        this.search.title_search = removeVietnameseTones(this.title);
        this.search.author_search = removeVietnameseTones(authorName);
        this.search.category_search = removeVietnameseTones(categoryName);

        // Cập nhật author và category thành ObjectId
        this.category = category._id;
        this.author = author._id;

        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const inventory_report = await InventoryReport.findOne({ month: month, year: year });
        if (!inventory_report) throw new Error(`No inventory report found for ${month}/${year}`);

        inventory_report.inventory_log.push({
            book: this._id,
            openning_stock: this.stock,
            current_stock: this.stock,
            transactions: []
        })

        await inventory_report.save();

        next();
    }
    catch (error) {
        next(error);
    }
});

// Post-save middleware to update related Author and Category
Book_Schema.post('save', async function (doc, next) {
    try {
        const Author = mongoose.model('Author');
        const Category = mongoose.model('Category');

        // Update Category
        if (doc.category) {
            await Category.findByIdAndUpdate(
                doc.category,
                {
                    $inc: { bookCount: 1 },
                    $addToSet: { featuredBook: doc._id }
                },
                { new: true }
            );
        }

        // Update Author
        if (doc.author) {
            await Author.findByIdAndUpdate(
                doc.author,
                {
                    $inc: { bookCount: 1 },
                    $addToSet: { book: doc._id }
                },
                { new: true }
            );
        }

        next();
    } catch (error) {
        console.error('Error in Book post-save middleware:', error);
        next(error);
    }
});

// Pre-remove middleware to update related Author and Category
Book_Schema.pre('remove', async function (next) {
    try {
        const Author = mongoose.model('Author');
        const Category = mongoose.model('Category');

        // Update Category
        if (this.category) {
            await Category.findByIdAndUpdate(
                this.category,
                {
                    $inc: { bookCount: -1 },
                    $pull: { featuredBook: this._id }
                }
            );
        }

        // Update Author
        if (this.author) {
            await Author.findByIdAndUpdate(
                this.author,
                {
                    $inc: { bookCount: -1 },
                    $pull: { book: this._id }
                }
            );
        }

        next();
    } catch (error) {
        console.error('Error in Book pre-remove middleware:', error);
        next(error);
    }
});

module.exports = mongoose.model('Book', Book_Schema);