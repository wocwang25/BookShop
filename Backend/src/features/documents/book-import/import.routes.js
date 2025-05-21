const { createBookImport, getBookImport } = require('./import.controller');
const { checkRole } = require('../../auth/auth.middleware');
const { verifyToken } = require('../../auth/auth.middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), createBookImport);
router.get('/get', verifyToken, checkRole('staff'), getBookImport);
module.exports = router;