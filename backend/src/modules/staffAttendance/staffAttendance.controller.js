const service = require("./staffAttendance.service");

const mark = async (req, res) => {
  try {
    const record = await service.markStaffAttendance({
      staffId: Number(req.body.staffId),
      branchId: req.body.branchId,
      shiftStartTime: new Date(req.body.shiftStartTime),
      shiftEndTime: new Date(req.body.shiftEndTime),
      actualInTime: new Date(req.body.actualInTime),
      actualOutTime: new Date(req.body.actualOutTime),
      date:new Date(req.body.date),
      status:req.body.status
    });

    res.json({
      success: true,
      message: "Staff attendance marked",
      data: record,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const monthlyReport = async (req, res) => {
  const { staffId, month, year } = req.query;

  const data = await service.getStaffMonthlyReport(
    Number(staffId),
    Number(month),
    Number(year)
  );

  res.json({ success: true, data });
};

const staffSalarySummaryController = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { month, year } = req.query;

    const summary = await service.getStaffMonthlySalarySummary(
      Number(staffId),
      Number(month),
      Number(year)
    );

    res.json({
      message: "Staff salary summary fetched successfully",
      success: true,
      data: summary,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

module.exports = {
  mark,
  monthlyReport,
  staffSalarySummaryController,
};
