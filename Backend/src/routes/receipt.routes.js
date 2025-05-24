const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const PaymentReceiptController = require('../controllers/receipt.controller');

router.post('/', AuthService.verifyToken, PaymentReceiptController.createPaymentReceipt);

module.exports = router;
