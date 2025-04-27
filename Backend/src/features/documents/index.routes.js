const express = require('express');
const router = express.Router();

// Import các route con
const bookImportRoutes = require('./bookImport/bookImport.routes');
const paymentReceiptRoutes = require('./paymentReceipt/receipt.routes');

router.use('/book-imports', bookImportRoutes);
router.use('/receipts', paymentReceiptRoutes);

module.exports = router;

