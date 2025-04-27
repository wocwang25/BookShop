const express = require('express');
const router = express.Router();

// Import các route con
const bookImportRoutes = require('./bookImport/bookImport.routes');

router.use('/book-imports', bookImportRoutes);

module.exports = router;

