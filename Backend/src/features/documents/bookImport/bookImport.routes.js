const { createBookImport } = require('./bookImport.controller');
const { isStaff } = require('../../auth/middleware');
const { verifyToken } = require('../../auth/middleware');
const express = require('express');
const router = express.Router();

router.post('/', verifyToken, isStaff, createBookImport);
module.exports = router;