import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
const app = express();

//for handling cors related issues
app.use(cors({
    origin:process.env.CORS_ORIGIN
}))


//for setting a limit for json response
app.use(express.json({limit:"16kb"}))


//for encoding url 
app.use(express.urlencoded({extended:true,limit:"16kb"}))


//for storing static files on server in folder name public
app.use(express.static("public"))


//for cookie managment and crud operation on cookie 
app.use(cookieParser())

export {app}