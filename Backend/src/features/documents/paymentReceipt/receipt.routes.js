const { createPaymentReceipt, getReceipt } = require('./receipt.controller');
const { checkRole } = require('../../auth/middleware');
const { verifyToken } = require('../../auth/middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), createPaymentReceipt);
router.get('/get', verifyToken, checkRole('staff'), getReceipt);
module.exports = router;