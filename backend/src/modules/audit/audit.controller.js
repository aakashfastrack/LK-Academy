const service = require("./audit.service");

const getAuditLogsController = async (req, res) => {
  try {
    const logs = await service.getAuditLogs();

    res.status(200).json({
      success: true,
      message: "Audit logs fetched successfully",
      data: logs,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getAuditLogsController,
};
