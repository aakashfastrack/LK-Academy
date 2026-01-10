const {prisma} = require('../../config/db')

const create = async (name, branchId) => {
    return await prisma.course.create({
        data:{name,branchId}
    })
}

const getAll = async() =>{
    return await prisma.course.findMany({
        orderBy:{createdAt:'desc'},
        include:{
            branch:true,
            batches:true
        }
    })
}

const getById = async(id) => {
    return await prisma.course.findUnique({
        where:{id:Number(id)},
        include:{
            branch:true,
            batches:true
        }
    })
}

const updateById = async(id, name, branchId) => {
    return await prisma.course.update({
        where:{id:Number(id)},
        data:{name, branchId}
    })
}

const deleteById = async(id) => {
    return await prisma.course.delete({
        where:{id:Number(id)}
    })
}

module.exports ={
    create,
    getAll,
    getById,
    updateById,
    deleteById
}