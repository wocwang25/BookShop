require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path')

const connectDB = require('./Backend/src/config/db');
connectDB();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Frontend for Admin/Staff
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:4173',
        'https://bookshop-frontend-y515.onrender.com'
    ], // Cho phép frontend truy cập
    credentials: true, // Cho phép gửi cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(body_parser.json());

app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', require('./Backend/src/routes/auth.routes'));
app.use('/api/customer', require('./Backend/src/routes/customer.routes'));
app.use('/api/rules', require('./Backend/src/routes/rule.routes'))
app.use('/api/books', require('./Backend/src/routes/book.routes'))
app.use('/api/import-slip', require('./Backend/src/routes/importslip.routes'))
app.use('/api/invoice', require('./Backend/src/routes/salesinvoice.routes'))
app.use('/api/invoice', require('./Backend/src/routes/rentalinvoice.routes'))
app.use('/api/payment-receipt', require('./Backend/src/routes/receipt.routes'))
app.use('/api/reports', require('./Backend/src/routes/report.routes'))
app.use('/api/favourite', require('./Backend/src/routes/favourite.routes'))
app.use('/api/reviews', require('./Backend/src/routes/review.routes'))
app.use('/api/cart', require('./Backend/src/routes/cart.routes'))

// Serve static files (HTML, CSS, JS, images) from Frontend folder
app.use(express.static(path.join(__dirname, 'Frontend')));

// Route cho các trang chính (nếu muốn giữ đường dẫn đẹp)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/pages', 'HomePage.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/pages', 'login.html'));
});
app.get('/books', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/pages', 'books.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/pages', 'aboutUs.html'));
});
app.get('/bookDetail', (req, res) => {
    res.sendFile(path.join(__dirname, 'Frontend/pages', 'bookDetail.html'));
});

// 404 fallback
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'Frontend/pages', 'ErrorPage.html'));
});
module.exports = app; // Export app để server.js sử dụng



