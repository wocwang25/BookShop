const User = require('../../../models/User');
const Regulation = require('../regulation/regulation.model')
const Receipt = require('./receipt.model');

const utils = {
    validateUser: async (customer) => {
        if (!customer) {
            const error = new Error(`Khách hàng ${customer.name} không tồn tại`);
            error.status = 400;
            throw error;
        }
    },

    validateCustomerDebt: (user, depositAmount) => {
        if (depositAmount > user.debt) {
            const error = new Error(`Không thể thu quá số nợ. Nợ hiện tại: ${user.debt}đ`);
            error.status = 400;
            throw error;
        }
    }
}

module.exports = utils;