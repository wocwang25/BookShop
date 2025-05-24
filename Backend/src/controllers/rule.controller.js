const Rule = require('../models/Rule');
const RuleService = require('../services/rule.service');

const RuleController = {
    async createOrUpdateRule(req, res) {
        try {
            const { code, ruleValue, description, active } = req.body;

            const rule = await RuleService.findOrCreateOrUpdateRule({ code, ruleValue, description, active });

            res.status(200).json(rule);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    async getAllRules(req, res) {
        try {
            const rules = await RuleService.findAllRules();
            res.status(200).json(rules);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    async getRuleByCode(req, res) {
        try {
            const { code } = req.params;
            const rule = await RuleService.findRuleByCode(code);

            if (!rule) {
                return res.status(404).json({ message: 'Rule not found' });
            }

            res.status(200).json(rule);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async deleteRuleByCode(req, res) {
        try {
            const { code } = req.params;
            const result = await RuleService.findAndDeleteRule(code);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    async updateRulebyCode(req, res) {
        try {
            const { code } = req.params;

            // Nếu là QD1 hoặc QD2, kiểm tra QĐ6
            if (["QD1", "QD2"].includes(code)) {
                const rule6 = await Rule.findOne({ code: "QD6" });
                if (!rule6?.is_active) {
                    return res.status(400).json({ error: "Không được phép thay đổi quy định khi QĐ6 đang tắt." });
                }
            }

            const updated = await Rule.findOneAndUpdate(
                { code },
                { $set: req.body }
            );
            res.status(200).json(updated);

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RuleController;