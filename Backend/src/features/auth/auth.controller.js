const USER = require('../../models/User');
const jwt = require('jsonwebtoken');

const AuthModule = {
    signup: async (req, res) => {
        const { name, username, email, password } = req.body;
        try {
            const user = new USER({ name, username, email, password });
            await user.save();

            const userResponse = user.toObject();
            delete userResponse.password;

            console.log(user);
            res.status(200).json({
                status: "success",
                message: "User registers successfully",
                data: userResponse
            });
        }
        catch (error) {
            console.error("Login Error:", error);
            res.status(401).json({
                status: "error",
                message: error.message
            });
        }
    },

    signin: async (req, res) => {
        const { identifier, password } = req.body;
        if (!identifier || !password) {
            return res.status(400).json({
                status: "error",
                message: "Missing Login Information"
            });
        }

        try {
            // Tìm user bằng username hoặc email
            const user = await USER.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            }).select('+password');

            if (!user) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid User"
                });
            }

            // So sánh mật khẩu
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.status(401).json({
                    status: "error",
                    message: "Invalid login information",
                    remainingAttempts: 5 - user.loginAttempts
                });
            }

            // Tạo token
            const accessToken = jwt.sign(
                { id: user._id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );
            // Tạo refresh token
            const refreshToken = jwt.sign(
                { id: user._id },
                process.env.JWT_REFRESH_SECRET,
                { expiresIn: '7d' }
            );

            user.tokens = user.tokens || [];
            user.tokens.push({ token: refreshToken });
            await user.save();

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // true nếu dùng HTTPS
                maxAge: 24 * 60 * 60 * 1000 // 1 ngày
            });

            res.json({
                success: true,
                token: accessToken,
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role,
                }
            });
        } catch (error) {
            res.status(401).json({
                status: "error",
                message: error.message
            });
        }
    },

    logout: async (req, res) => {
        const refreshToken = req.cookies.refreshToken;
        console.log(refreshToken);
        if (refreshToken) {
            const user = await USER.findOne({ "tokens.token": refreshToken });
            if (user) {
                user.tokens = user.tokens.filter(t => t.token !== refreshToken);
                await user.save();
            }
            res.clearCookie('refreshToken');
        }
        res.json({ message: 'Logged out' });
    },

    // Tính năng thay đổi mật khẩu -> áp dụng loginAttempts tương tự như đăng nhập để kiểm soát bruteforce
    changePassword: async (req, res) => {
        try {
            // Lấy userId từ accessToken đã được verify bởi middleware
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Tìm user theo id và lấy cả password
            const user = await USER.findById(userId).select('+password');
            console.log(user.password);
            console.log(currentPassword);

            if (!user || !user.password) {
                return res.status(400).json({
                    status: "error",
                    message: "User not found or missing password"
                });
            }
            // Kiểm tra mật khẩu hiện tại

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    status: "error",
                    message: "Incorrect password!"
                });
            }

            // Đổi mật khẩu mới
            user.password = newPassword;
            await user.save();

            res.json({
                status: "success",
                message: "Change password successfully!"
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    }
}

module.exports = AuthModule;