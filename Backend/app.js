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

app.use('/auth', require('./src/features/auth/auth.routes'));
app.use('/cart', require('./src/features/cart/cart.routes'));
app.use('/manage', require('./src/features/manage/index.routes'));
app.use('/documents', require('./src/features/documents/index.routes'))

module.exports = app; // Export app để server.js sử dụng