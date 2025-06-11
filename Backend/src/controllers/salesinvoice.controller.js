const SalesInvoiceService = require('../services/salesinvoice.service');

const SalesInvoiceController = {
    async createSalesInvoice(req, res) {
        try {
            const result = await SalesInvoiceService.getAllSalesInvoiceInCurrentMonth();

            res.status(201).json(result);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async createSalesInvoice(req, res) {
        try {
            const userId = req.user.id;
            const { customer_name, items } = req.body;
            console.log(items, customer_name)
            const result = await SalesInvoiceService.createSalesInvoice(userId, customer_name, items);

            res.status(201).json({ message: 'Sales Invoice created successfully', result });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}

module.exports = SalesInvoiceController