const express = require("express");
const cors = require("cors");
const app = express();
const authRoute = require("./modules/auth/auth.routes");
const branchRoute = require("./modules/branch/branch.route");
const userRoute = require("./modules/users/user.route");
const subjectRoute = require("./modules/subjects/subject.route");
const lectureRoute = require("./modules/lectures/lectures.route");
const facultyAttRoute = require("./modules/attendance/attendance.route")
const staffAttendanceRoute = require("./modules/staffAttendance/staffAttendance.route");
const batchRoutes = require('./modules/batch/batch.route')
const coursesRoute = require('./modules/courses/courses.route')

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/branch", branchRoute);
app.use("/api/users", userRoute);
app.use("/api/subject",subjectRoute)
app.use("/api/lecture", lectureRoute)
app.use("/api/attendance", facultyAttRoute)
app.use("/api/staffAttendance",staffAttendanceRoute)
app.use("/api/batch", batchRoutes);
app.use("/api/courses", coursesRoute)

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Server up and running",
  });
});

module.exports = app;
