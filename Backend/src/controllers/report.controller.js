const ReportService = require('../services/report.service');

const ReportController = {
    async getMonthlyInventoryReport(req, res) {
        try {
            const { month, year } = req.query;
            
            if (!month || !year) {
                return res.status(400).json({ error: "Month and year are required" });
            }

            const report = await ReportService.getMonthlyInventoryReport(parseInt(month), parseInt(year));

            res.status(200).json(report);
        } catch (error) {
            console.error('Error in getMonthlyInventoryReport:', error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    },
    async getMonthlyDebtReport(req, res) {
        try {
            const { month, year } = req.query;
            
            if (!month || !year) {
                return res.status(400).json({ error: "Month and year are required" });
            }

            const report = await ReportService.getMonthlyDebtReport(parseInt(month), parseInt(year));

            res.status(200).json(report);
        } catch (error) {
            console.error('Error in getMonthlyDebtReport:', error);
            res.status(500).json({ error: error.message || "Internal server error" });
        }
    }
}

module.exports = ReportController;