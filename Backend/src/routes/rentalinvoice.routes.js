const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const RentalInvoiceController = require('../controllers/rentalinvoice.controller');

router.post('/rent', AuthService.verifyToken, RentalInvoiceController.createRentalInvoice);

module.exports = router;
