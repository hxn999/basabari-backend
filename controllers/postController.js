import { decode } from "node-base64-image"

import { mkdir, unlink, access, rm } from 'fs/promises'
import { constants } from "fs"
import { cipher } from "../middleware/cipher.js"
import { Post } from "../models/postModel.js"
import { User } from "../models/userModel.js"
import { File } from "../models/fileModel.js"
import mongoose from "mongoose"




export async function postServer(req, res) {

    try {

        // checking api_key of client 

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")


        // querying to database for posts

        const regex = new RegExp(`${req.query.area}\\s*`, "i");
        let posts = await Post.find({
            area: regex,
            rent: { $gt: parseInt(req.query.gt), $lt: parseInt(req.query.lt) },
            bed: { $gt: (parseInt(req.query.bed)-1) },
            bath: { $gt: (parseInt(req.query.bath)-1) },
            floorSize: { $gt: parseInt(req.query.floor) },
            isApproved:true
        })

        // responsing all posts

       
            
            res.status(200).json({
                post: posts
            })



    } catch (error) {

        res.status(500).json({
            err: error.message
        })

    }



}

export async function getSinglePost(req, res) {

    try {

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")

        // getting property owner info from database
        let _id = req.query._id
        let singlePost = await Post.findOne({_id})
        
        let ownerObj = await User.findOne({userId: singlePost.userId })
        let owner = null
        if (ownerObj&&singlePost) {
            owner = {
                name: ownerObj.name,
                phone: ownerObj.phone,
                pfp: ownerObj.pfpSrc,
                fbLink:ownerObj.fbLink
            }
        } else {
            throw Error("Not Found !!")
        }

        let updatedImpression = singlePost.impression + 1

       
            
            res.status(200).json({
                owner,
                singlePost
            })
    
        

        await Post.findOneAndUpdate({_id},{impression:updatedImpression})

    } catch (error) {
        res.status(500).json({
            err: error.message
        })
    }


}

export async function createPost(req, res) {

    try {
    
        
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")

        // creating unique post id 

        let totalPostCount = await File.findOne({ _id: new mongoose.Types.ObjectId("6706f1de289ba53e228e8234") })



        const postId = cipher(req.body.area.slice(0, 4) + totalPostCount.count, 16)

        // creating folder for post images

        await mkdir(`./public/images/user-${req.userId}/${postId}`, { recursive: true }, (err) => {
            if (err) throw Error("Folder creating error !!")
        });

        // converting base64 image to jpg files and creating public links

        let i = 0
        let imgSrc = []
        req.body.images.map(async (base64) => {


            i++
            imgSrc.push(`/images/user-${req.userId}/${postId}/${cipher("image" + postId, i)}.jpg`)
            await decode(base64.slice(22), { fname: `./public/images/user-${req.userId}/${postId}/${cipher("image" + postId, i)}`, ext: 'jpg' });

        })

        // saving the post on database

        const post = new Post({
            userId: req.userId,
            images: imgSrc,
            bed: req.body.bed,
            bath: req.body.bath,
            living:req.body.living,
            dining:req.body.dining,
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
            rentDate: req.body.rentDate,
            type: req.body.type,
            impression: 0,
            comments: [null],
            isApproved: false,
            fbLink: req.body.fbLink,
            postId,
            date:Date.now()
        })

        await post.save()


        // updating total post count
        let upCount = totalPostCount.count + 1
        await File.findOneAndUpdate({ _id: new mongoose.Types.ObjectId("66d5f1fee8b87b8984f6a94a") }, { count: upCount })

        
            res.status(200).json({
                msg: "Post saved successfully !!"
            })
       
       

    } catch (error) {

        // responsing user errors if post saving fails
        res.status(500).json({
            err: error.message
        })
    }

}

export async function updatePost(req, res) {
    try {


        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")

        // finding post from database and updating it

        if (req.body.data.images) {
            // firstly removing all previous post images

            await rm(`./public/images/user-${req.userId}/${req.body.postId}`, { recursive: true, force: true })

            // creating folder for post images

            await mkdir(`./public/images/user-${req.userId}/${req.body.postId}`, { recursive: true }, (err) => {
                if (err) throw Error("Folder creating error !!")
            })

            // converting base64 image to jpg files and creating public links

            let i = 0
            let imgSrc = []
            req.body.data.images.map(async (base64) => {

                i++
                imgSrc.push(`/images/user-${req.userId}/${req.body.postId}/${cipher("image" + req.body.postId, i)}.jpg`)
                await decode(base64.slice(22), { fname: `./public/images/user-${req.userId}/${req.body.postId}/${cipher("image" + req.body.postId, i)}`, ext: 'jpg' })

            })

            req.body.data.images = imgSrc
           
        }

        await Post.findOneAndUpdate(
            {
                $and: [
                    {
                        _id: req.body._id
                    },
                    {
                        userId: req.userId
                    }
                ]
            },
            req.body.data
        )

        res.status(200).json({ msg: "Post updated successfully !!" })


    } catch (error) {
        res.status(500).json({
            err: error.message
        })
    }

}