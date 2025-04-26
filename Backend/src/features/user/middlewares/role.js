const rateLimit = require('express-rate-limit');

exports.loginLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    message: "Thử quá nhiều lần, vui lòng thử lại sau 1 phút"
});