const Book = require('../../../models/Book');
const Category = require('../../../models/Category');

// Create new category
exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Kiểm tra category đã tồn tại
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                error: 'Category already exists'
            });
        }

        const category = new Category({
            name,
            bookCount: 0
        });

        await category.save();

        res.status(201).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find()
            .populate('featuredBook', 'title author')

        res.status(200).json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Get all categories error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('featuredBook', 'title author')

        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category by ID error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Update category
exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Kiểm tra category tồn tại
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Kiểm tra tên mới có bị trùng không
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    error: 'Category name already exists'
                });
            }
        }

        // Cập nhật category
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name },
            { new: true, runValidators: true }
        ).populate('featuredBook', 'title author')

        res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Delete category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Kiểm tra xem category có sách không
        if (category.bookCount > 0) {
            return res.status(400).json({
                success: false,
                error: 'Cannot delete category with existing books'
            });
        }

        // Xóa category
        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Delete category successfully"
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Add featured book to category
exports.addFeaturedBook = async (req, res) => {
    try {
        const { bookId } = req.body;

        // Kiểm tra category tồn tại
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Kiểm tra book tồn tại
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({
                success: false,
                error: 'Book not found'
            });
        }

        // Kiểm tra book đã là featured chưa
        if (category.featuredBook.includes(bookId)) {
            return res.status(400).json({
                success: false,
                error: 'Book is already featured in this category'
            });
        }

        // Thêm book vào featured
        category.featuredBook.push(bookId);
        await category.save()

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Add featured book error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Remove featured book from category
exports.removeFeaturedBook = async (req, res) => {
    try {
        const { bookId } = req.body;

        // Kiểm tra category tồn tại
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Kiểm tra book có trong featured không
        if (!category.featuredBook.includes(bookId)) {
            return res.status(400).json({
                success: false,
                error: 'Book is not featured in this category'
            });
        }

        // Xóa book khỏi featured
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            {
                $pull: { featuredBook: bookId },
                $inc: { bookCount: -1 }
            },

            { new: true }
        ).populate('featuredBook', 'title author').lean();

        res.status(200).json({
            success: true,
            data: updatedCategory
        });
    } catch (error) {
        console.error('Remove featured book error:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};