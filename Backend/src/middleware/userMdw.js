const crypt = require('bcrypt');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

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
        if (!this.isModified('password')) return next();
        try {
            const salt = await crypt.genSalt(parseInt(process.env.SALT_ROUNDS));
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

    loginLimiter,

    authenticateToken: async function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader?.split(' ')[1]; // Bearer <token>

        if (!token) return res.sendStatus(401);

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    },

    verifyToken: async function (req, res, next) {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: "Không có token hoặc định dạng sai"
            });
        }
        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded token:", decoded);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                message: 'Token không hợp lệ hoặc hết hạn'
            });
        }
    },

    isAdmin: async function (req, res, next) {
        if (req.user && req.user.role === 'admin') {
            return next();
        }

        return res.status(403).json({
            message: 'Access denied. You do not have permission to perform this action.'
        });
    }

};

module.exports = User_Middleware;