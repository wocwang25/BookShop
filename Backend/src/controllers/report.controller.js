const ReportService = require('../services/report.service');

const ReportController = {
    async getMonthlyInventoryReport(req, res) {
        try {
            const { month, year } = req.body;
            const report = await ReportService.getMonthlyInventoryReport(month, year);

            res.status(200).json(report);
        } catch (error) {
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    },
    async getMonthlyDebtReport(req, res) {
        try {
            const { month, year } = req.body;
            const report = await ReportService.getMonthlyDebtReport(month, year);

            res.status(200).json(report);
        } catch (error) {
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}

module.exports = ReportController;