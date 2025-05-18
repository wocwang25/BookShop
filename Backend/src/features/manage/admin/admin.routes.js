const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../../auth/middleware');
const { getAllUser, changeRole } = require('./admin.controller');

router.get('/:role', verifyToken, checkRole('admin'), getAllUser)
router.patch('/:id', verifyToken, checkRole('admin'), changeRole)

module.exports = router;
