import { Router } from "express";
import { 
         loginUser, 
         logoutUser, 
         registerUser, 
         refreshAccessToken, 
         changeCurrentPassword, 
         getCurrentUser, 
         updatedAccountDetails, 
         updatedUserAvatar, 
         updateUserCoverImage, 
         getUserChannelProfile, 
         getWatchHistory 
        } 
         
         from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ])
    
    
    ,registerUser)

router.route("/login").post(loginUser)

//
router.route("/logout").post(verifyjwt,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyjwt,changeCurrentPassword)
router.route("/change-user").post(verifyjwt,getCurrentUser)
router.route("/update-details-account").patch(verifyjwt,updatedAccountDetails)
router.route("/update-avatar").patch(verifyjwt,upload.single("avatar"), updatedUserAvatar)

router.route("/update-coverimage").patch(verifyjwt,upload.single("coverImage"),updateUserCoverImage)
router.route("/c/:username").get(verifyjwt,getUserChannelProfile)
router.route("/history-watched").get(verifyjwt,getWatchHistory)


export default router