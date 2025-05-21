const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../../auth/auth.middleware');
const { getAllUser, changeRole } = require('./admin.controller');

router.get('/:role', getAllUser)
router.patch('/:id', verifyToken, checkRole('admin'), changeRole)

module.exports = router;
