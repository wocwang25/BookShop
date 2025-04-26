const USER = require('../features/user/User');
// const jwt = require('jsonwebtoken');

// Update -> chỉ có admin mới có quyền update
exports.update = async (req, res) => {
    const { id, role } = req.body;
    const validRoles = ['admin', 'seller', 'customer'];
    const user = await USER.findById(id);
    if (!user || !validRoles.includes(role)) {
        res.status(400).json({
            message: "Người dùng/Role không tồn tại"
        });
    }
    user.role = role;
    await user.save();

    res.json({
        success: true,
        message: `Cập nhật role ${role} thành công cho user ${id}`
    })
}


exports.renderProfile = async (req, res) => {
    const user = req.user;
    res.render('profile', { user }); // 👈 truyền data vào view
};
