const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const AuthController = require('../controllers/auth.controller');

router.post('/register', AuthController.signup);
router.post('/login', AuthController.signin);
router.post('/logout', AuthController.logout);
router.get('/me', AuthService.verifyToken, AuthController.getProfile); // Endpoint để lấy thông tin user
router.get('/refresh-token', AuthService.refreshToken);
router.put('/change-password', AuthService.verifyToken, AuthController.changePassword);

module.exports = router;
