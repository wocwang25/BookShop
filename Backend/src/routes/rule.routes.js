const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const RuleController = require('../controllers/rule.controller');

router.get('/', RuleController.getAllRules);
router.get('/:code', RuleController.getRuleByCode);
router.post('/', AuthService.verifyToken, AuthService.checkRole('admin'), RuleController.createOrUpdateRule);
router.put('/:code', AuthService.verifyToken, AuthService.checkRole('admin'), RuleController.updateRulebyCode);
router.delete('/:code', AuthService.verifyToken, AuthService.checkRole('admin'), RuleController.deleteRuleByCode);

module.exports = router;
