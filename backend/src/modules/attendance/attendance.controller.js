const {
  markLectureAttendance,
  getFacultyMonthlySummary,
  markSalaryBasedFacultyAttendance,
  getSalaryBasedFacultyMonthlySummary,
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
      Number(year)
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
      Number(year)
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

module.exports = {
  markAttendance,
  facultyMonthlySummaryController,
  markFacultyAttendanceController,
  salaryBasedFacultySummaryController,
};
