const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const BookImportController = require('../controllers/importslip.controller');


router.post('/', AuthService.verifyToken, BookImportController.getImportSlip);
router.post('/import', AuthService.verifyToken, BookImportController.createImportSlip);
router.post('/import-csv', AuthService.verifyToken, upload.single('file'), BookImportController.importFromCSV);

module.exports = router;
