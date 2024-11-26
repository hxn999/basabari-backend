import mongoose from "mongoose";

const postSchema = mongoose.Schema(
    {
        userId:{
            type:String,
            required:true,

            trim:true
        },
        images:{
            type:Array,
            required:true,
        },
        bed:{
            type:Number,
            required:true,

        },
        living:{
            type:Boolean,
            required:true,

        },
        dining:{
            type:Boolean,
            required:true,

        },
        bath:{
            type:Number,
            required:true,
        },
        balcony:{
            type:Number
        },
        floorSize:{
            type:Number
        },
        description:{
            type:String,

        },
        amenities:{
            type:Object,
            required:true,
        },
        address:{
            type:String,
            required:true,
        },
        area:{
            type:String,
            required:true,
        },
       
        rent:{
            type:Number,
            required:true,
        },
        advance:{
            type:Number,
            required:true,
        },
        utilityBills:{
            type:Number,
            
        }
        ,
        chargeCategory:{
            type:Array
        },
        rentDate:{
            type:String,
            required:true,
        },
        postId:{
            type:String,
            required:true,
        },
        available:{
            type:Boolean,
            required:true,
            default:true
        },
        lat:{
            type:Number,
            
        },
        long:{
            type:Number
        },
        type:{
            type:String,
            default:"Any"
            
        },
        impression:{
            type:Number,
            default:0
        },
        comments:{
            type:Array,
            default:[null]
        },
        isApproved:{
            type:Boolean,
            default:false
        },
        fbLink:{
            type:String,
            trim:true,
        },
        date:{
            type:Number,
            trim:true,
            required:true
        }
       
    },{
        timestamps:true
    }
)

 const Post = mongoose.model("Post",postSchema)
export {Post}