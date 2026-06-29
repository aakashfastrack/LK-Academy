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
      date: new Date(req.body.date),
      status: req.body.status,
    });

    await createAuditLog({
      userId: req.user.id,
      action: "MARK_STAFF_ATTENDANCE",
      entity: "STAFF_ATTENDANCE",
      entityId: record.id,

      newData: record,

      description: `Staff attendance marked for staff ${record.staffId}`,
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
    Number(year),
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
      Number(year),
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

const updateAttendanceController = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const result = await service.updateAttendanceService({
      attendanceId: Number(attendanceId),
      actualInTime: req.body.actualInTime,
      actualOutTime: req.body.actualOutTime,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      message: "Attendance Updated Successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

const fetchstaffAttendanceById = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const result = await service.fetchAttendance(Number(attendanceId));

    res.status(200).json({
      success: true,
      message: "Attendance fetched successfully",
      data: result,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

const deleteStaffAttendanceController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await service.deleteStaffAttendance(id);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  mark,
  monthlyReport,
  staffSalarySummaryController,
  updateAttendanceController,
  fetchstaffAttendanceById,
  deleteStaffAttendanceController
};
