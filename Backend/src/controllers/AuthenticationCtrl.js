const User = require('../models/CoreModels/User');
const USER = require('../models/CoreModels/User');



//  Tính năng đăng kí
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = new USER({ username, password });
        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            success: true,
            data: userResponse
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
};

//  Tính năng đăng nhập
exports.login = async (req, res) => {
    try {
        if (loginn === try_login) {
            return res.status(400).json({
                message: "Quá lượt đăng nhập, đợi 1p"
            })
        }
        const { username, password } = req.body;

        const user = User.findOne({ username }).select('+password');

        if (!user || !(await user.comparePassword(password))) {
            loginn++;
            return res.status(401).json({
                success: false,
                error: "[Error] Username or Password incorrect"
            });
        }

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


        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: use.username,
                role: user.role
            }
        })
    }
    catch (error) {
        res.status(505).json({
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
                error: "Sai mật khẩu đjtme mày"
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