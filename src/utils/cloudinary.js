import {v2 as cloudinary} from 'cloudinary';
import exp from 'constants';
import { response } from 'express';

import fs from 'fs'


cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET // Click 'View Credentials' below to copy your API secret
}); 


const uploadOnCloudinary = async(localfilepath) => {
    try {
        if(!localfilepath) return null
        //upload on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        //file has been uploaded successfully
        console.log('file has been uploaded on cloudinary',
            response.url
        )
    } catch (error) {
        fs.unlinkSync(localfilepath)//remove the locally saved temparary file
    }
}



export {uploadOnCloudinary}