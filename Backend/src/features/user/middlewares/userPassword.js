const bcrypt = require('bcrypt');

module.exports = {
    hashPassword: async function (next) {
        if (!this.isModified('password')) return next();
        try {
            const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS));
            this.password = await bcrypt.hash(this.password, salt);
            next();
        } catch (err) {
            next(err);
        }
    },

    comparePassword: async function (candidatePassword) {
        if (!this.password) {
            throw new Error('No password set for this user');
        }
        return bcrypt.compare(candidatePassword, this.password);
    }
};
