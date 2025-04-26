const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: "Thử quá nhiều lần, vui lòng thử lại sau 1 phút"
});

module.exports = { loginLimiter };
