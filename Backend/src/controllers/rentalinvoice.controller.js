const RentalInvoiceService = require('../services/rentalinvoice.service');

const RentalInvoiceController = {
    async getAllRentInvoice(req, res) {
        try {
            const { month, year } = req.query; // hoặc req.body nếu bạn gửi từ body
            const results = await RentalInvoiceService.getAllRentInvoice(month, year);
            res.status(201).json(
                {
                    invoices: results.invoices,
                    totalAmount: results.totalAmount
                }
            );
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async createRentalInvoice(req, res) {
        try {
            const userId = req.user.id;
            const { customer_name, items, rent_info } = req.body;

            const invoice = await RentalInvoiceService.createRentalInvoice(userId, customer_name, items, rent_info);

            res.status(201).json({ message: 'Rental Invoice created successfully', invoice });
        } catch (error) {
            res.status(400).json({ error: error.message })
        }
    }
}

module.exports = RentalInvoiceController;