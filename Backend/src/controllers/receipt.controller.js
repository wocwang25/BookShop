const PaymentReceiptService = require('../services/receipt.service');

const PaymentReceiptController = {
    async getAllPaymentReceipt(req, res) {
        try {
            const { month, year } = req.query;
            const result = await PaymentReceiptService.getAllPaymentReceipt(month, year);
            res.status(201).json({
                receipts: result.receipts,
                totalAmount: result.totalAmount
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async createPaymentReceipt(req, res) {
        try {
            const userId = req.user.id;
            const result = await PaymentReceiptService.createPaymentReceipt(userId, req.body);

            res.status(201).json({ message: 'Payment Receipt created successfully', result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = PaymentReceiptController;