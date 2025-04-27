const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const User_Schema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator: async function (username) {
                    const user = await this.constructor.findOne({ username });
                    return !user || this._id.equals(user._id);
                },
                message: "username đã tồn tại"
            }
        },
        password: {
            type: String,
            select: false,
            required: true
        },
        email: {
            type: String
        },
        role: {
            type: String,
            enum: ['admin', 'staff', 'customer'],
            default: 'staff',
            required: true
        },
        contact_info: {
            phone: {
                type: String,
                unique: false
            },
            address: {
                type: String,
                unique: false
            },
            // default: "You've not updated yet"
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active'
        },
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        tokens: [
            {
                token: {
                    type: String,
                    required: true
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                    expires: 60 * 60 * 24 // Token hết hạn sau 1 ngày (tuỳ chỉnh)
                }
            }
        ]
    },
    {
        timestamps: true,
    }
)

// const rateLimit = require('express-rate-limit');

// const loginLimiter = rateLimit({
//     windowMs: 60 * 1000,
//     max: 5,
//     skipSuccessfulRequests: true,
//     message: "Thử quá nhiều lần, vui lòng thử lại sau 1 phút"
// });

User_Schema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});
User_Schema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) {
        throw new Error('No password set for this user');
    }
    return bcrypt.compare(candidatePassword, this.password);
};

User_Schema.methods.isLocked = function () {
    return this.lockUntil && this.lockUntil > Date.now();
}

User_Schema.methods.incrementLoginAttempts = async function () {
    this.loginAttempts++;
    if (this.loginAttempts >= 5) {
        this.lockUntil = Date.now() + 5 * 60 * 1000;
    }
    await this.save();
}

User_Schema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = undefined;
    await this.save();
}

module.exports = mongoose.model('User', User_Schema);


// // Update -> chỉ có admin mới có quyền update
// exports.update = async (req, res) => {
//     const { id, role } = req.body;
//     const validRoles = ['admin', 'seller', 'customer'];
//     const user = await USER.findById(id);
//     if (!user || !validRoles.includes(role)) {
//         res.status(400).json({
//             message: "Người dùng/Role không tồn tại"
//         });
//     }
//     user.role = role;
//     await user.save();

//     res.json({
//         success: true,
//         message: `Cập nhật role ${role} thành công cho user ${id}`
//     })
// }
