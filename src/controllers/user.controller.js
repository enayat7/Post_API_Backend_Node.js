import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import { upload } from "../middlewares/multer.middleware.js";

const registerUser = async (req, res) => {
    // console.log(req.body)
    const { fullname, username, email, password, avatar } = req.body;
    const user_email = await User.findOne({ email: email });
    const user_name = await User.findOne({username : username});
    if (user_email) {
        return res.send({ status: "failed", message: "Email already exists" });
    }
    else if(user_name){
        return res.send({ status: "failed", message: "Username already exists" });
    }
    if(fullname && username && email && password ) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const newUser = new User({
            fullname: fullname,
            username:username,
            email: email,
            password: hashPassword,

            });
            await newUser.save();
            const saved_user = await User.findOne({ email: email });
            const token = jwt.sign(
                { userID: saved_user._id },
                process.env.JWT_SECRET_KEY,
                { expiresIn: process.env.EXPIRY_TIME }
            );
            res.status(201)
            .send({
              status: "success",
              message: "Registration Success",
              token: token,
            });
        }
        catch (error) {
          console.log(error);
          return res.send({ status: "failed", message: "Unable to Register" });
        }
    }
    else {
        return res.send({
          status: "failed",
          message: "All field are compulsory"
        });
    }
};
const loginUser = async(req,res) =>{
    // console.log(req.body)
    const {username, email, password} = req.body;
    try {
        if( (username || email) && password){
            let user=null;
            if(username) user = await User.findOne({username});
            else user = await User.findOne({email});
            if (user != null) {
                const isMatch = await bcrypt.compare(password, user.password)
                if (isMatch) {
                  const token = jwt.sign({ userID: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRY_TIME })
                  return res.send({ "status": "success", "message": "Login Success", "token": token })
                } else {
                  return res.send({ "status": "failed", "message": "Email or Password is Incorrect" })
                }
            }
            if(username ) return res.send({ "status": "failed", "message": "username or Password is Incorrect" })
            return res.send({ "status": "failed", "message": "email or Password is Incorrect" })
        }
        else{
            return res.send({ "status": "failed", "message": "all field are compusolry"})
        }       
    }
    catch (error) {
        return res.send({ "status": "failed", "message": "Unable to Login" })
    }

}

const userProfile = async(req,res) =>{
        const user =await User.findOne({_id:req.authData.userID})
        // console.log(req.authData);
        if(user) return res.send(user);
        else{
            return res.send("cannot get user profile");
        }
}

const postContent = async(req,res) =>{
    const user =await User.findOne({_id:req.authData.userID})
    const { content  } = req.body;
    try {
        let newPost=new Post({
            content : content,
            postBy: user._id
        })
        const post = await newPost.save()
        return res.status(201).send({
            "message":"content upload successfully",
            "content":{post}
        })
    } catch (error) {
        return res.status(401).send("Unable to post")
    }
}

const getAllPost = async(req,res) =>{
        try {
            const allpost = await Post.find({});
            return res.send(allpost);
        }
        catch (error) {
            return res.status(404).send("No post avalaible")
        }
}

// const updatePost = async(req,res) =>{
//     console.log("hi")
//     const { content } = req.body;
//     const { postId } = req.params;
//     if(!content) return res.send("content cannot be empty");
//     try {
//         const updatedPost = await Post.findByIdAndUpdate(
//             postId,
//             { $set: { content: content } },
//             { new: true }
//             )
//         return res.status(201).send({
//             "message" : "Content updated successfully",
//             "content" : {updatedPost}
//         })
//     } catch (error) {
//         return res.status(401).status("Unable to update")
//     }
// }

// const deletePost = async(req,res) =>{
//         try {
//             const { postId } = req.params;
//             const deletedPost = await Post.findByIdAndDelete(postId);

//             return res.status(201).send({
//                 "message" : "Post deleted successfully",
//             })
//         } catch (error) {
//             return res.status(401).status("Unable to delete Post")
//         }
// }

async function updatePost(req, res) {
        const { content, postId } = req.body;
        if (err || !content) return res.sendStatus(401);
        try {
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $set: { content: content } },
                { new: true }
            );
            return res.status(201).send({
                "message": "Content updated successfully",
                "content": { updatedPost }
            });
        } catch (error) {
            return res.status(401).status("Unable to update");
        }
}

const deletePost = async(req,res) =>{
        if(err) return res.sendStatus(401);
        try {
            const { postId } = req.body;
            const deletedPost = await Post.findByIdAndDelete(postId);
            return res.status(201).send({
                "message" : "Post deleted successfully",
            })
        } catch (error) {
            return res.status(401).status("Unable to delete Post")
        }
}

const commentOnPost = async(req,res) =>{
        const userId =req.authData.userID;
        const { postId, comment } = req.body;
        if(err) return res.sendStatus(401);
        try {
            const post = await Post.findById(postId); 
            post.comments.push({
                commentBy: userId,
                text: comment,
            });
            const updatedPost = await post.save();
            return res.status(200).send({
                "message": "commented successfully",
                "updatedPost" : {updatedPost}
            })
        } 
        catch (error) {
            res.status(404).send({
                "message" : "cannot be comment",
                "error" : {error}
            })
        }
}

const deleteComment = async(req,res) =>{
        const { postId, commentId } = req.body;
        const userId = req.authData.userID;
        if(err) return res.sendStatus(401);
        try {
            console.log(1);
            const updatedPost = await Post.updateOne(
                { _id: postId },
                { $pull: { comments: { _id: commentId } } }
            );
            return res.status(200).send({
                "message" : "Comment deleted successfully",
                "post" : updatePost
            });
        }
        catch (error) {
            res.status(404).send({
                "message" : "cannot be delete the comment",
                "error" : {error}
            })
        }
}


const uploadProfilePicture = async (req,res) =>{
    try {
        const user =await User.findOne({_id:req.authData.userID})
        // console.log(req.user)
        if(req.file){
            user.avatar = req.file.path;
            await user.save();
            return res.status(200).send("Profile picture update succesfully");
        }
        else{
            return res.send("cannot be uploaded")
        }
    }
    catch (error) {
        return res.status(404).send("Profile picture cannot be updated")
    }
}

export { 

    registerUser,
    loginUser,
    userProfile,
    postContent,
    getAllPost, 
    updatePost,
    deletePost, 
    commentOnPost,
    deleteComment,
    uploadProfilePicture

};
