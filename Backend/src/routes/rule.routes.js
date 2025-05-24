const express = require('express');
const router = express.Router();
const AuthService = require('../services/auth.service');
const RuleController = require('../controllers/rule.controller');

router.post('/', RuleController.createOrUpdateRule);
router.get('/', RuleController.getAllRules);
router.get('/:code', RuleController.getRuleByCode);
router.delete('/:code', RuleController.deleteRuleByCode);

module.exports = router;
