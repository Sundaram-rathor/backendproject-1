
import { DB_NAME } from "../constents.js"
import mongoose from 'mongoose'


const connectDB = async ()=>{
    try{
    const mongoConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

    console.log(`mongodb connected and this is connection instance : ${mongoConnectionInstance.connection.host}`)
    }catch(error){
        console.log(`error(mongoDB) : ${error}`)
        process.exit(1)
    }
}


export default connectDB