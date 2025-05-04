const Report = require('./report.controller');
const { checkRole } = require('../../auth/middleware');
const { verifyToken } = require('../../auth/middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), Report.createReport);
router.get('/get-debtreport', verifyToken, checkRole('staff'), Report.getDebtReport);
router.get('/get-inventoryreport', verifyToken, checkRole('staff'), Report.getInventoryReport);
module.exports = router;