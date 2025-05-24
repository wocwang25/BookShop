const BookImportService = require('../services/importslip.service');


const BookImportController = {
    async createImportSlip(req, res) {
        try {
            const userId = req.user.id;
            const { items } = req.body;
            const result = await BookImportService.createImportSlip({ userId, items });

            res.status(201).json({ message: 'Import slip created successfully', result });
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },
    async importFromCSV(req, res) {
        try {
            const userId = req.user.id;
            const filePath = req.file.path;

            const result = await BookImportService.createImportSlipFromCSV(filePath, userId);

            // await fs.unlink(filePath);
            res.status(201).json({
                message: "Import completed",
                ...result
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = BookImportController;