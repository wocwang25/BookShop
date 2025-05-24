const jwt = require('jsonwebtoken');
const User = require('../models/User');

const AuthService = {
    verifyToken: async function (req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).json({ message: "Token thiếu hoặc sai định dạng" });
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (err) {
            return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
        }
    },

    refreshToken: async function (req, res, next) {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(404).json({
                status: "error",
                message: "Refresh Token not found!"
            });
        }

        try {
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            const user = await User.findById(payload.id);
            if (!user || !user.tokens.some(t => t.token === refreshToken)) {
                return res.status(400).json({
                    status: "false",
                    message: "Refresh token không hợp lệ hoặc đã bị thu hồi"
                });
            }

            const accessToken = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '15m' }
            );

            return res.json({ accessToken });

        } catch (error) {
            return res.status(400).json({
                status: "false",
                message: "Refresh token không hợp lệ hoặc đã bị thu hồi"
            });
        }
    },

    checkRole: (role) => {
        return async (req, res, next) => {
            if (req.user?.role !== role) {
                return res.status(400).json({
                    status: "false",
                    message: `Tài khoản không đủ thẩm quyền để thực hiện hành động này (yêu cầu role: ${role})`
                });
            }
            next();
        };
    }
};

module.exports = AuthService;
