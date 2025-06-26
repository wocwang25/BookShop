const CategoryService = require('../services/category.service');

const CategoryController = {
    async createCategory(req, res) {
        try {
            const { name } = req.body;
            const category = await CategoryService.createCategory(name);
            res.status(201).json(category);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    async getAllCategory(req, res) {
        try {
            const categories = await CategoryService.getAllCategory();
            res.json(categories);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            const category = await CategoryService.getCategoryById(id);
            res.json(category);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    },

    async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            await CategoryService.deleteCategory(id);
            res.json({ message: 'Category deleted successfully' });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
};

module.exports = CategoryController;