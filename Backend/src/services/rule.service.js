const Rule = require('../models/Rule');

const RuleService = {
    async validateRuleValue(code, ruleValue) {
        switch (code) {
            case "QD1":
                return ruleValue.hasOwnProperty("min_import") && ruleValue.hasOwnProperty("min_stock");
            case "QD2":
                return ruleValue.hasOwnProperty("max_debt") && ruleValue.hasOwnProperty("min_stock");
            default:
                return false;
        }
    },
    async findOrCreateOrUpdateRule(data) {
        const { code, ruleValue, description, active } = data;

        if (!this.validateRuleValue(code, ruleValue)) {
            throw new Error(`Invalid ruleValue for rule ${code}`);
        }

        const updated = await Rule.findOneAndUpdate(
            { code },
            {
                $set: {
                    ruleValue,
                    description,
                    is_active: active !== undefined ? active : true,
                    updatedAt: new Date()
                }
            },
            { upsert: true, new: true } // Tạo mới nếu chưa có
        );

        return updated;
    },
    async findAllRules() {
        return await Rule.find();
    },
    async findRuleByCode(code) {
        return await Rule.find({ code });
    },
    async findAndDeleteRule(code) {
        const rule = await Rule.findOne({ code });

        if (!rule) {
            throw new Error(`Rule with code ${code} not found.`);
        }

        await Rule.deleteOne({ code });
        return { message: `Rule with code ${code} has been deleted.` };
    }
}

module.exports = RuleService;