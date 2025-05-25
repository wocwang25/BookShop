const Customer = require('../models/Customer')
const CustomerAccount = require('../models/CustomerAccount')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const CustomerService = {
    async findOrCreateCustomer(name) {
        let customer = await Customer.findOne({ name });
        if (!customer) {
            customer = new Customer({ name });
            await customer.save();
        }
        return customer;
    },

    async findAndUpdateCustomer(name, updateData) {
        const customer = await Customer.findOneAndUpdate(
            { name },
            { $set: updateData }
        )
        if (!customer) {
            throw new Error("Không có dữ liệu khách hàng");
        }
        return customer;
    },

    async getCustomerProfile(customerId) {
        // Tìm account theo _id và populate thông tin customer
        const account = await CustomerAccount.findOne({ customer: customerId }).populate('customer');
        if (!account) {
            throw new Error("Không tìm thấy tài khoản khách hàng");
        }
        // Trả về thông tin tài khoản và khách hàng
        return {
            id: account._id,
            email: account.email,
            customer: account.customer
        };
    },

    async updateCustomerProfile(customerId, updateData) {
        // 1. Cập nhật CustomerAccount trước (nếu có trường để cập nhật)
        const accountUpdate = {};

        if (updateData.email) {
            accountUpdate.email = updateData.email;
        }

        const account = await CustomerAccount.findOneAndUpdate(
            { customer: customerId },
            { $set: accountUpdate }
        ).populate('customer');

        if (!account) {
            throw new Error("Không tìm thấy tài khoản khách hàng");
        }

        // 2. Cập nhật bảng Customer (nếu có updateData.customer)
        if (updateData.customer && typeof updateData.customer === 'object') {
            await Customer.findByIdAndUpdate(
                account.customer._id,
                { $set: updateData.customer }
            );
        }

        return { message: 'Cập nhật thông tin khách hàng thành công' };
    },

    async registerCustomerAccount(name, email, password) {
        const customer = await this.findOrCreateCustomer(name);
        let account = await CustomerAccount.findOne({ customer: customer._id });

        if (!account) {
            account = new CustomerAccount({
                customer: customer._id,
                email,
                password: password
            });
            await account.save();
        }

        return account;
    },

    async loginCustomerAccount(email, password) {
        try {
            const account = await CustomerAccount.findOne({ email }).select('+password').populate('customer');
            if (!account) {
                throw new Error("Tài khoản không tồn tại");
            }

            const is_match = await bcrypt.compare(password, account.password);
            if (!is_match) {
                throw new Error("Sai mật khẩu");
            }

            const payload = {
                id: account._id,
                role: 'customer',
                customerId: account.customer._id
            };

            const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
            const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

            account.tokens.push({ token: refreshToken });
            await account.save();

            return {
                accessToken,
                refreshToken,
                customer: {
                    id: account.customer._id,
                    name: account.customer.name,
                    email: account.email
                }
            };
        } catch (error) {
            throw error;
        }
    },

    async changePassword(customerId, currentPassword, newPassword) {
        const account = await CustomerAccount.findOne({ customer: customerId }).select('+password');
        if (!account) {
            throw new Error("Tài khoản không tồn tại");
        }

        const isMatch = await bcrypt.compare(currentPassword, account.password);
        if (!isMatch) {
            throw new Error("Mật khẩu hiện tại không đúng");
        }
        account.password = newPassword;

        //Xóa tokens -> đăng xuất
        account.tokens = [];
        await account.save();

        return { message: "Thay đổi mật khẩu thành công. Bạn đã bị đăng xuất khỏi tất cả thiết bị" };
    }
};

module.exports = CustomerService;