const express = require('express');
const router = express.Router();

// Import các route con
const RegulationRoutes = require('./regulation/regulation.routes');
const bookImportRoutes = require('./book-import/import.routes');
const InvoiceRoutes = require('./invoice/invoice.routes');
const ReceiptRoutes = require('./payment-receipt/receipt.routes');
const ReportRoutes = require('./report/report.routes');

router.use('/regulation', RegulationRoutes);
router.use('/book-import', bookImportRoutes);
router.use('/invoice', InvoiceRoutes);
router.use('/receipt', ReceiptRoutes);
router.use('/report', ReportRoutes);

module.exports = router;

