const express = require('express');
const router = express.Router();

// Import các route con
const bookImportRoutes = require('./book-import/import.routes');
const InvoiceRoutes = require('./invoice/invoice.routes');
const ReceiptRoutes = require('./payment-receipt/receipt.routes');

router.use('/book-import', bookImportRoutes);
router.use('/invoice', InvoiceRoutes);
router.use('/receipt', ReceiptRoutes);

module.exports = router;

