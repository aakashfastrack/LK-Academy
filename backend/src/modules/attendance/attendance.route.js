const express = require("express");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const router = express.Router();
const attendanceController = require("./attendance.controller");

router.get(
  "/:attendanceId",
  protect,
  requireRole("BRANCH_ADMIN","SUPER_ADMIN"),
  attendanceController.fetchAttendanceController
)

router.post(
    "/lecture/attendance",
    protect,
    requireRole("BRANCH_ADMIN","SUPER_ADMIN"),
    attendanceController.markAttendance
)


router.get(
  "/faculty/:facultyId/monthly-summary",
  protect,
  attendanceController.facultyMonthlySummaryController
);


router.post(
  "/faculty/attendance/mark",
  protect,
  attendanceController.markFacultyAttendanceController,
);

router.patch(
  "/update/:attendanceId",
  protect,
  requireRole("SUPER_ADMIN", "BRANCH_ADMIN"),
  attendanceController.updateLectureAttendanceController
);

router.get(
  "/faculty/salary-summary/:facultyId",
  protect,
  attendanceController.salaryBasedFacultySummaryController
);




module.exports = router