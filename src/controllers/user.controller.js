import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async(userId)=>{
    try {
      const user =   await User.findById(userId)
      const accessToken= user.generateAccessToken()
      const refreshToken =  user.generateRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave:false})

      return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "error while generating tokens")
    }
}

const registerUser = asyncHandler( async(req,res)=>{
   //get user details from frontend 
   // validation - not empty
   //check if user already exists
   // check for images, check for avatar
   // upload them to local server than cloudinary
   // create user object - create entry indb 
   // remove password and refresh token field from response
   // check if user is created
   // return res
    


    const {fullName,userName, email,password} = req.body   //getting details from user

    console.log(`username: ${userName}`)
//validating that all fields have some value 
    if(
        [userName,email,password].some((field)=> field?.trim()==="")
    ){
            throw new ApiError(400, "all field  required")
    }

// check if user already exist
   
   const existedUser = await User.findOne({
        $or:[{userName},{email}]
    })
   

    if(existedUser){
        throw new ApiError(409,`user with email or username already exists `)
    }

// getting local path for uploaded files
    const avatarlocalpath = req.files?.avatar[0]?.path;
    const coverImagelocalpath = req.files?.coverImage[0]?.path
    
    if(!avatarlocalpath){
       throw new ApiError(400, "avatar is  required")
    }
// uploading files to cloudinary
    const avatar = await uploadOnCloudinary(avatarlocalpath)
    const coverImage = await uploadOnCloudinary(coverImagelocalpath)

   
//creating user data in data base
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

const loginUser = asyncHandler( async(req,res)=>{
     // req body -> data
     // username or email
     // find the user
     // check password
     // access and refresh token
     // sent tokens via cookies


     const {username , email , password} = req.body
     console.log(username,email)
    
     if(!(username || email)){
        throw new ApiError(400,"username or email is required")
     }

    const user = await User.findOne(
        {$or:[{username},{email}]}
     )

     if(!user){
        throw new ApiError(401, "user does not exists")
     }
      
     const isPassValid = await user.isPasswordCorrect(password)
     console.log(isPassValid)
     if(!isPassValid){
        throw new ApiError(402, "invalid password")
     }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    //cookie
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options = {
        httpOnly:true,
        secure:true

    }
    
    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "user  logged in successfully"
        )
    )


})


const logoutUser = asyncHandler(async(req,res)=>{
     const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: undefined
            }
        },
        {
            new:true 
        }
    )

    const options = {
        httpOnly:true,
        secure:true

    }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200, {}, "User logged out"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
    //getting refresh token from user
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
   
   if(!incomingRefreshToken){
    throw new ApiError(401, "unautherized request")
   }

   try {
    // checking token validity
    const decodeToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
 
    //finding user based on token info
    const user = await User.findById(decodeToken._id)
 
    if(!user){
     throw new ApiError(401, "Invalid Refresh Token")
    }
     
    // checking if both incoming token and token stored in user data is same or not
 
    if (incomingRefreshToken !== user?.refreshToken) {
     throw new ApiError(401, " refresh token is used or expired")
    }
 
    // sending access token
 
    const options={
     httpOnly:true,
     secure:true
    }
 
    const{accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
 
    return res
     .status(200)
     .Cookie("accessToken",accessToken,options)
     .Cookie("refreshToken",newRefreshToken,options)
     .json(new ApiResponse(
         200, 
 
         {accessToken, refreshToken:newRefreshToken},
 
          "access token refreshed"
         ))
   } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh Token")
    
   }

})


const changeCurrentPassword  = asyncHandler(async(req, res)=>{

    const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(402, "invalid password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(new ApiResponse(200, {}, "password updated"))

})

const getCurrentUser = asyncHandler(async(req,res)=>{

    const user = User.findById(req.user?._id)

    return res.status(200)
    .json(200, user, "current user details fetched")
})

const updatedAccountDetails = asyncHandler(async(req,res)=>{
    const {fullName, email} =req.body

    if (!fullName  ||  !email) {
        throw new ApiError(403, "both fullname and email are required")
    }


    const user =  await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200, user, "Account details successfully updated"))
})


const updatedUserAvatar = asyncHandler(async(req, res)=>{

     const avatarlocalpath = req.file?.path
     
     if(!avatarlocalpath){
        throw new ApiError(400, "avatar is missing")
     }

     const avatar = await uploadOnCloudinary(avatarlocalpath)

     if(!avatar.url){
        throw new ApiError(401, "avatar url not found")
     }

     const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
     ).select("-password")

     return res.status(200)
     .json(
        new ApiResponse(200,user, "avatar updated" )
     )
})



const updateUserCoverImage = asyncHandler(async(req,res)=>{

    const coverImagelocalpath = req.file?.path

    if(!coverImagelocalpath){
        throw new ApiError(401, "cover image local path not found")

    }


    const coverImage = await uploadOnCloudinary(coverImagelocalpath)

    if (!coverImage?.url) {
        throw new ApiError(402, "cover image url not found")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
       new ApiResponse(200, user, "cover image updated" )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updatedAccountDetails,
    updatedUserAvatar,
    updateUserCoverImage
}