const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { prisma } = require("../../config/db");

const loginUser = async (phoneNumber, password) => {
  const user = await prisma.user.findUnique({
    where: { phoneNumber },
    include: { branch: true },
  });

  if (!user) {
    throw new Error(`Invalid phoneNumber or password`);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(`Invalid phoneNumber or password`);
  }

  if (!user.isActive) {
    throw new Error(`Not allowed to login`);
  }

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      branchId: user.branchId,
      branch: user.branch,
      type: user.facultyType,
    },
  };
};

const registerSuperAdmin = async (data) => {
  const { name, phoneNumber, password, code } = data;

  if (process.env.code !== code) {
    throw new Error("You are authorized to register");
  }

  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (existingUser) {
    throw new Error(`User already exists with this phoneNumber`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      phoneNumber,
      password: hashedPassword,
      role: "SUPER_ADMIN",
      branchId: null,
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    },
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      branchId: user.branchId,
    },
  };
};

const registerUser = async (data) => {
  const {
    name,
    phoneNumber,
    password,
    role,
    branchId,
    shiftStartTime,
    shiftEndTime,
    salary,
    facultyType,
  } = data;

  // const today = new Date().toISOString().split("T")[0];

  // const shiftStart = new Date(`${today}T${shiftStartTime}`);
  // const shiftEnd = new Date(`${today}T${shiftEndTime}`);

  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (existingUser) {
    throw new Error(`User already exists with this phoneNumber`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const shiftStart = shiftStartTime ? new Date(shiftStartTime) : null;
  const shiftEnd = shiftEndTime ? new Date(shiftEndTime) : null;

  if (role === "STAFF") {
    if (!shiftStart || !shiftEnd) {
      throw new Error("Shift timings required for staff");
    }
    const workingMinutesPerDay = Math.floor(
      (shiftEnd - shiftStart) / (1000 * 60),
    );

    if (workingMinutesPerDay <= 0) {
      throw new Error("InValid shift timings");
    }
    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber,
        password: hashedPassword,
        role,
        branchId: branchId || null,
        shiftStartTime: new Date(shiftStart),
        shiftEndTime: new Date(shiftEnd),
        salary: Number(salary),
        workingMinutesPerDay,
      },
    });
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      role: user.role,
      branchId: user.branchId,
      shiftStartTime: user.shiftStartTime,
      shiftEndTime: user.shiftEndTime,
      salary: Number(salary),
    };
  } else {
    if (facultyType === "SALARY_BASED") {
      if (!shiftStart || !shiftEnd) {
        throw new Error("Shift timings required for salary based faculty");
      }
      const workingMinutesPerDay = Math.floor(
        (shiftEnd - shiftStart) / (1000 * 60),
      );

      if (workingMinutesPerDay <= 0) {
        throw new Error("InValid shift timings");
      }

      const user = await prisma.user.create({
        data: {
          name,
          phoneNumber,
          password: hashedPassword,
          role,
          branchId: branchId || null,
          facultyType,
          shiftStartTime: shiftStart,
          shiftEndTime: shiftEnd,
          salary: Number(salary),
        },
      });

      return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        branchId: user.branchId,
        facultyType: user.facultyType,
        salary: user.salary,
      };
    } else {
      const user = await prisma.user.create({
        data: {
          name,
          phoneNumber,
          password: hashedPassword,
          role,
          branchId: branchId || null,
          facultyType,
          lectureRate: salary ? Number(salary) : null,
        },
      });
      return {
        id: user.id,
        name: user.name,
        phoneNumber: user.phoneNumber,
        role: user.role,
        branchId: user.branchId,
        facultyType: user.facultyType,
        lectureRate: user.lectureRate,
      };
    }
  }
};

const changePassword = async (id, newPass, oldPass) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  const comparePass = await bcrypt.compare(oldPass, user.password);

  if (!comparePass) {
    return {
      data: "wrong pass",
    };
  } else {
    const hashpass = await bcrypt.hash(newPass, 10);
    return await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashpass,
      },
    });
  }
};

const bulkRegisterUser = async (users, CurrentUser) => {
  const createdUser = [];
  const errors = [];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const { name, phoneNumber, password, role, branchId } = user;

    try {
      if (CurrentUser.role === "BRANCH_ADMIN") {
        if (role === "SUPER_ADMIN") {
          throw new Error("Branch admin cannot create super admin");
        }
        if (branchId !== CurrentUser.branchId) {
          throw new Error("Branch admin can only add users of own branch");
        }
      }
      const exists = await prisma.user.findUnique({
        where: { phoneNumber },
      });

      if (exists) {
        throw new Error(`phoneNumber already exists`);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          phoneNumber,
          password: hashedPassword,
          role,
          branchId: branchId || null,
        },
      });

      createdUser.push({
        id: newUser.id,
        name: newUser.name,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      });
    } catch (err) {
      errors.push({
        phoneNumber,
        message: err.message,
      });
    }
  }

  return { createdUser, errors };
};

module.exports = {
  loginUser,
  registerUser,
  bulkRegisterUser,
  registerSuperAdmin,
  changePassword,
};
