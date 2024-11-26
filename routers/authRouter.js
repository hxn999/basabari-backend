import express from "express";


import { createUser, logIn ,logOut,getProfile, getProfilePost, editProfile} from "../controllers/authController.js";
import { authCheck } from "../middleware/authCheck.js";


const authRouter = express.Router()

authRouter.post("/login",logIn)
authRouter.get("/pfpPost",authCheck,getProfilePost)
authRouter.get("/profile",authCheck,getProfile)
authRouter.delete("/logout",logOut)
authRouter.post("/create",createUser)
authRouter.patch("/edit",authCheck,editProfile)

export default authRouter