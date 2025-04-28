const { createBookImport, getBookImport } = require('./bookImport.controller');
const { checkRole } = require('../../auth/middleware');
const { verifyToken } = require('../../auth/middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), createBookImport);
router.get('/get', verifyToken, checkRole('staff'), getBookImport);
module.exports = router;