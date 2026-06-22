const service = require("./report.service");

const generateReportController = async (req, res) => {
  try {
    const { branchIds } = req.body;
    const { month, year } = req.query;

    console.log(month, year);
    console.log(branchIds);

    const data = await service.generateReport({
      branchIds,
      month,
      year,
    });

    console.log(data)

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      data,
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  generateReportController,
};
