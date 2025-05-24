const Rule = require('../models/Rule')
const CustomerService = require('./customer.service');
const PaymentReceipt = require('../models/PaymentReceipt');
const mongoose = require('mongoose');

const PaymentReceiptService = {
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