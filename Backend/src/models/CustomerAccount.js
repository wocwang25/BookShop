const mongoose = require('mongoose');

const CustomerAccountSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
        unique: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false  // Không tự động trả về trong các truy vấn
    },
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
}, {
    timestamps: true
});

const bcrypt = require('bcrypt')

CustomerAccountSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('CustomerAccount', CustomerAccountSchema);
