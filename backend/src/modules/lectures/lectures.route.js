const express = require("express");
const router = express.Router();

const lectureController = require("./lectures.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

router.post(
  "/",
  protect,
  requireRole("SUPER_ADMIN", "BRANCH_ADMIN"),
  lectureController.create,
);

router.get("/", protect, lectureController.getAlllectures);

router.get("/lec", protect, lectureController.getlecture);

router.get("/lectureatt", protect, lectureController.getLecturesbyId);

router.get("/branch/:batchId", protect, lectureController.getByBranchAndDate);

router.delete("/:id", protect, lectureController.remove);

router.delete(
  "/att/:id",
  protect,
  lectureController.deleteFacultyAttendanceController,
);

router.put("/:id", protect, lectureController.update);

router.post(
  "/reset-cycle/:lectureId",
  protect,
  requireRole("SUPER_ADMIN", "BRANCH_ADMIN"),
  lectureController.resetLectureCycleController,
);

module.exports = router;
