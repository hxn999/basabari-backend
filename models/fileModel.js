import mongoose from "mongoose";

const fileSchema = mongoose.Schema(
    {
        count:{
            type:Number
        }
       
    },{
        timestamps:true
    }
)

 const File = mongoose.model("File",fileSchema)
export {File}