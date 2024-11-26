import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
            trim:true
        },
        phone:{
            type:String,
            required:true,
            trim:true
        },
        password:{
            type:String,
            required:true,
            trim:true
        },
        userId:{
            type:String,
            required:true,
            trim:true
        },
        pfpSrc:{
            type:String,
            required:true,
            trim:true
        },
        name:{
            type:String,
            required:true,
            trim:true
        },
        address:{
            type:String,
            required:true,
            trim:true
        },
        area:{
            type:String,
            required:true,
            trim:true
        },
        
        refreshToken:{
            type:String,
            required:true,
            trim:true
        },
        isVerified:{
            type:Boolean,
            required:true,
        },
        
        lat:{
            type:Number,
        },
        long:{
            type:Number,
        },
        gender:{
            type:String,
            required:true,
        },
        evidence:{
            type:Array,
            required:true,
        },
        fbLink:{
            type:String,
            trim:true
        }
        ,
        date:{
            type:Number,
            trim:true,
            required:true
        }
        ,
       
    },{
        timestamps:true
    }
)

const User = mongoose.model("User",userSchema)
export {User}