const mongoose = require('mongoose');

const BookCopySchema = new mongoose.Schema({
    book: { // Đây là cuốn sách mà bản copy này thuộc về
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
    status: { // Trạng thái hiện tại của bản copy
        type: String,
        enum: ['available', 'rented', 'sold'], // Bổ sung thêm các trạng thái hợp lý
        required: true,
        default: 'available'
    },
    customer: { // Ai đang thuê bản copy này (chỉ khi status là 'rented')
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    rentalDueDate: {
        type: Date,
        required: false
    },
    lastRentalId: { // ID của giao dịch thuê gần nhất (để dễ truy vết)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rental',
        required: false
    },
    saleInvoiceId: { // ID của hóa đơn bán nếu bản copy này đã được bán
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalesInvoice',
        required: false
    },
    importedBySlip: { // ID của phiếu nhập đã đưa bản copy này vào kho (để truy vết)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookImportSlip',
        required: false // required false ban đầu, nhưng sẽ được set khi tạo
    },
    importedAt: { // Ngày bản copy này được nhập vào kho
        type: Date,
        required: false
    }

}, {
    timestamps: true // created_at, updated_at
});

module.exports = mongoose.model('BookCopy', BookCopySchema);