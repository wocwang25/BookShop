const Regulation = require('./regulation.model');

exports.createRegulation = async (req, res) => {
    const { code, name, value, is_active, description } = req.body;
    const userId = req.user._id; // Lấy từ middleware xác thực

    try {
        // 1. Kiểm tra quy định đã tồn tại chưa
        const existingReg = await Regulation.findOne({ code });
        if (existingReg) {
            return res.status(400).json({
                status: 'error',
                message: `Quy định với mã ${code} đã tồn tại`
            });
        }

        // 2. Validate dữ liệu theo từng loại quy định
        let validationError;
        switch (code.toUpperCase()) {
            case 'QD1':
                if (!value || typeof value !== 'object' ||
                    !value.min_import_quantity ||
                    !value.min_inventory_before_import) {
                    validationError = 'QĐ1 cần có min_import_quantity và min_inventory_before_import';
                }
                break;

            case 'QD2':
                if (!value || typeof value !== 'object' ||
                    !value.max_debt ||
                    !value.min_inventory_after_sale) {
                    validationError = 'QĐ2 cần có max_debt và min_inventory_after_sale';
                }
                break;

            case 'QD4':
                if (typeof is_active !== 'boolean') {
                    validationError = 'QĐ4 cần giá trị boolean cho is_active';
                }
                break;

            default:
                validationError = 'Mã quy định không hợp lệ. Chỉ chấp nhận QD1, QD2 hoặc QD4';
        }

        if (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError
            });
        }

        // 3. Tạo quy định mới
        const newRegulation = await Regulation.create({
            code: code.toUpperCase(),
            name: name,
            value,
            is_active: code.toUpperCase() === 'QD4' ? is_active : true,
            description,
            created_by: userId,
            updated_by: userId
        });

        // 4. Trả về kết quả
        res.status(201).json({
            status: 'success',
            message: 'Tạo quy định mới thành công',
            data: newRegulation
        });

    } catch (error) {
        console.error('Lỗi khi tạo quy định:', error);
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi tạo quy định mới',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.updateRegulation = async (req, res) => {
    const { code } = req.params;
    const { value, is_active } = req.body;
    const userId = req.user._id;

    try {
        let validationError;
        switch (code) {
            case 'QD1':
                if (typeof value !== 'object' ||
                    !value.min_import_quantity ||
                    !value.min_inventory_before_import) {
                    validationError = 'QĐ1 cần giá trị dạng object với min_import_quantity và min_inventory_before_import';
                }
                break;
            case 'QD2':
                if (typeof value !== 'object' ||
                    !value.max_debt ||
                    !value.min_inventory_after_sale) {
                    validationError = 'QĐ2 cần giá trị dạng object với max_debt và min_inventory_after_sale';
                }
                break;
            case 'QD4':
                if (typeof is_active !== 'boolean') {
                    validationError = 'QĐ4 cần giá trị boolean cho is_active';
                }
                break;
            default:
                return res.status(400).json({
                    status: 'error',
                    message: 'Mã quy định không hợp lệ'
                });
        }

        if (validationError) {
            return res.status(400).json({
                status: 'error',
                message: validationError
            });
        }

        const updateData = {
            updated_by: userId
        };

        if (code !== 'QD4') {
            updateData.value = value;
        } else {
            updateData.is_active = is_active;
        }

        const updatedRegulation = await Regulation.findOneAndUpdate(
            { code },
            updateData,
            { new: true }
        );

        if (!updatedRegulation) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy quy định'
            });
        }

        res.json({
            status: 'success',
            data: updatedRegulation
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi khi cập nhật quy định'
        });
    }
};

exports.getRegulations = async (req, res) => {
    try {
        const regulations = await Regulation.find({}).sort({ code: 1 });
        res.json({
            status: 'success',
            data: regulations
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Lỗi khi lấy danh sách quy định'
        });
    }
};