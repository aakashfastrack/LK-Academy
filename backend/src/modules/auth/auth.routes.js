const express = require("express");
const router = express.Router();
const {
  login,
  register,
  bulkRegister,
  AdminRegister,
  changingPass,
  updatePass,
} = require("./auth.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");

router.post("/register", register);
router.post("/register_super", AdminRegister);
router.post("/login", login);
router.put("/changepass/:id", protect, changingPass);
router.post("/register/bulk", protect, bulkRegister);

router.put("/update-password", protect, requireRole("SUPER_ADMIN"), updatePass);

module.exports = router;
