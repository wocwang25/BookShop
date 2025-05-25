const CustomerAccount = require('../models/CustomerAccount');
const CustomerService = require('../services/customer.service');

const CustomerController = {
    async getProfile(req, res) {
        try {
            console.log(req.user.customerId)
            const customer = await CustomerService.getCustomerProfile(req.user.customerId);
            res.json(customer);
        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    async updateProfile(req, res) {
        try {
            const updateData = req.body;
            const customerId = req.user.customerId;
            const result = await CustomerService.updateCustomerProfile(customerId, updateData);
            res.json(result);

        } catch (error) {
            res.status(500).json(error.message)
        }
    },

    async registerCustomerAccount(req, res) {
        try {
            const { name, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ message: "Thiếu thông tin name, email hoặc password" });
            }

            const account = await CustomerService.registerCustomerAccount(name, email, password);
            res.status(201).json({
                message: "Đăng ký thành công",
                account: {
                    email: account.email,
                    customerId: account.customer,
                },
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async loginCustomerAccount(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: "Thiếu email hoặc password" });
            }

            const result = await CustomerService.loginCustomerAccount(email, password);

            res.cookie('refreshToken', result.refreshToken, {
                httpOnly: true,
                secure: false, // true nếu dùng HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 1 ngày
            });

            const data = {
                accessToken: result.accessToken,
                customer: result.customer
            }
            res.json(data);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async logoutCustomer(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            console.log(refreshToken);
            if (refreshToken) {
                const customer = await CustomerAccount.findOne({ "tokens.token": refreshToken });
                if (customer) {
                    customer.tokens = customer.tokens.filter(t => t.token !== refreshToken);
                    await customer.save();
                }
                res.clearCookie('refreshToken');
            }
            res.json({ message: 'Logged out' });

        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    async changePassword(req, res) {
        try {
            const customerId = req.user.customerId; // cần middleware auth gán thông tin này
            const { currentPassword, newPassword } = req.body;

            const result = await CustomerService.changePassword(customerId, currentPassword, newPassword);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = CustomerController;