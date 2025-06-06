const RentalInvoiceService = require('../services/rentalinvoice.service');

const RentalInvoiceController = {
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