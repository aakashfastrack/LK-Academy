const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth.middleware");
const userController = require("./user.controller");
const { requireRole } = require("../../middleware/role.middleware");

router.post("/assign-branch", protect, userController.assignToBranch);

router.post("/assign-branch/bulk", protect, userController.bulkAssignToBranch);

router.get(
  "/allusers",
  protect,
  // requireRole("SUPER_ADMIN"),
  userController.AllUser
);

router.get("/branch/:branchId", protect, userController.listUsersByBranch);

router.post(
  "/make-branch-admin",
  protect,
  requireRole("SUPER_ADMIN"),
  userController.promoteToBranchAdmin
);

router.get(
  "/dashboard",
  protect,
  requireRole("SUPER_ADMIN","BRANCH_ADMIN"),
  userController.DashboardData
)

router.get("/role/dash",protect,userController.userDashboardData)

router.put(
  "/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  userController.update
)

router.delete(
  "/:id",
  protect,
  requireRole("SUPER_ADMIN"),
  userController.remove
)

module.exports = router;
