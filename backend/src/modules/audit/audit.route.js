const router = require("express").Router();
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const controller = require("./audit.controller");

router.get(
  "/",
  protect,
  requireRole("SUPER_ADMIN", "BRANCH_ADMIN"),
  controller.getAuditLogsController,
);

module.exports = router;
