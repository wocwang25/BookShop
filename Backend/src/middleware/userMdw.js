const User = require('../models/CoreModels/User');
const crypt = require('bcrypt');
const rateLimit = require('express-rate-limit');

// Middleware xử lí giới hạn số lần đăng nhập
const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: "Quá lần thử đăng nhập, vui lòng thử lại sau 1 phút",
    skipSuccessfulRequests: true,
    handler: (res, req) => ({
        success: false,
        error: message
    })
});

const User_Middleware = {
    hashpassword: async function (next) {
        if (!this.Modified('password')) return next();
        try {
            const salt = await crypt.genSalt(process.env.SALT_ROUNDS);
            this.password = await crypt.hash(this.password, salt);

            next();

        }
        catch (err) {
            next(err);
        }
    },

    comparePassword: async function (pass) {
        return crypt.compare(pass, this.password);
    },

    loginLimiter

};

module.exports = User_Middleware;