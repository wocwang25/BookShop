const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const AuthController = {
    signup: async (req, res) => {
        const { name, username, email, password } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Vui lòng điền đầy đủ Tên, Tên đăng nhập, Email và Mật khẩu."
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const existingUser = await User.findOne({
                $or: [{ username: username }, { email: email }]
            }).session(session);

            if (existingUser) {
                throw new Error("Tên đăng nhập hoặc Email đã tồn tại. Vui lòng chọn cái khác.");
            }

            let customerProfile = await Customer.findOne({ name: name, email: email });
            // console.log(customerProfile)

            if (!customerProfile) {
                customerProfile = await new Customer({
                    name: name,
                    email: email
                });
                await customerProfile.save({ session });
            }

            const user = await new User({
                name,
                username,
                email,
                password,
                customerProfile: customerProfile._id
            });
            await user.save({ session });

            await session.commitTransaction();

            const userResponse = user.toObject();
            delete userResponse.password;

            res.status(201).json({
                status: "success",
                message: "Đăng ký tài khoản khách hàng thành công!",
                data: userResponse
            });

        } catch (error) {
            await session.abortTransaction();
            console.error("Signup Error:", error);

            if (error.code === 11000) {
                return res.status(409).json({
                    status: "error",
                    message: "Tên đăng nhập hoặc Email đã tồn tại. Vui lòng chọn cái khác."
                });
            }

            res.status(400).json({
                status: "error",
                message: error.message || "Đã xảy ra lỗi trong quá trình đăng ký."
            });
        } finally {
            session.endSession();
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
            const user = await User.findOne({
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

            // Kiểm tra số lần đăng nhập sai
            if (user.loginAttempts >= 5 && user.lockUntil > Date.now()) {
                const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
                return res.status(429).json({
                    status: "error",
                    message: `Your account is temporarily locked for ${remainingTime}s. Please wait before attempting to log in again.`
                });
            }

            // So sánh mật khẩu
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                user.loginAttempts++;
                if (user.loginAttempts >= 5) {
                    user.lockUntil = Date.now() + 5 * 60 * 1000; // Khoá 5 phút
                }

                await user.save();

                return res.status(401).json({
                    status: "error",
                    message: "Invalid login information",
                    remainingAttempts: 5 - user.loginAttempts
                });
            } else {
                user.loginAttempts = 0;
                await user.save();
            }

            // Tạo token
            const accessToken = jwt.sign(
                { id: user._id, username: user.username, role: user.role, customerProfileId: user.customerProfile },
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
                    customerProfileId: user.customerProfile
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
            const user = await User.findOne({ "tokens.token": refreshToken });
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
            const user = await User.findById(userId).select('+password');
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
                // Sai mật khẩu thì tăng loginAttempts
                await user.incrementLoginAttempts();
                return res.status(401).json({
                    status: "error",
                    message: "Incorrect password!"
                });
            } else {
                // Nhập mật khẩu đúng thì reset loginAttempts
                await user.resetLoginAttempts();
            }

            // Đổi mật khẩu mới
            user.password = newPassword;
            await user.save();

            res.json({
                status: "success",
                message: "Change password successfully!"
            });
        } catch (error) {
            res.status(400).json({
                status: "error",
                message: error.message
            });
        }
    }
}

module.exports = AuthController;