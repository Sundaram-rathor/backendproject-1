import mongoose , {Schema} from "mongoose";
import  jwt from "jsonwebtoken"; //bearer token (like a key )
import bcrypt from 'bcrypt'


const userSchema = new Schema({

    userName:{
        type:String,
        required:true,
        unique:true,

    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }

    ],
    email:{
        type:String,
        required:true,
        unique:true,

    },
    fullName:{
        type:String,
        required:true,

    },
    avatar:{
        type:String,
        required:true,

    },
    coverImage:{
        type:String,
       

    },
    password:{
        type:String,
        required:true,

    },
    refreshToken:{
        type:String
    }

},{timestamps:true})


userSchema.pre("save", async function (next){
    if(!this.isModified("password")){
        next();
        
    }else{
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
})
//designing custom methods to check authenticity of user

userSchema.methods.isPasswordCorrect = async function(password){
    const validity = await bcrypt.compare(password, this.password)
    console.log(validity)
  return validity

}

userSchema.methods.generateAccessToken = function(){
  return  jwt.sign(
    {
        _id: this.id,
        email:this.email,
        username:this.userName,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
    {
        _id: this.id,
        
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}

export const User = mongoose.model("User",userSchema)