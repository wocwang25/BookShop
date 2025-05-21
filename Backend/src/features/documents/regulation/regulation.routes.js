const { createRegulation, updateRegulation, getRegulations } = require('./regulation.controller');
const { checkRole } = require('../../auth/auth.middleware');
const { verifyToken } = require('../../auth/auth.middleware');
const express = require('express');
const router = express.Router();

router.post('/create', verifyToken, checkRole('staff'), createRegulation);
router.post('/:code', verifyToken, checkRole('staff'), updateRegulation);
router.get('/get', verifyToken, checkRole('staff'), getRegulations);
module.exports = router;