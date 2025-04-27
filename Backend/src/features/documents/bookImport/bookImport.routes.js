const { createBookImport } = require('./bookImport.controller');
const { checkRole } = require('../../auth/middleware');
const { verifyToken } = require('../../auth/middleware');
const express = require('express');
const router = express.Router();

router.post('/', verifyToken, checkRole('staff'), createBookImport);
module.exports = router;