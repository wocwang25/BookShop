const Customer = require('../models/Customer')

const CustomerService = {
    async findOrCreateCustomer(name) {
        let customer = await Customer.findOne({ name });
        if (!customer) {
            customer = await new Customer({
                name: name,
            });

            await customer.save();
        }
        return customer;
    }
}

module.exports = CustomerService;