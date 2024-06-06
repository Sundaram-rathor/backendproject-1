import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema({

    subscriber:{
        type : Schema.Types.ObjectId, // one who is subcribing
        ref: "user"
    },
    channel:{
        type : Schema.Types.ObjectId, // one whom subscriber is subscribing
        ref: "user"
    }



}, {timestamps:true})


export const Subscription = mongoose.model("Subscription", subscriptionSchema)