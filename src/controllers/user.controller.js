import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import { application } from "express";
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";


const registerUser = asyncHandler( async(req,res)=>{
  
    


    const {userName, email,password} = req.body

    console.log(`username: ${userName}`)
//validating that all fields have some value
    if(
        [userName,email,password].some((field)=> field?.trim()==="")
    ){
            throw new ApiError(400, "all field  required")
    }

// check if user already exist
   
   const existedUser= User.findOne({
        $or:[{userName},{email}]
    })
   

    if(existedUser){
        throw new ApiError(409,"user with email or username already exists")
    }


    const avatarlocalpath = req.files?.avatar[0]?.path;
    const coverImagelocalpath = req.files?.coverImage[0]?.path
    
    if(!avatarlocalpath){
       throw new ApiError(400, "avatar is required")
    }
    
    const avatar = await uploadOnCloudinary(avatarlocalpath)
    const coverImage = await uploadOnCloudinary(coverImagelocalpath)

    if (!avatar) {
        throw new ApiError(400, "avatar is required")
    }

    const userToDataBase = await User.create({
        fullName,
        avatar:avatar.url,
        userName,
        email,
        password,
        coverImage: coverImage?.url || ""

    }) 
    const createdUser = await User.findById(userToDataBase._id).select( 
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser,"user registered successfully")
    )
})

export {registerUser}