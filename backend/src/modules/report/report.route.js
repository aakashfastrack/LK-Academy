const express = require("express");
const router = express.Router();

const reportController = require("./report.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

router.post(
  "/generate",
  protect,
  requireRole("SUPER_ADMIN", "BRANCH_ADMIN"),
  reportController.generateReportController
);

module.exports = router