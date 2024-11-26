import express from "express";
import { decode } from "node-base64-image"

import {  postServer  , updatePost, createPost, getSinglePost} from "../controllers/postController.js";
import { authCheck } from "../middleware/authCheck.js";
import {  renewToken } from "../middleware/refreshToken.js";

const postRouter = express.Router()


postRouter.get("/",postServer)
postRouter.patch("/edit",authCheck,updatePost)
postRouter.get("/single",getSinglePost)
postRouter.post("/create",authCheck,createPost)



export default postRouter