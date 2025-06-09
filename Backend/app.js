require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const app = express();
const path = require('path')

const connectDB = require('./src/config/db');
connectDB();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Thêm CORS middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Cho phép frontend truy cập
    credentials: true, // Cho phép gửi cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(body_parser.json());

app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/customer', require('./src/routes/customer.routes'));
app.use('/api/rules', require('./src/routes/rule.routes'))
app.use('/api/books', require('./src/routes/book.routes'))
app.use('/api/import-slip', require('./src/routes/importslip.routes'))
app.use('/api/invoice', require('./src/routes/salesinvoice.routes'))
app.use('/api/invoice', require('./src/routes/rentalinvoice.routes'))
app.use('/api/payment-receipt', require('./src/routes/receipt.routes'))
app.use('/api/reports', require('./src/routes/report.routes'))
app.use('/api/favourite', require('./src/routes/favourite.routes'))
app.use('/api/reviews', require('./src/routes/review.routes'))
app.use('/api/cart', require('./src/routes/cart.routes'))

module.exports = app; // Export app để server.js sử dụng



