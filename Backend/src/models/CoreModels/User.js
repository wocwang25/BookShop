const mongoose = require('mongoose');
const User_mdw = require('../../middleware/userMdw');
const User_Middleware = require('../../middleware/userMdw');

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
            required: true,
            select: false,
            required: true
        },
        role: {
            type: String,
            enum: ['admin', 'seller', 'customer'],
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
        lockUntil: Date
    },
    {
        timestamps: true,
    }
)

User_Schema.pre('save', User_Middleware.hashpassword);
User_Schema.methods.comparePassword = User_mdw.comparePassword;

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