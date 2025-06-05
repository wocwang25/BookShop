const mongoose = require('mongoose');

const Book_Schema = mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
        },
        publicationYear: Number,
        price: Number,
        description: String
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

Book_Schema.index({ title: 1 });
Book_Schema.index({ author: 1 });
Book_Schema.index({ category: 1 });

// Định nghĩa thuộc tính virtual cho 'availableStock' (thay thế currentStock)
Book_Schema.virtual('availableStock', {
    ref: 'BookCopy',         // Model để tham chiếu
    localField: '_id',       // Trường trong Book model
    foreignField: 'book',    // Trường trong BookCopy model
    count: true,             // Để Mongoose đếm số lượng tài liệu phù hợp
    match: { status: 'available' } // Chỉ đếm những bản copy có trạng thái 'available'
});

module.exports = mongoose.model('Book', Book_Schema);