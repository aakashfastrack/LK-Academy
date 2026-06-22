const express = require("express");
const router = express.Router();

const controller = require("./staffAttendance.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

router.post(
  "/",
  protect,
  requireRole("BRANCH_ADMIN", "SUPER_ADMIN"),
  controller.mark,
);

router.get("/report", protect, controller.monthlyReport);

router.get(
  "/report/salary-summary/:staffId",
  protect,
  controller.staffSalarySummaryController,
);

router.patch(
  "/update/:attendanceId",
  protect,
  requireRole("BRANCH_ADMIN", "SUPER_ADMIN"),
  controller.updateAttendanceController,
);

router.get(
  "/:attendanceId",
  protect,
  requireRole("BRANCH_ADMIN", "SUPER_ADMIN"),
  controller.fetchstaffAttendanceById,
)

module.exports = router;
