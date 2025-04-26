const express = require('express');
const router = express.Router();
const { verifyToken, refreshToken } = require('./middleware');
const AuthModule = require('./controller');

router.post('/signup', AuthModule.signup);
router.post('/signin', AuthModule.signin);
router.post('/logout', AuthModule.logout);
router.get('/refresh-token', refreshToken);
router.put('/change-password', verifyToken, AuthModule.changePassword);

module.exports = router;
