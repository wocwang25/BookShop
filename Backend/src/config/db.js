const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_HOST); // không cần truyền option nữa
        console.log(`✅ Connected to MongoDB Atlas: ${mongoose.connection.host}`);
    } catch (err) {
        console.error("Connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
