const { prisma } = require("../../config/db");

const createSubject = async (name, batchId) => {
  // prevent duplicate subject in same batch
  const exists = await prisma.subject.findFirst({
    where: {
      name,
      batchId,
    },
  });

  if (exists) {
    throw new Error("Subject already exists in this batch");
  }

  return prisma.subject.create({
    data: {
      name,
      batchId,
    },
    include: {
      batch: {
        include: {
          course: {
            include:{
              branch:true
            }
          },
        },
      },
    },
  });
};

const getAllSubjects = async () => {
  return prisma.subject.findMany({
    orderBy: { name: "asc" },
    include: {
      batch: {
        include: {
          course: {
            include:{
              branch:true
            }
          },
        },
      },
      lectureSchedules:{
        include:{
          attendance:true
        }
      },
      facultySubjects: {
        include: {
          faculty: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });
};

const mapFacultyToSubject = async ({ facultyId, subjectId, branchId }) => {
  const existing = await prisma.facultySubject.findUnique({
    where: {
      facultyId_subjectId_branchId: {
        facultyId,
        subjectId,
        branchId,
      },
    },
  });

  if (existing) {
    throw new Error("Faculty already assigned to this subject");
  }

  return prisma.facultySubject.create({
    data: {
      facultyId,
      subjectId,
      branchId,
    },
  });
};

const getSubjectByFaculty = async (facultyId) => {
  return prisma.facultySubject.findMany({
    where: { facultyId },
    include: {
      subject: {
        include: {
          batch: {
            include: {
              branch: true,
            },
          },
        },
      },
    },
  });
};

const deleteSub = async (id) => {
  return prisma.subject.delete({
    where: { id },
  });
};

module.exports = {
  createSubject,
  getAllSubjects,
  mapFacultyToSubject,
  getSubjectByFaculty,
  deleteSub,
};
