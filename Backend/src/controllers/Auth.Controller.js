const USER = require('../models/CoreModels/User');
const jwt = require('jsonwebtoken');

//  Tính năng đăng kí
exports.register = async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const user = new USER({ username, password, role });
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: "User registers successfully",
            data: userResponse
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: error.message
        });
    }
};

//  Tính năng đăng nhập
exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username or password is not presented"
        })
    }
    try {
        const user = await USER.findOne({ username }).select('+password');

        if (user.loginAttempts >= 5 && user.lockUntil > Date.now()) {
            const remainingTime = Math.ceil((user.lockUntil - Date.now()) / 1000);
            return res.status(429).json({
                success: false,
                error: `Tài khoản tạm khóa, vui lòng thử lại sau ${remainingTime} giây`
            })
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Sai thông tin đăng nhập thì tăng loginAttempts
            user.loginAttempts++;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 5 * 60 * 1000;
            }

            await user.save();

            return res.status(401).json({
                success: false,
                error: "Thông tin đăng nhập không chính xác",
                remainingAttempts: 5 - user.loginAttempts
            })
        }
        else {
            // Đăng nhập thành công thì reset loginAttempts
            user.loginAttempts = 0;
            await user.save();
        }

        // Tạo token đăng nhập bằng jsonwebtoken
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        })
    }
    catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({
            success: false,
            error: "Login Failed"
        })
    }
};

// Tính năng thay đổi mật khẩu -> áp dụng loginAttempts tương tự như đăng nhập để kiểm soát bruteforce
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select('+password');

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            // Sai mật khẩu thì tăng loginAttempts

            user.incrementLoginAttempts();

            return res.status(401).json({
                success: false,
                error: "Sai mật khẩu"
            });
        }
        else {
            // Nhập mật khẩu đúng thì reset loginAttempts

            user.resetLoginAttempts();
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: "Đổi mật khẩu thành công!"
        })
    }
    catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        })
    }
}

// Update -> chỉ có admin mới có quyền update
exports.update = async (req, res) => {
    const { id, role } = req.body;
    const validRoles = ['admin', 'seller', 'customer'];
    const user = await USER.findById(id);
    if (!user || !validRoles.includes(role)) {
        res.status(400).json({
            message: "Người dùng/Role không tồn tại"
        });
    }
    user.role = role;
    await user.save();

    res.json({
        success: true,
        message: `Cập nhật role ${role} thành công cho user ${id}`
    })
}

exports.profile = async (req, res) => {
    res.json(req.user);
}