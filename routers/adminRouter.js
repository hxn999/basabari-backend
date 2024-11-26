import express from "express";
import { adminLogin, adminLogout, allPost, allUser, createPost, postDelete, postEdit, singleUser, userDelete, userEdit } from "../controllers/adminController.js";
import {adminCheck} from '../middleware/adminCheck.js'

const adminRouter = express.Router()


adminRouter.get("/post",adminCheck,allPost)
adminRouter.get("/user",adminCheck,allUser)
adminRouter.get("/user/single",adminCheck,singleUser)
adminRouter.delete("/user",adminCheck,userDelete)
adminRouter.delete("/post",adminCheck,postDelete)
adminRouter.patch("/post",adminCheck,postEdit)
adminRouter.patch("/user",adminCheck,userEdit)
adminRouter.post("/post",adminCheck,createPost)
adminRouter.post("/login",adminLogin)
adminRouter.delete("/logout",adminLogout)




export default adminRouter