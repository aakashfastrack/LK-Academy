const { PrismaClient } = require('@prisma/client')

// const prisma = new PrismaClient()
let prisma

if(!global.prisma){
    global.prisma = new PrismaClient();
}

prisma = global.prisma

const connectDB = async () =>{ 
    try{

        await prisma.$connect();
        console.log(`Database Connected Successfully`)

    }catch(err){
        console.log(`Database Connection failed:-> ${err}`)
        process.exit(1);
    }
}

module.exports = {
    prisma,
    connectDB
}