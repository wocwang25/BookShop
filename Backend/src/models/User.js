const mongoose = require('mongoose');
const bcrypt = require('bcrypt')

const User_Schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
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
            default: 'customer',
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
        debt: {
            type: Number,
            default: 0
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

const { DebtReport } = require('../features/documents/report/report.model');

User_Schema.pre('save', async function (next) {
    // Nếu không phải document mới, bỏ qua
    if (!this.isNew) {
        return next();
    }

    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const debt_report = await DebtReport.findOne({ month: month, year: year });
        if (!debt_report) throw new Error(`No debt report found for ${month}/${year}`);

        debt_report.debt_log.push({
            customer: doc._id,
            opening_debt: doc.debt,
            closing_debt: doc.debt,
            transactions: []
        })

        await debt_report.save();

        next();

    } catch (error) {
        console.error(error);
        next(error);
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
