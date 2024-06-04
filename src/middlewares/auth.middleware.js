import  jwt  from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";

export const verifyjwt = asyncHandler(async(req,res,next)=>{
    try {
        //getting access token from cookies
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){
            throw new ApiError(402, "unautherize req")
        }
    
        const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        if (!decodeToken) {
            throw new ApiError(403, "invalid token a")
        }
    
       const user = await User.findById(decodeToken._id).select(
        "-password -refreshToken"
       )
    
       if(!user){
        throw new ApiError(401, "invalid token b")
       }
    
       req.user=user
    
       next()
    } catch (error) {
        throw new ApiError(402 , "invalid token c")
    }

})