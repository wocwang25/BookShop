const User = require('../../../models/User');
const Receipt = require('./receipt.model');
const utils = require('./receipt.utils');

const handleReceipt = {
    create: async function (customer_info) {
        const customer = await User.findOne({ name: customer_info.name });
        utils.validateUser(customer);
        utils.validateCustomerDebt(customer, customer_info.deposit);

        const receipt = await Receipt.create({
            customer: customer._id,
            address: customer.contact_info?.address || customer_info.address,
            phoneNumber: customer.contact_info?.phone || customer_info.phoneNumber,
            email: customer.email || customer_info.email,
            deposit: customer_info.deposit
        });

        //Lưu lại thông tin để sau đỡ phiền nhập lại
        customer.contact_info.address = receipt.address;
        customer.contact_info.phone = receipt.phone;
        customer.debt -= receipt.deposit;

        return { receipt, customer };
    },

    get: async function (query) {
        const receipts = await Receipt.find(query)
            .populate({
                path: 'customer',
                select: 'name'
            })
            .sort({ createdAt: -1 });

        const formattedReceipts = receipts.map(receipt => ({
            receiptId: receipt._id,
            customerName: receipt.customer?.name || 'Chưa rõ',
            address: receipt.address || 'Chưa có',
            phone: receipt.phoneNumber || 'Chưa có',
            email: receipt.email || 'Chưa có',
            receiptDate: new Date(receipt.date).toLocaleDateString('vi-VN') || receipt.date,
            totalAmount: receipt.deposit,
            createdAt: receipt.createdAt,
            updatedAt: receipt.updatedAt
        }));

        return formattedReceipts;
    }
}

module.exports = handleReceipt;