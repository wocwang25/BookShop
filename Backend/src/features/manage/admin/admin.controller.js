const User = require('../../../models/User')

exports.getAllUser = async function (req, res) {
    try {
        const role = req.params.role
        console.log(role)
        let users;
        if (role === undefined) {
            users = await User.find();
        }
        else {
            users = await User.find({ role: role })
                .select('name email contact_info debt status')
        }

        res.json({
            status: 'success',
            results: users.length,
            data: users
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
exports.changeRole = async function (req, res) {
    try {
        const id = req.params.id
        const { role } = req.body
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        user.role = role;
        await user.save();

        res.json({
            status: 'success',
            data: user
        })
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
}
