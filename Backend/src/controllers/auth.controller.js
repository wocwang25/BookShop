const User = require('../models/User');
const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const AuthController = {
    signup: async (req, res) => {
        const { name, username, email, password } = req.body;
        console.log(req.body)
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

            let customerProfile = await Customer.findOne({ name: name, email: email }).session(session);
            // console.log(customerProfile)

            if (!customerProfile) {
                customerProfile = await new Customer({
                    name: name,
                    email: email
                });
                await customerProfile.save({ session });
            }

            const user = new User({
                name,
                username,
                email,
                password,
                customerProfile: customerProfile._id
            });
            await user.save({ session });

            await session.commitTransaction();

            // Tạo token cho user mới đăng ký
            const accessToken = jwt.sign(
                { id: user._id, username: user.username, role: user.role, customerProfileId: user.customerProfile },
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            );

            const userResponse = {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                customerProfileId: user.customerProfile
            };

            res.status(201).json({
                success: true,
                message: "Đăng ký tài khoản khách hàng thành công!",
                token: accessToken,
                user: userResponse
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
        console.log(req.body)
        if (!identifier || !password) {
            return res.status(400).json({
                status: "error",
                message: "Missing Login Information"
            });
        }
        // Tìm user bằng username hoặc email
        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        }).select('+password');
        console.log(user)


        try {
            // Tìm user bằng username hoặc email
            const user = await User.findOne({
                $or: [
                    { username: identifier },
                    { email: identifier }
                ]
            }).select('+password');
            console.log(user)

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
                    name: user.name,
                    username: user.username,
                    email: user.email,
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
    },

    // Method để lấy thông tin profile user (cần cho frontend)
    getProfile: async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId).populate('customerProfile');

            if (!user) {
                return res.status(404).json({
                    status: "error",
                    message: "User not found"
                });
            }

            const userResponse = {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                role: user.role,
                customerProfile: user.customerProfile
            };

            res.json({
                status: "success",
                user: userResponse
            });
        } catch (error) {
            res.status(500).json({
                status: "error",
                message: error.message
            });
        }
    },

    // Lấy tất cả users (Admin only)
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find()
                .populate('customerProfile', 'name email phone address debt')
                .select('-password')
                .sort({ createdAt: -1 });

            res.status(200).json({
                success: true,
                users: users,
                count: users.length
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi lấy danh sách người dùng',
                error: error.message
            });
        }
    },

    // Cập nhật thông tin user (Admin only)
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { name, email, role } = req.body;

            // Kiểm tra user tồn tại
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Cập nhật user
            const updatedUser = await User.findByIdAndUpdate(
                id,
                { name, email, role },
                { new: true }
            ).populate('customerProfile', 'name email phone address debt').select('-password');

            // Nếu có customerProfile, cập nhật thông tin trong Customer
            if (user.customerProfile) {
                await Customer.findByIdAndUpdate(
                    user.customerProfile,
                    { name, email },
                    { new: true }
                );
            }

            res.status(200).json({
                success: true,
                message: 'Cập nhật thông tin người dùng thành công',
                user: updatedUser
            });
        } catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi cập nhật thông tin người dùng',
                error: error.message
            });
        }
    },

    // Xóa user (Admin only)
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;

            // Kiểm tra user tồn tại
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy người dùng'
                });
            }

            // Không cho phép xóa admin (có thể bỏ qua nếu muốn)
            if (user.role === 'admin') {
                return res.status(403).json({
                    success: false,
                    message: 'Không thể xóa tài khoản admin'
                });
            }

            await User.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: 'Xóa người dùng thành công'
            });
        } catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi xóa người dùng',
                error: error.message
            });
        }
    },

    // Tạo user mới (Admin only)
    createUser: async (req, res) => {
        try {
            const { name, username, email, password, role } = req.body;

            if (!name || !username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Vui lòng điền đầy đủ thông tin"
                });
            }

            const session = await mongoose.startSession();
            session.startTransaction();

            try {
                const existingUser = await User.findOne({
                    $or: [{ username }, { email }]
                }).session(session);

                if (existingUser) {
                    throw new Error("Tên đăng nhập hoặc Email đã tồn tại");
                }

                let customerProfile = null;
                // Chỉ tạo customer profile nếu role là customer
                if (role === 'customer') {
                    customerProfile = new Customer({
                        name,
                        email
                    });
                    await customerProfile.save({ session });
                }

                const user = new User({
                    name,
                    username,
                    email,
                    password,
                    role: role || 'customer',
                    customerProfile: customerProfile?._id
                });
                await user.save({ session });

                await session.commitTransaction();

                const userResponse = await User.findById(user._id)
                    .populate('customerProfile', 'name email phone address debt')
                    .select('-password');

                res.status(201).json({
                    success: true,
                    message: "Tạo người dùng thành công",
                    user: userResponse
                });

            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }

        } catch (error) {
            console.error("Create user error:", error);
            res.status(400).json({
                success: false,
                message: error.message || "Đã xảy ra lỗi khi tạo người dùng"
            });
        }
    },

    // Tìm kiếm users (Admin only)
    searchUsers: async (req, res) => {
        try {
            const { keyword } = req.query;
            
            if (!keyword || keyword.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Từ khóa tìm kiếm không được để trống'
                });
            }

            const searchRegex = new RegExp(keyword.trim(), 'i');
            
            const users = await User.find({
                $or: [
                    { name: searchRegex },
                    { username: searchRegex },
                    { email: searchRegex }
                ]
            })
            .populate('customerProfile', 'name email phone address debt')
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(50); // Giới hạn 50 kết quả

            res.status(200).json({
                success: true,
                users: users,
                count: users.length,
                keyword: keyword.trim()
            });
        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi khi tìm kiếm người dùng',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;