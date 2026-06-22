const { createAuditLog } = require("../../utils/auditLogger");
const {
  markLectureAttendance,
  getFacultyMonthlySummary,
  markSalaryBasedFacultyAttendance,
  getSalaryBasedFacultyMonthlySummary,
  updateLectureAttendanceService,
  fetchAttendanceService,
} = require("./attendance.service");

const markAttendance = async (req, res) => {
  try {
    const { lectureId, actualStartTime, actualEndTime, payout, status, date } =
      req.body;

    const record = await markLectureAttendance({
      lectureId: Number(lectureId),
      actualStartTime: new Date(actualStartTime),
      actualEndTime: new Date(actualEndTime),
      status: status,
      payout: Number(payout),
      date: new Date(date),
    });

    let d = await createAuditLog({
      userId: req.user.id,
      action: "MARK_ATTENDANCE",
      entity: "LECTURE_ATTENDANCE",
      entityId: record.id,

      oldData: undefined,

      newData: {
        lectureId,
        actualStartTime,
        actualEndTime,
        payout,
        status,
        date,
      },

      description: `Lecture attendance marked for lecture ${lectureId}`,
    });

    res.json({
      success: true,
      message: "Lecture attendance marked",
      data: record,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const facultyMonthlySummaryController = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { month, year } = req.query;

    const summary = await getFacultyMonthlySummary(
      Number(facultyId),
      Number(month),
      Number(year),
    );

    res.json({
      message: "Summary for lecture Based",
      data: summary,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// Salary Based Faculty Logic
const markFacultyAttendanceController = async (req, res) => {
  try {
    const attendance = await markSalaryBasedFacultyAttendance(req.body);

    await createAuditLog({
      userId: req.user.id,
      action: "MARK_FACULTY_ATTENDANCE",
      entity: "FACULTY_ATTENDANCE",
      entityId: attendance.id,

      newData: attendance,

      description: `Faculty attendance marked for faculty ${attendance.facultyId}`,
    });

    res.json({
      message: "Faculty attendance marked Successfully",
      data: attendance,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: false,
    });
  }
};

const salaryBasedFacultySummaryController = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const { month, year } = req.query;

    const summary = await getSalaryBasedFacultyMonthlySummary(
      Number(facultyId),
      Number(month),
      Number(year),
    );

    res.json({
      message: "Faculty attendance marked Successfully",
      data: summary,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: true,
    });
  }
};

const updateLectureAttendanceController = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const result = await updateLectureAttendanceService({
      attendanceId: Number(attendanceId),
      actualStartTime: req.body.actualStartTime,
      actualEndTime: req.body.actualEndTime,
      status: req.body.status,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "Lecture attendance updated successfully",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const fetchAttendanceController = async (req, res) => {
  try {
    const { attendanceId } = req.params;

    const result = await fetchAttendanceService(Number(attendanceId));

    res.status(200).json({
      message: "Attendance Fetched Successfully",
      data: result,
      success: true,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  markAttendance,
  facultyMonthlySummaryController,
  markFacultyAttendanceController,
  salaryBasedFacultySummaryController,
  updateLectureAttendanceController,
  fetchAttendanceController,
};
