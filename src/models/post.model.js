import mongoose, { Schema } from "mongoose"


const postSchema = Schema({
    content: {
        type: String,
        required: true
    },
    postBy: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    comments : [
        {
            commentBy : {
                type:Schema.Types.ObjectId,
                ref:  "User",
                require: true
            },
            text : {
                type: "string",
                require: true
            }
        }
    ] 

},{ timestamps : true });


export const Post = mongoose.model("Post", postSchema)