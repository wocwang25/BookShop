const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const CustomerController = require('../controllers/customer.controller');

router.get('/profile', AuthService.verifyToken, CustomerController.getProfile)
router.get('/:customerId', AuthService.verifyToken, CustomerController.getCustomerById)
router.get('/', AuthService.verifyToken, CustomerController.getAllCustomers)
router.patch('/profile', AuthService.verifyToken, CustomerController.updateProfile)

module.exports = router;
