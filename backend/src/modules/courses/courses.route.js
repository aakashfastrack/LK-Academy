const express = require("express");
const router = express.Router();

const courseController = require("./course.controller");
const { protect } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");


router.post(
    "/",
    protect,
    requireRole("SUPER_ADMIN"),
    courseController.createCourse
)

router.get(
    '/',
    protect,
    courseController.getAllCourses
)

router.get(
    "/:id",
    protect,
    courseController.getCourseById
)

router.put(
    "/:id",
    protect,
    requireRole("SUPER_ADMIN"),
    courseController.updateCourseById
)

router.delete(
    "/:id",
    protect,
    requireRole("SUPER_ADMIN"),
    courseController.deleteCourseById
)

module.exports = router;