//Setting
require('dotenv').config();
const express = require('express');
const body_parser = require('body-parser');
const cors = require('cors');
const app = express();
const cookieParser = require("cookie-parser");
const connectDB = require('./src/config/db');
connectDB();
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(body_parser.json());
app.use(express.urlencoded({ extended: true }));

//API
app.use('/auth', require('./src/features/auth/auth.routes'));

module.exports = app;