const PaymentReceiptService = require('../services/receipt.service');

const PaymentReceiptController = {
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