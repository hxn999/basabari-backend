import { User } from '../models/userModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Post } from '../models/postModel.js';
import { mkdir, unlink, access, rm } from 'fs/promises'
import { decode } from 'node-base64-image'
import { constants } from 'fs';

import { cipher, deCipher } from '../middleware/cipher.js'




export async function logIn(req, res) {

    try {

        // checking the user exists or not
        const user = await User.findOne({

            $or: [{ phone: req.body.emailPhone }, { email: req.body.emailPhone }]
        })


        if (user) {

            // matching password

            const isValidPassword = await bcrypt.compare(
                req.body.password,
                user.password
            );

            // if password matchhes
            if (isValidPassword) {

                // creating jwt tokens to response the user



                const userInfo = {
                    userId: user.userId,
                    phone: user.phone,
                    area: user.area,
                    name: user.name,
                    pfpSrc: user.pfpSrc
                }
                const refreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET)
                const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
                await User.findOneAndUpdate({ userId: user.userId }, { refreshToken })


                //  responsing user 

                res
                    .status(202)
                    .cookie('accessToken', accessToken, {
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 31536000000,

                        httpOnly: true,
                    })
                    .cookie('refreshToken', refreshToken, {
                        sameSite: 'strict',
                        path: '/',
                        maxAge: 31536000000,

                        httpOnly: true,
                    })
                    .json({

                        msg: "Login successful !!",
                        accessToken,
                        refreshToken,
                        userInfo,


                    })
            }

            // if users  password does not matches

            else {
                throw Error("Wrong password !!")

            }


        }

        // if user does not exists 

        else {

            throw Error("User does not exist !!")

        }




    } catch (error) {

        // responsing user with errors

        res.status(500).json({
            err: error.message
        })


    }

}

export async function logOut(req, res) {


    try {

        // clearing jwt cookies

        res.clearCookie("accessToken")
        res.clearCookie("refreshToken")


        res.status(200).json({
            msg: "Logout successfull"
        })


    } catch (error) {
        console.log(error);
        

        // if cookie clearing fails sending error 

        res.status(500).json({
            err: error.message
        })

    }


}

export async function createUser(req, res) {
    // creating new user(property owner) in database

    try {

        console.log(req.body)
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")

        // Checking if already user exitsts or not

        const existedUser = await User.findOne({
            $or: [{ phone: req.body.phone }, { email: req.body.email }]
        })

        if (existedUser) throw Error("User already exists!!")

        // checking user evidence is null or not

        let pfpSrc = null


        // using cipher algorithm to encrypt the information

        const userId = cipher(req.body.firstName + "_" + req.body.phone, 16)



        const userInfo = {
            userId,
            phone: req.body.phone,
            area: req.body.area,
            name: req.body.firstName + " " + req.body.lastName,

        }

        // if the user has sent profile picture

        if (req.body.pfp) {
            await mkdir(`./public/images/user-${userId}`, { recursive: true }, (err) => {
                if (err) {
                    throw Error("file saving error")
                }
            });




            await decode(req.body.pfp.slice(22), { fname: `./public/images/user-${userId}/profile`, ext: 'jpg' });


            pfpSrc = `/images/user-${userId}/profile.jpg`
        }

        // if user didn't sent profile picture , linking a default picture

        else {
            if (req.body.gender === "male") {
                pfpSrc = `/images/default-pfp-male.jpg`
            }
            else {
                pfpSrc = `/images/default-pfp-female.jpg`
            }
        }

        // updating userInfo with profile picture source


        userInfo.pfpSrc = pfpSrc


        // if the user uploaded evidence

        // creating folder to save evidence documents

        await mkdir(`./public/images/user-${req.userId}/evidence`, { recursive: true }, (err) => {
            if (err) throw Error("Folder creating error !!")
        });

        // converting base64 image to jpg files and creating public links

        let i = 0
        let evidence = []
        req.body.evidence?.map(async (base64) => {


            i++
            evidence.push(`/images/user-${req.userId}/evidence/${cipher("evidence" + userId, i)}.jpg`)
            await decode(base64.slice(22), { fname: `./public/images/user-${req.userId}/evidence/${cipher("evidence" + userId, i)}`, ext: 'jpg' });

        })


        // hashing users password and creating jwt tokens

        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const refreshToken = jwt.sign(userInfo, process.env.REFRESH_TOKEN_SECRET)
        const accessToken = jwt.sign(userInfo, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })



        // saving it to the database

        const user = new User({
            email: req.body.email,
            password: hashedPassword,
            address: req.body.address,
            area: req.body.area,
            phone: req.body.phone,
            name: req.body.firstName + ' ' + req.body.lastName,
            userId,
            isVerified: false,
            lat: req.body.lat,
            long: req.body.long,
            refreshToken: refreshToken,
            pfpSrc,
            gender: req.body.gender,
            evidence,
            date:Date.now(),
            fbLink: req.body.fbLink
        })
        await user.save()


        // giving a response to the user

        res
            .status(200)
            .cookie('accessToken', accessToken, {
                sameSite: 'strict',
                path: '/',
                maxAge: 31536000000,

                httpOnly: true,
            })
            .cookie('refreshToken', refreshToken, {
                sameSite: 'strict',
                path: '/',
                maxAge: 31536000000,

                httpOnly: true,
            })
            .json({
                msg: "user created!!",
                accessToken,
                refreshToken,
                userInfo

            })

    } catch (error) {

        // sending errors if it fails

        res.status(500).json({
            err: error.message
        })

    }

}

export async function getProfilePost(req, res) {

    try {

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.userId != req.query.userId) throw Error("Unauthorized !")



        const user = await User.findOne({ userId: req.userId })
        const posts = await Post.find({
            userId: req.userId
        })

     

            res.status(200).json(
                {
                    user: {
                        email: user.email,
                        phone: user.phone,
                        pfpSrc: user.pfpSrc,
                        evidence: user.evidence,
                        address: user.address,
                        area: user.area,
                        isVerified: user.isVerified,
                        fbLink: user.fbLink
                    }
                    ,
                    posts,
                }
            )
    

    } catch (error) {
        res.status(500).json({
            err: error.message
        })
    }

}

export async function getProfile(req, res) {

    try {
        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")


        console.log(req.userId)
        const user = await User.findOne({ userId: req.userId })

       

            res.status(200).json(
                {
                    ...user._doc,
                    password: null,
                    refreshToken: null,

                }
            )


    } catch (error) {
        res.status(500).json({
            err: error.message
        })
    }

}

export async function editProfile(req, res) {
    try {

        if (req.query.api_key != process.env.API_KEY) throw Error("UnAuthorized!!")
        if (req.userId != req.body.userId) throw Error("Unauthorized !")

        // if user wants to update his profile picture

        if (req.body.data.pfp == "default") {


            let exists = true
            try {
                await access(`./public/images/user-${req.userId}/profile.jpg`, constants.F_OK)

            } catch (e) {
                exists = false
            }

            // firstly, deleting existing user profile picture
            if (exists) await unlink(`./public/images/user-${req.userId}/profile.jpg`)



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
                await access(`./public/images/user-${req.userId}/profile.jpg`, constants.F_OK)

            } catch (e) {
                exists = false
            }

            // firstly, deleting existing user profile picture
            if (exists) {await unlink(`./public/images/user-${req.userId}/profile.jpg`)}

            // decoding new profile picture and saving
            await decode(req.body.data.pfp.slice(22), { fname: `./public/images/user-${req.userId}/profile`, ext: 'jpg' });


            req.body.data.pfpSrc = `/images/user-${req.userId}/profile.jpg`

            delete req.body.data.pfp

        }

        // if user wants to edit evidence documents

        if (req.body.data.evidence) {
            // firstly checking if there is evidences before
            let exists = true
            try {
                await access(`./public/images/user-${req.userId}/evidence`, constants.F_OK)

            } catch (e) {
                exists = false
            }
            if (exists) {await rm(`./public/images/user-${req.userId}/evidence`, { recursive: true, force: true })}

            // creating folder to save evidence documents

            await mkdir(`./public/images/user-${req.userId}/evidence`, { recursive: true }, (err) => {
                if (err) throw Error("Folder creating error !!")
            });

            // converting base64 image to jpg files and creating public links

            let i = 0
            let evidence = []
            req.body.data.evidence.map(async (base64) => {


                i++
                evidence.push(`/images/user-${req.userId}/evidence/${cipher("evidence" + req.userId, i)}.jpg`)
                await decode(base64.slice(22), { fname: `./public/images/user-${req.userId}/evidence/${cipher("evidence" + req.userId, i)}`, ext: 'jpg' });

            })

            req.body.data.evidence = evidence

        }




        // updating user database

        await User.findOneAndUpdate(

            {
                userId: req.userId,
            }
            ,
            req.body.data
        )

        res.status(200).json({
            msg: "Profile Updated Successfully !!",
            userInfo: {
                userId: req.userId,
                pfpSrc: req.body.data.pfpSrc,
                phone: req.body.data.phone,
                area: req.body.data.area,
                name: req.body.data.name
            }
        })


    } catch (error) {
        res.status(500).json({
            err: error.message
        })

    }
}