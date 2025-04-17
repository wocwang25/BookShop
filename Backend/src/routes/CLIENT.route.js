const express = require('express');
const router = express.Router();
const User_Middleware = require('../middleware/userMdw');
const {
    register,
    login,
    changePassword,
    update,
    profile,
} = require('../controllers/Auth.Controller');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Routes that require user to be logged in
router.use(User_Middleware.verifyToken);

router.put('/cp', changePassword);
router.put('/update', User_Middleware.isAdmin, update);
router.get('/profile', profile);

module.exports = router;
