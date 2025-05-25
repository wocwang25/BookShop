const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const ReportController = require('../controllers/report.controller');

router.get('/inventory-report', AuthService.verifyToken, ReportController.getMonthlyInventoryReport);
router.get('/debt-report', AuthService.verifyToken, ReportController.getMonthlyDebtReport);


module.exports = router;
