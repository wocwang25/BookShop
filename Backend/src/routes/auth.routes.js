const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const AuthController = require('../controllers/auth.controller');

router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.post('/logout', AuthController.logout);
router.get('/refresh-token', AuthService.refreshToken);
router.put('/change-password', AuthService.verifyToken, AuthController.changePassword);

module.exports = router;
