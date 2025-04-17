const mongoose = require('mongoose');
const User = require('../models/CoreModels/User');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
    await mongoose.connect(process.env.DB_HOST);
    root = JSON.parse(process.env.Admin_infor);
    const adminExists = await User.findOne({ username: root.username });
    if (!adminExists) {
        // const hashedPassword = await bcrypt.hash('lolianime', process.env.SALT_ROUNDS);
        user = new User({
            username: root.username,
            password: root.password,
            role: 'admin'
        });
        await user.save();

        console.log('✅ Admin created');
    } else {
        console.log('ℹ️ Admin already exists');
    }
    mongoose.disconnect();
}

createAdmin();
