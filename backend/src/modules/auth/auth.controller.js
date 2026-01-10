const {
  loginUser,
  registerUser,
  bulkRegisterUser,
  registerSuperAdmin,
  changePassword,
} = require("./auth.service");

const login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({
        message: `phoneNumber and Password required`,
      });
    }

    const data = await loginUser(phoneNumber, password);

    res.status(200).json({
      success: true,
      message: "Login successfully",
      data,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, phoneNumber, role, branchId, shiftStartTime, shiftEndTime, salary , facultyType , lectureRate  } =
      req.body;

    if (!name || !phoneNumber || !role || !branchId) {
      return res.status(400).json({
        message: "Name, phoneNumber, password, and role are required",
      });
    }

    const password = name + role;

    const user = await registerUser({
      name,
      phoneNumber,
      password,
      role,
      branchId,
      shiftStartTime,
      shiftEndTime,
      salary,
      facultyType,
      lectureRate
    });

    res.status(200).json({
      success: true,
      message: "User created Successfully",
      data: user,
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

const AdminRegister = async (req, res) => {
  try {
    const { name, phoneNumber, password } = req.body;

    if (!name || !phoneNumber || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const result = await registerSuperAdmin({ name, phoneNumber, password });

    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

const bulkRegister = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        message: "Users array is required",
      });
    }

    const result = await bulkRegisterUser(users, req.user);

    req.status(201).json({
      success: true,
      message: "Bulk User creation completed",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

const changingPass = async(req,res) =>{
  try{

    const id = Number(req.params.id);
    const {newPass,oldPass} = req.body;

    const data = await changePassword(id,newPass,oldPass);


    if(data === "wrong pass"){
      res.json({
        success:false,
        message:"Wrong password"
      })
    }

    res.json({
      success:true,
      message:"Password changed successfully",
      data:data
    })

  }catch(err){
    return res.status(400).json({
      success:false,
      message:err.message
    })
  }
}

module.exports = {
  login,
  register,
  bulkRegister,
  AdminRegister,
  changingPass
};
