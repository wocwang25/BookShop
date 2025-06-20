const FavouriteService = require('../services/favourite.service')

const FavouriteController = {
    async addBookToFavourite(req, res) {
        try {
            const customerId = req.user.id;
            const bookId = req.params.bookId;

            const result = await FavouriteService.addBookToFavourite(customerId, bookId);
            res.json(result)
        } catch (error) {
            res.status(500).json(error.message)
        }
    },
    async removeBookFromFavourite(req, res) {
        try {
            const customerId = req.user.id;
            const bookId = req.params.bookId;

            const result = await FavouriteService.removeBookFromFavourite(customerId, bookId);
            res.json(result)
        } catch (error) {
            res.status(500).json(error.message)
        }
    },
    async getBookFavouriteList(req, res) {
        try {
            const customerId = req.user.id;

            const result = await FavouriteService.getBookFavouriteList(customerId);
            res.json(result)
        } catch (error) {
            res.status(500).json(error.message)
        }
    }
}

module.exports = FavouriteController