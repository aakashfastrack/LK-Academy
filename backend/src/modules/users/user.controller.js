const { getOne } = require("../branch/branch.controller");
const { getBranchById } = require("../branch/branch.service");
const {
  assignUserToBranch,
  bulkAssignUsersToBranch,
  getUsersByBranch,
  makeBrancheAdmin,
  getAllUser,
  branchDashboard,
  updateUser,
  deleteUser,
  userDashboard,
} = require("./user.service");

const assignToBranch = async (req, res) => {
  try {
    const { userId, branchId } = req.body;

    if (!userId || !branchId) {
      return res.status(400).json({
        message: "userId and branchId is required",
      });
    }

    const user = await assignUserToBranch(
      Number(userId),
      Number(branchId),
      req.user
    );

    res.json({
      success: true,
      message: "User assigned to branch successfully",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const bulkAssignToBranch = async (req, res) => {
  try {
    const { userIds, branchId } = req.body;

    if (!Array.isArray(userIds) || !branchId) {
      return res.status(400).json({
        message: "userIds array and branchId are required",
      });
    }

    const result = await bulkAssignUsersToBranch(
      userIds.map(Number),
      Number(branchId),
      req.user
    );

    res.json({
      success: true,
      message: "Bulk branch assignment completed",
      data: result,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const listUsersByBranch = async (req, res) => {
  try {
    const branchId = Number(req.params.branchId);

    if (!branchId) {
      return res.status(400).json({
        message: "Invalid BranchId",
      });
    }

    const users = await getUsersByBranch(branchId, req.user);

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(403).json({
      message: error.message,
    });
  }
};

const promoteToBranchAdmin = async (req, res) => {
  try {
    const { userId, branchId } = req.body;

    console.log(userId);

    if (!userId || !branchId) {
      return res.status(400).json({ message: "userId and branchId required" });
    }

    const user = await makeBrancheAdmin(Number(userId), Number(branchId));

    res.json({
      success: true,
      message: "User promoted to Branch Admin",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const AllUser = async (req, res) => {
  try {
    const user = await getAllUser();

    return res.json({
      success: true,
      message: "All User",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const DashboardData = async (req, res) => {
  try {
    const dashboard = await branchDashboard();

    return res.json({
      success: true,
      message: "Dashboard",
      data: dashboard,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const userDashboardData = async (req, res) => {
  try {
    const { branchId, userId } = req.query;
    const dashboard = await userDashboard({
      branchId: Number(branchId),
      userId: Number(userId),
    });

    return res.json({
      success: true,
      message: "Dashboard",
      data: dashboard,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      name,
      phoneNumber,
      role,
      branchId,
      salary,
      shiftStartTime,
      shiftEndTime,
    } = req.body;

    const user = await updateUser(
      id,
      name,
      phoneNumber,
      role,
      branchId,
      salary,
      shiftStartTime,
      shiftEndTime
    );
    res.json({
      success: true,
      message: "User Updated",
      data: user,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userdelete = deleteUser(id);

    res.json({
      success: true,
      message: "User removed",
      data: userdelete,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
module.exports = {
  assignToBranch,
  bulkAssignToBranch,
  listUsersByBranch,
  promoteToBranchAdmin,
  AllUser,
  DashboardData,
  update,
  remove,
  userDashboardData,
};
