const Category = require('../models/Category');

const CategoryService = {
    async createCategory(name) {
        try {
            const existed = await Category.findOne({ name: name });
            if (existed) {
                throw new Error('Thể loại này đã tồn tại!');
            }
            const category = new Category({ name: name });
            await category.save();
            return category;
        } catch (error) {
            throw error;
        }
    },

    async getAllCategory() {
        try {
            const categories = await Category.find({});
            return categories;
        } catch (error) {
            throw error;
        }
    },

    async getCategoryById(id) {
        try {
            const category = await Category.findById(id);
            if (!category) {
                throw new Error('Thể loại này chưa tồn tại!');
            }
            return category;
        } catch (error) {
            throw error;
        }
    },

    async deleteCategory(id) {
        try {
            await Category.findOneAndDelete({ _id: id });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CategoryService;