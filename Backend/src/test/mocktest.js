// mockUser.js
const mongoose = require('mongoose');

// Không cần connect DB thật, dùng để tạo object thôi
mongoose.set('strictQuery', false); // tránh warning

// Khai báo schema
const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { versionKey: false });

// Tạo model giả
const User = mongoose.model('MockUser', userSchema);

// Tạo một instance giả để test
const mockUser = new User({
    username: 'yusato25',
    // email: 'yusato25@example.com',
    // password: '123456'
});

// In kết quả ra console
console.log("Mock User Object:\n", mockUser);
console.log("\nChuyển sang object thường:\n", mockUser.toObject());
