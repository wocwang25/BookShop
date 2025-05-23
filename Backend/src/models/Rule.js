const mongoose = require('mongoose');

const Rule_Schema = mongoose.Schema(
    {
        code: {
            type: String,
            required: true
        },
        ruleValue: mongoose.Schema.Types.Mixed,
        description: String,
        is_active: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Rule', Rule_Schema);