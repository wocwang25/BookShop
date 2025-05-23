const { createInvoice, getInvoice } = require('./invoice.controller');
const { checkRole } = require('../../auth/auth.middleware');
const { verifyToken } = require('../../auth/auth.middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), createInvoice);
router.get('/get', verifyToken, checkRole('staff'), getInvoice);
module.exports = router;