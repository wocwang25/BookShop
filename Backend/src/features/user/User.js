const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('./middlewares/userPassword');

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

User_Schema.pre('save', hashPassword);
User_Schema.methods.comparePassword = comparePassword;

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