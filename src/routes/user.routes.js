import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {registerUser} from "../controllers/user.controller.js"
import { loginUser } from "../controllers/user.controller.js";
import { userProfile } from "../controllers/user.controller.js";
import { postContent } from "../controllers/user.controller.js";
import { getAllPost } from "../controllers/user.controller.js";
import { updatePost } from "../controllers/user.controller.js";
import { deletePost } from "../controllers/user.controller.js";
import { commentOnPost } from "../controllers/user.controller.js";
import { deleteComment } from "../controllers/user.controller.js";
import { uploadProfilePicture } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);



const router = Router()


router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/profile").get(verifyToken, userProfile)
router.route("/postcontent").post(verifyToken,postContent)
router.route("/allpost").get(verifyToken,getAllPost)
// router.route("/update/:postId").put(verifyToken,updatePost)
// router.route("/delete/:postId").delete(verifyToken,deletePost)

// somehow using postmen the url  is not routing if pass postId by params. may laptop has some issue
// so i have also pass ** postId ** in body and it working fine. I mean you can also check by uncomment the above route and test.
router.route("/update").put(verifyToken,updatePost)
router.route("/delete").delete(verifyToken,deletePost)

router.route("/comment").post(verifyToken,commentOnPost)
router.route("/deletecomment").delete(verifyToken,deleteComment)
router.route("/avatar").post(verifyToken,upload.single('avatar'),uploadProfilePicture)

export default router