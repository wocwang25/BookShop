const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const BookController = require('../controllers/book.controller');
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/search", BookController.searchBook); // tìm kiếm
router.get("/", BookController.getAllBook); // Lấy tất cả sách
router.get("/:id", BookController.getBookById); // Lấy sách theo ID
router.put("/:id", AuthService.verifyToken, AuthService.checkRole('admin'), BookController.updateBook); // Cập nhật sách
router.delete("/:id", AuthService.verifyToken, AuthService.checkRole('admin'), BookController.deleteBook); // Xóa sách
router.post("/import", AuthService.verifyToken, AuthService.checkRole('admin'), BookController.createBook);
router.post("/import-csv", AuthService.verifyToken, AuthService.checkRole('admin'), upload.single("file"), BookController.importBooksFromCSV);

module.exports = router;
