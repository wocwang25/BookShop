const Rule = require('../models/Rule')
const CustomerService = require('./customer.service');
const PaymentReceipt = require('../models/PaymentReceipt');
const mongoose = require('mongoose');

const PaymentReceiptService = {
    async getAllPaymentReceipt(month, year) {
        try {
            console.log(month, year)
            // Xác định ngày đầu và cuối tháng
            const startDate = new Date(year, month - 1, 1, 0, 0, 0, 0);
            const endDate = new Date(year, month, 0, 23, 59, 59, 999);

            // Lấy danh sách phiếu thu trong tháng hiện tại
            const receipts = await PaymentReceipt.find({
                createdAt: { $gte: startDate, $lte: endDate }
            })
                .populate('customer', 'name email phone address ')
                .populate('user', 'name email')
                .lean();

            // Tính tổng tiền
            const totalAmount = Array.isArray(receipts)
                ? receipts.reduce((sum, r) => sum + (r.paymentAmount || 0), 0)
                : 0;

            return {
                receipts: receipts || [],
                totalAmount
            };
        } catch (error) {
            throw error;
        }
    },

    async removeInvoiceFromCustomer(customer, invoiceId, type, session) {
        try {
            let removedInvoice = null;

            if (type === 'sale') {
                // Tìm và xóa từ sales invoices
                const invoiceIndex = customer.salesInvoices.findIndex(
                    invoice => invoice._id.toString() === invoiceId.toString()
                );

                if (invoiceIndex !== -1) {
                    removedInvoice = customer.salesInvoices[invoiceIndex];
                    customer.salesInvoices.splice(invoiceIndex, 1);
                    console.log(`🛒 Removed sales invoice ${invoiceId} from customer`);
                }

            } else if (type === 'rent') {
                // Tìm và xóa từ rental invoices
                const invoiceIndex = customer.rentalInvoices.findIndex(
                    invoice => invoice._id.toString() === invoiceId.toString()
                );

                if (invoiceIndex !== -1) {
                    removedInvoice = customer.rentalInvoices[invoiceIndex];
                    customer.rentalInvoices.splice(invoiceIndex, 1);
                    console.log(`📚 Removed rental invoice ${invoiceId} from customer`);
                }
            }

            // Lưu customer với session
            if (removedInvoice) {
                await customer.save({ session });
            }

            return removedInvoice;

        } catch (error) {
            console.error(`Error removing invoice ${invoiceId} from customer:`, error);
            throw error;
        }
    },

    async createPaymentReceipt(userId, data) {
        let { customer_name, customer_info, paymentAmount, note, invoiceId, type } = data;

        if (!customer_name || paymentAmount <= 0) {
            throw new Error("Invalid customer name or payment amount");
        }

        const rule = await Rule.findOne({ code: "QD4" });
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const customer = await CustomerService.findAndUpdateCustomer(customer_name, customer_info);

            if (!paymentAmount) {
                paymentAmount = customer.debt;
            }
            if (rule?.is_active && paymentAmount > customer.debt) {
                throw new Error("Số tiền thu không được vượt quá số nợ của khách hàng.");
            }

            // Tạo payment receipt object
            const receiptData = {
                customer: customer._id,
                user: userId,
                paymentAmount: paymentAmount,
                note
            };

            // Nếu có invoiceId và type, xử lý việc thanh toán cho invoice cụ thể
            if (invoiceId && type) {
                console.log(`💰 Processing payment for invoice ${invoiceId} of type ${type}`);

                // Tìm và xóa invoice khỏi customer
                const invoiceRemoved = await this.removeInvoiceFromCustomer(customer, invoiceId, type, session);

                if (invoiceRemoved) {
                    // Thêm thông tin invoice vào payment receipt
                    receiptData.invoice = {
                        _id: invoiceId,
                        type: type,
                        totalAmount: paymentAmount,
                        // Có thể thêm thêm thông tin khác nếu cần
                        createdAt: invoiceRemoved.createdAt,
                        startDate: invoiceRemoved.startDate,
                        dueDate: invoiceRemoved.dueDate
                    };

                    console.log(`✅ Invoice ${invoiceId} removed from customer ${customer.name}`);
                } else {
                    console.log(`⚠️ Invoice ${invoiceId} not found in customer ${customer.name}`);
                }
            }

            // Tạo phiếu thu
            const receipt = new PaymentReceipt(receiptData);
            await receipt.save({ session });

            // Cập nhật nợ
            customer.debt -= paymentAmount;
            await customer.save({ session });

            await session.commitTransaction();
            session.endSession();

            console.log(`💰 Payment receipt created successfully for customer ${customer.name}`);
            return { receipt, success: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error('Error creating payment receipt:', error);
            throw error;
        }
    }
}
module.exports = PaymentReceiptService;