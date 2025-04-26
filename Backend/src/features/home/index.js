const express = require('express');
const router = express.Router();
const User_Middleware = require('../user/userMdw');
// Trang chủ
router.get('/', (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', User_Middleware.verifyTokenFromCookie, (req, res) => {
    const user = req.user || req.session.user || null; // tuỳ bạn lưu user vào đâu

    if (!user) {
        return res.redirect('/auth/login');
    }

    res.render('dashboard', {
        user: user
    });
});


module.exports = router;