const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const CustomerController = require('../controllers/customer.controller');

router.get('/profile', AuthService.verifyToken, CustomerController.getProfile)
router.patch('/profile', AuthService.verifyToken, CustomerController.updateProfile)

router.post('/register', CustomerController.registerCustomerAccount);
router.post('/login', CustomerController.loginCustomerAccount);
router.patch('/change-password', AuthService.verifyToken, CustomerController.changePassword);
router.post('/logout', AuthService.verifyToken, CustomerController.logoutCustomer);

module.exports = router;
