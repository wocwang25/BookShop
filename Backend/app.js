require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const app = express();

const connectDB = require('./src/config/db');
connectDB();

const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Thêm CORS middleware
app.use(cors());

app.use(express.json());
app.use(body_parser.json());

app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/auth.routes'));
app.use('/api/rules', require('./src/routes/rule.routes'))
app.use('/api/books', require('./src/routes/book.routes'))
app.use('/api/import-slip', require('./src/routes/importslip.routes'))
app.use('/api/sales-invoice', require('./src/routes/salesinvoice.routes'))
app.use('/api/payment-receipt', require('./src/routes/receipt.routes'))
app.use('/api/reports', require('./src/routes/report.routes'))

module.exports = app; // Export app để server.js sử dụng