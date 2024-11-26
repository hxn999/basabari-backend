import { decode } from "node-base64-image"
import { mkdir, unlink, access, rm } from 'fs/promises'
import { constants } from "fs"
import { cipher } from "../middleware/cipher.js"
import { Post } from "../models/postModel.js"
import { User } from "../models/userModel.js"
import { File } from "../models/fileModel.js"
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"



export async function allPost(req, res) {
    try {

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")


        // getting all posts from database
        const regex = new RegExp(escape(req.query.area), "i");


        let posts = await Post.find({
            area: regex,
            rent: { $gt: parseInt(req.query.gt), $lt: parseInt(req.query.lt) },
            bed: { $gt: (parseInt(req.query.bed) - 1) },
            bath: { $gt: (parseInt(req.query.bath) - 1) },
            floorSize: { $gt: parseInt(req.query.floor) },
            isApproved: req.query.isApproved
        })

        res.status(200).json({
            post: posts
        })

    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function allUser(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        // getting all users from database
        let users = await User.find({ isVerified: req.query.isVerified })

        res.status(200).json({
            users
        })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function singleUser(req, res) {

    try {

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")
        console.log(req.query.userId);
        
         

        const user = await User.findOne({ userId: req.query.userId })
        let posts = null

        if(req.query.post)
        {
            posts = await Post.find({userId:req.query.userId})
        }

        res.status(200).json(
            {
                ...user._doc,
                password: null,
                refreshToken: null,
                posts
            }
        )


    } catch (error) {
        res.status(500).json({
            err: error.message
        })
    }

}

export async function postEdit(req, res) {
    try {
        console.log("yes------------------------------");

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        // finding post from database and updating it

        if (req.body.data.images) {
            // firstly removing all previous post images

            await rm(`./public/images/user-${req.body.userId}/${req.body.postId}`, { recursive: true, force: true })

            // creating folder for post images

            await mkdir(`./public/images/user-${req.body.userId}/${req.body.postId}`, { recursive: true }, (err) => {
                if (err) throw Error("Folder creating error !!")
            })

            // converting base64 image to jpg files and creating public links

            let i = 0
            let imgSrc = []
            req.body.data.images.map(async (base64) => {

                i++
                imgSrc.push(`/images/user-${req.body.userId}/${req.body.postId}/${cipher("image" + req.body.postId, i)}.jpg`)
                await decode(base64.slice(22), { fname: `./public/images/user-${req.body.userId}/${req.body.postId}/${cipher("image" + req.body.postId, i)}`, ext: 'jpg' })

            })

            req.body.data.images = imgSrc

        }

        await Post.findOneAndUpdate({ _id: req.body._id }, req.body.data)

        res.status(200).json({ msg: "Post edited by admin successfully !!" })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function userEdit(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        // if user wants to update his profile picture

        if (req.body.data.pfp == "default") {


            let exists = true
            try {
                await access(`./public/images/user-${req.body.userId}/profile.jpg`, constants.F_OK)

            } catch (e) {
                exists = false
            }

            // firstly, deleting existing user profile picture
            if (exists) await unlink(`./public/images/user-${req.body.userId}/profile.jpg`)



            if (req.body.gender === "male") {
                req.body.data.pfpSrc = `/images/default-pfp-male.jpg`
            }
            else {
                req.body.data.pfpSrc = `/images/default-pfp-female.jpg`
            }


            delete req.body.data.pfp

        }
        else if (req.body.data.pfp) {

            // checking if user has profile pic or not
            let exists = true
            try {
                await access(`./public/images/user-${req.body.userId}/profile.jpg`, constants.F_OK)

            } catch (e) {
                exists = false
            }

            // firstly, deleting existing user profile picture
            if (exists) await unlink(`./public/images/user-${req.body.userId}/profile.jpg`)

            // decoding new profile picture and saving
            await decode(req.body.data.pfp.slice(22), { fname: `./public/images/user-${req.body.userId}/profile`, ext: 'jpg' });


            req.body.data.pfpSrc = `/images/user-${req.body.userId}/profile.jpg`

            delete req.body.data.pfp

        }


        // if user wants to update evidence documents

        if (req.body.data.evidence) {
            // firstly checking if there is evidences before
            let exists = true
            try {
                await access(`./public/images/user-${req.body.userId}/evidence`, constants.F_OK)

            } catch (e) {
                exists = false
            }
            if (exists) { await rm(`./public/images/user-${req.body.userId}/evidence`, { recursive: true, force: true }) }

            // creating folder to save evidence documents

            await mkdir(`./public/images/user-${req.body.userId}/evidence`, { recursive: true }, (err) => {
                if (err) throw Error("Folder creating error !!")
            });

            // converting base64 image to jpg files and creating public links

            let i = 0
            let evidence = []
            req.body.data.evidence.map(async (base64) => {


                i++
                evidence.push(`/images/user-${req.body.userId}/evidence/${cipher("evidence" + req.body.userId, i)}.jpg`)
                await decode(base64.slice(22), { fname: `./public/images/user-${req.body.userId}/evidence/${cipher("evidence" + req.body.userId, i)}`, ext: 'jpg' });

            })

            req.body.data.evidence = evidence

        }

        // updating user database

        await User.findOneAndUpdate(

            {
                userId: req.body.userId,
            }
            ,
            req.body.data
        )

        res.status(200).json({
            msg: "Profile edited by admin Successfully !!"
        })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function postDelete(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        await Post.deleteOne({ _id: req.body._id })

        await unlink(`./public/images/user-${req.body.userId}/${req.body.postId}`)

        res.status(200).json({ msg: "post deleted by admin successfully !!" })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function userDelete(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        await User.deleteOne({ userId: req.body.userId })

        let exists = true
        try {
            await access(`./public/images/user-${req.body.userId}`, constants.F_OK)

        } catch (e) {
            exists = false
        }

        // firstly, deleting existing user profile picture
        if (exists) await unlink(`./public/images/user-${req.body.userId}`)

        res.status(200).json({ msg: "user deleted by admin successfully !!" })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function createPost(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        // creating unique post id 

        let totalPostCount = await File.findOne({ _id: new mongoose.Types.ObjectId("66d5f1fee8b87b8984f6a94a") })

        const postId = cipher(req.body.area.slice(0, 4) + totalPostCount.count, 16)

        // creating folder for post images

        await mkdir(`./public/images/admin/${postId}`, { recursive: true }, (err) => {
            if (err) throw Error("Folder creating error !!")
        });

        // converting base64 image to jpg files and creating public links

        let i = 0
        let imgSrc = []
        req.body.images.map(async (base64) => {


            i++
            imgSrc.push(`/images/admin/${postId}/${cipher("image" + postId, i)}.jpg`)
            await decode(base64.slice(22), { fname: `./public/images/admin/${postId}/${cipher("image" + postId, i)}`, ext: 'jpg' });

        })

        // saving the post on database

        const post = new Post({
            userId: "admin",
            images: imgSrc,
            bed: req.body.bed,
            bath: req.body.bath,
            balcony: req.body.balcony,
            floorSize: req.body.floorSize,
            description: req.body.description,
            amenities: req.body.amenities,
            area: req.body.area,
            address: req.body.address,
            rent: req.body.rent,
            lat: req.body.lat,
            long: req.body.long,
            advance: req.body.advance,
            utilityBills: req.body.utilityBills,
            chargeCategory: req.body.chargeCategory,
            rentDate: req.body.rentDate,
            type: req.body.type,
            impression: 0,
            comments: [null],
            isApproved: false,
            fbLink: req.body.fbLink,
            postId
        })

        await post.save()


        // updating total post count
        let upCount = totalPostCount.count + 1
        await File.findOneAndUpdate({ _id: new mongoose.Types.ObjectId("66d5f1fee8b87b8984f6a94a") }, { count: upCount })


        res.status(200).json({
            msg: "Post created by admin successfully !!"
        })


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function adminLogin(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")

        if (req.body.password == process.env.ADMIN_PASS && req.body.userName === process.env.ADMIN_USERNAME) {
            const adminToken = jwt.sign({ role: "admin", name: "akib_hasan" }, process.env.ADMIN_TOKEN_SECRET, { expiresIn: '1d' })
            res
                .status(200)
                .cookie('adminToken', adminToken, {
                    sameSite: 'strict',
                    path: '/',
                    maxAge: 31536000000,

                    httpOnly: true,
                })
                .json({
                    msg: "Logged In as admin !!!",
                    adminToken,
                    adminObj: {
                        role: "admin",
                        name: "akib_hasan"
                    }
                })

        }
        else {
            throw Error("Unauthorized !!!!!!!")
        }


    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
}

export async function adminLogout(req, res) {
    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.query.nimda != process.env.ADMIN_KEY) throw Error("admin UnAuthorized!!")


        res.clearCookie("adminToken")

        res.status(200).json({
            msg: "Logged out as admin !!!",
        })

    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }
} 