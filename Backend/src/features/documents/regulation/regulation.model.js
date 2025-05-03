const mongoose = require('mongoose');

const regulationSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true }, // QĐ1, QĐ2, QĐ4
        name: { type: String, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: false },
        is_active: { type: Boolean, default: true },
        description: { type: String },
        created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    {
        timestamps: true
    });

module.exports = mongoose.model('RegulationSchema', regulationSchema)