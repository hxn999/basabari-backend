import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import cookieParser from 'cookie-parser'
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors'
import { decode } from "node-base64-image"

// internal imports
import postRouter from './routers/postRouter.js'
import authRouter from './routers/authRouter.js'
import adminRouter from './routers/adminRouter.js'


const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express()
dotenv.config()
app.use(cors({credentials:true,origin:['http://localhost:5173']}))

// database connection

async function database() {
    await mongoose.connect(process.env.MONGO_STRING)
}
database().then(()=>console.log("database connected!!")).catch(()=>console.log("database not connected"))


// request parser
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb',extended:true}))
app.use(cookieParser())

// set static folder
app.use(express.static(path.join(__dirname,'public')));


// routing setup
// app.use('/',homeRouter)
app.get("/",(req,res)=>res.json({"msg":"How are you?"}))
app.use('/post',postRouter) 
app.use('/auth',authRouter) 
app.use('/admin',adminRouter) 


// server startup
app.listen(process.env.PORT  , ()=> console.log("Server running on PORT 3000! http://localhost:3000"))
