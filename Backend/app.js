require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors')
const app = express();

const connectDB = require('../../BookShop/Backend/src/config/db');
connectDB();

app.use(express.json());
app.use(body_parser.json());

app.get('/', (req, res) => {
    res.send('Home Page');
});
app.get('/about', (req, res) => {
    res.send('About Page with Express');
});
app.post('/data', (req, res) => {
    console.log(req.body);
    res.json({ message: 'Data received', data: req.body });
});

app.use("/api/auth", require("./src/routes/CLIENT.route"));


// Xử lý 404 (phải đặt cuối cùng, sau các routes khác)
app.use((req, res) => {
    res.status(404).send('404 - Trang không tồn tại. Sẽ chuyển hướng sau 3 giây...');
});

module.exports = app; // Export app để server.js sử dụng