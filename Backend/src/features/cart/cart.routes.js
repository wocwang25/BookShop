const express = require('express');
const router = express.Router();
const { verifyToken, refreshToken } = require('../auth/auth.middleware');
const { addItem,
    removeItem,
    increaseItemQuantity,
    decreaseItemQuantity,
    setItemQuantity } = require('./cart.controller')

router.post('/', verifyToken, addItem);
router.delete('/', verifyToken, removeItem);
router.patch('/increase', verifyToken, increaseItemQuantity);
router.patch('/decrease', verifyToken, decreaseItemQuantity);
router.patch('/set', verifyToken, setItemQuantity);

module.exports = router;