const mongoose = require('mongoose');

const BookCopySchema = new mongoose.Schema({
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    copyIdentifier: { // Mã định danh duy nhất cho từng bản copy vật lý
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['available', 'rented', 'sold'],
        required: true,
        default: 'available'
    },
    customer: { // Ai đang thuê bản copy này (chỉ khi status là 'rented')
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: false
    },
    saleInvoiceId: { // ID của hóa đơn bán nếu bản copy này đã được bán
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesInvoice',
        required: false
    },
    rentalInvoiceId: { // ID của hóa đơn bán nếu bản copy này đã được bán
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RentalInvoice',
        required: false
    },
    importedBySlip: { // ID của phiếu nhập đã đưa bản copy này vào kho (để truy vết)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookImportSlip',
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookCopy', BookCopySchema);