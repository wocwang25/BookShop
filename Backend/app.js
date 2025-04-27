require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const path = require('path');
const app = express();

const connectDB = require('../../BookShop/Backend/src/config/db');
connectDB();
const { session } = require('passport');

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(express.json());
app.use(body_parser.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', require('./src/features/auth/route'));
app.use('/book', require('./src/features/book/routes'));
app.use('/documents', require('./src/features/documents/index.routes'))

module.exports = app; // Export app để server.js sử dụng