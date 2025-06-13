const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const SalesInvoiceController = require('../controllers/salesinvoice.controller');

router.get('/sale', AuthService.verifyToken, SalesInvoiceController.getAllSalesInvoice);
router.post('/sale', AuthService.verifyToken, SalesInvoiceController.createSalesInvoice);

module.exports = router;
