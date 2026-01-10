const {prisma} = require('../../config/db')


// CREATE BATCH
const createBatch = async ({ name, code, courseId }) => {
  return await prisma.batch.create({
    data: {
      name,
      code,
      courseId: Number(courseId),
    },
  });
};

// GET ALL BATCHES (optional branch filter)
const getBatches = async () => {
  return await prisma.batch.findMany({
    include: {
      course: {
        include:{
          branch:{
            include:{
              users:true
            }
          }
        }
      },
      lectureSchedules:{
        include:{
          subject:true
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
};

// GET SINGLE BATCH
const getBatchById = async (id) => {
  return await prisma.batch.findUnique({
    where: { id: Number(id) },
    include: {
      course:{
        include:{
          branch:{
            include:{
              users:true
            }
          }
        }
      },
      lectureSchedules:{
        include:{
          subject:true
        }
      },
    },
  });
};

// UPDATE BATCH
const updateBatch = async (id, data) => {
  return await prisma.batch.update({
    where: { id: Number(id) },
    data,
  });
};

// DELETE BATCH
const deleteBatch = async (id) => {
  return await prisma.batch.delete({
    where: { id: Number(id) },
  });
};

module.exports = {
  createBatch,
  getBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};