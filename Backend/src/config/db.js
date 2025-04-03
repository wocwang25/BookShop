const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_HOST, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 3000 // Thời gian chờ kết nối -> 30s
        });
        console.log(`Connected to mongodb at ${mongoose.connection.host}`);

    } catch (err) {
        console.error("Connection error:", err.message);
        process.exit(1);
    }
};

module.exports = connectDB;