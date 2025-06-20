const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const CartController = require('../controllers/cart.controller')

router.get('/', AuthService.verifyToken, CartController.getCartItems);
router.get('/', AuthService.verifyToken, CartController.getItems);
router.post('/', AuthService.verifyToken, CartController.addToCart);
router.delete('/:bookId', AuthService.verifyToken, CartController.removeItem);


module.exports = router;
