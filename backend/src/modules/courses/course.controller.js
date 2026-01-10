const courseService = require("./courses.service");

const createCourse = async (req, res) => {
  try {
    const { name, branchId } = req.body;

    if(!name || !!branchId){
      return res.status(400).json({
        message: "Name and BranchId are required",
        success: false,
      });
    }

    const course = await courseService.create(name, branchId);

    res.status(201).json({
      success: true,
      data: course,
      message: "Course created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};

const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAll();
    res.status(200).json({
        message:"Courses fetched successfully",
        success:true,
        data:courses
    })

  } catch (err) {
    res.status(500).json({
      message: err.message,
      success: false,
    });
  }
};


const getCourseById = async (req, res) => {
    try{

        const {id} = req.params

        const course = await courseService.getById(id)

        res.status(200).json({
            message:"Course fetched successfully",
            success:true,
            data:course
        })

    }catch(err){
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}

const updateCourseById = async(req,res) =>{
    try{

        const {id} = req.params
        const {name, branchId} = req.body

        if(!name || !branchId){
            return res.status(400).json({
                message:"Name and BranchId are required",
                success:false
            })
        }

        const course = await courseService.updateById(id,name,branchId)

        res.status(200).json({
            message:"Course updated successfully",
            success:true,
            data:course
        })

    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
}

const deleteCourseById = async(req,res) =>{
    try{

        const {id} = req.params

        await courseService.deleteById(id)

        res.status(200).json({
            message:"Course deleted successfully",
            success:true,
        })

    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
}

module.exports = {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourseById,
    deleteCourseById
}