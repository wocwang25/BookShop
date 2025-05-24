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
    },
    async findAndUpdateCustomer(name, updateData) {
        // Tìm khách hàng theo tên và cập nhật thông tin
        const customer = await Customer.findOneAndUpdate(
            { name },
            { $set: updateData }
        );
        return customer;
    }
}

module.exports = CustomerService;