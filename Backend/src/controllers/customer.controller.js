const CustomerService = require('../services/customer.service');

const CustomerController = {
    async getProfile(req, res) {
        try {
            const { customerId } = req.user.id;
            const customer = await CustomerService.getCustomerProfile(customerId);
            res.json(customer);
        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    async getAllCustomers(req, res) {
        try {
            const customers = await CustomerService.getAllCustomers();
            res.json(customers);
        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    async getCustomerById(req, res) {
        try {
            const { customerId } = req.params;
            const customer = await CustomerService.getCustomerById(customerId);
            res.json(customer);
        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    async updateProfile(req, res) {
        try {
            const updateData = req.body;
            const customerId = req.user.id;
            const result = await CustomerService.updateCustomerProfile(customerId, updateData);
            res.json(result);

        } catch (error) {
            res.status(500).json(error.message)
        }
    }
}

module.exports = CustomerController;