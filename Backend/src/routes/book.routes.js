const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const BookController = require('../controllers/book.controller');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", BookController.searchBook);
router.post("/import", AuthService.verifyToken, AuthService.checkRole('admin'), BookController.createBook);
router.post("/import-csv", AuthService.verifyToken, AuthService.checkRole('admin'), upload.single("file"), BookController.importBooksFromCSV);

module.exports = router;
