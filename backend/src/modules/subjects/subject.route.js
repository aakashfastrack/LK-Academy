const express = require("express")
const router = express.Router();

const {protect} = require("../../middleware/auth.middleware");
const {requireRole} = require("../../middleware/role.middleware");
const subjectController = require('./subject.controller')

router.post(
    "/",
    protect,
    requireRole("SUPER_ADMIN","BRANCH_ADMIN"),
    subjectController.create
);

router.get(
    "/",
    protect,
    subjectController.getAll
);

router.post(
    "/assign",
    protect,
    subjectController.assignSubjectToFaculty
);

router.get(
    "/faculty/:facultyId",
    protect,
    subjectController.listSubjectsByfaculty
)

router.delete(
    "/:id",
    protect,
    subjectController.remove
)

module.exports = router