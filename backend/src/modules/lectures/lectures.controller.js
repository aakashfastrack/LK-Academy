const lectureService = require("./lectures.service");

const create = async (req, res) => {
  try {
    const {
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled,
    } = req.body;

    if (
      !facultyId ||
      !subjectId ||
      !batchId ||
      !StartDate ||
      !EndDate ||
      !startTime ||
      !endTime ||
      !TotalScheduled
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const lecture = await lectureService.createlectureSchedule(
      {
        facultyId: Number(facultyId),
        subjectId: Number(subjectId),
        batchId: Number(batchId),
        StartDate,
        EndDate,
        startTime,
        endTime,
        TotalScheduled,
      },
      req.user,
    );

    res.status(201).json({
      success: true,
      message: "Lecture scheduled successfully",
      data: lecture,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

const getByBranchAndDate = async (req, res) => {
  try {
    const batchId = Number(req.params.batchId);
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({
        message: "Date query parameter is required",
      });
    }

    const lectures = await lectureService.getLectureByBranchAndDate(
      batchId,
      date,
    );

    res.json({
      success: true,
      data: lectures,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getLecturesbyId = async (req, res) => {
  try {
    const { id, type, month, year } = req.query;

    const data = await lectureService.getLectureByIdAndType(
      id,
      type,
      month,
      year,
    );

    res.json({
      message: "Data of lecture by id and type",
      success: false,
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const getlecture = async (req, res) => {
  try {
    const { id } = req.query;

    const data = await lectureService.getLecture(id);

    res.json({
      message: "All data",
      success: true,
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
      success: true,
    });
  }
};

const getAlllectures = async (req, res) => {
  try {
    const lectures = await lectureService.getAllLecture();

    res.json({
      success: true,
      data: lectures,
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
    const data = await lectureService.deleteLecture(id);

    res.json({
      success: true,
      data,
      message: "Lecture deleted",
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
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled,
    } = req.body;

    const data = await lectureService.updateLecture(
      id,
      facultyId,
      subjectId,
      batchId,
      StartDate,
      EndDate,
      startTime,
      endTime,
      TotalScheduled,
    );

    res.json({
      success: true,
      message: "Update Lecture",
      data,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message,
    });
  }
};

const resetLectureCycleController = async (req, res) => {
  try {
    const lectureId = Number(req.params.lectureId);

    const data = await lectureService.resetLectureCycleService({
      lectureId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      message: "New cycle created successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  create,
  getByBranchAndDate,
  getAlllectures,
  remove,
  update,
  getLecturesbyId,
  getlecture,
  resetLectureCycleController,
};
