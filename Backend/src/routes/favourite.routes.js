const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const FavouriteController = require('../controllers/favourite.controller');

router.get('/', AuthService.verifyToken, FavouriteController.getBookFavouriteList);
router.post('/:id', AuthService.verifyToken, FavouriteController.addBookToFavourite);
router.patch('/:id', AuthService.verifyToken, FavouriteController.removeBookFromFavourite);


module.exports = router;
