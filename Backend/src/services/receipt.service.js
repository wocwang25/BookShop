const Rule = require('../models/Rule')
const CustomerService = require('./customer.service');
const PaymentReceipt = require('../models/PaymentReceipt');
const mongoose = require('mongoose');

const PaymentReceiptService = {
    async getAllPaymentReceiptInCurrentMonth() {
        try {
            // Lấy ngày đầu và cuối tháng hiện tại
            const now = new Date();
            const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            // Lấy danh sách phiếu thu trong tháng hiện tại
            const receipts = await PaymentReceipt.find({
                createdAt: { $gte: startDate, $lte: endDate }
            }).populate('customer', 'name').populate('user', 'name');

            // Tính tổng tiền
            const totalAmount = receipts.reduce((sum, r) => sum + (r.paymentAmount || 0), 0);

            return {
                receipts,
                totalAmount
            };
        } catch (error) {
            throw error;
        }
    },

    async createPaymentReceipt(userId, data) {
        let { customer_name, customer_info, paymentAmount, note } = data;

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
            if (rule.is_active && paymentAmount > customer.debt) {
                throw new Error("Số tiền thu không được vượt quá số nợ của khách hàng.");
            }
            // Tạo phiếu thu
            const receipt = new PaymentReceipt({
                customer: customer._id,
                user: userId,
                paymentAmount: paymentAmount,
                note
            });
            await receipt.save({ session });

            // Cập nhật nợ
            console.log(customer.debt)
            customer.debt -= paymentAmount;
            console.log(customer.debt)
            await customer.save({ session });

            await session.commitTransaction();
            session.endSession();

            return { receipt, success: true };

        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

module.exports = PaymentReceiptService;