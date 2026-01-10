const batchService = require("./batch.service");

// CREATE
const createBatch = async (req, res) => {
  try {
    const batch = await batchService.createBatch(req.body);
    res.status(201).json({ success: true, data: batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// GET ALL
const getBatches = async (req, res) => {
  try {
    const batches = await batchService.getBatches();
    res.json({ success: true, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY ID
const getBatchById = async (req, res) => {
  try {
    const batch = await batchService.getBatchById(req.params.id);
    if (!batch)
      return res.status(404).json({ message: "Batch not found" });

    res.json({ success: true, data: batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE
const updateBatch = async (req, res) => {
  try {
    const id = req.params.id
    console.log(id)
    const batch = await batchService.updateBatch(
      id,
      req.body
    );
    res.json({ success: true, data: batch });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE
const deleteBatch = async (req, res) => {
  try {
    await batchService.deleteBatch(req.params.id);
    res.json({ success: true, message: "Batch deleted" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};
