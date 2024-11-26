import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js';

export async function authCheck(req, res, next) {

    try {

        // verifying user jwt access token


       
        const user = jwt.verify(req.cookies.accessToken, process.env.ACCESS_TOKEN_SECRET)
 

        if (user) {

            req.userId = user.userId

            // authentication successfull and forwarding to the next function
            next()
        }

        else {

            // there is no data in the token , so it is unauthorized

            throw Error("Unauthorized !!")
        }

    }


    // if the jwt access token failed to verify or expires

    catch (error) {

        try {

            // checking user's refresh token renew access token

            const userRefresh = jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET)


            if (userRefresh) {

                // matching it to the original refresh token of user which is stored in database

                const userRefreshDb = await User.findOne({ userId: userRefresh.userId })
                if (userRefreshDb) {

                    // checking equality

                    if (userRefreshDb.refreshToken === req.cookies.refreshToken) {

                        // issuing new access token 
                        const accessToken = jwt.sign(userRefresh, process.env.ACCESS_TOKEN_SECRET, {
                            expiresIn: '15m'
                        })
                        res
                            .status(202)
                            .cookie('accessToken', accessToken, {
                                sameSite: 'strict',
                                path: '/',
                                maxAge: 31536000000,

                                httpOnly: true,
                            })


                        req.userId = userRefresh.userId

                        // authorization successful
                        next()
                    } 


                    // if user's refresh token and database refresh token doesn't match

                    else {

                        throw Error("Invalid refreshToken !!")
                    }
                }



            }
        } catch (_error) {

            // responsing errors
            console.log("unautho")

           res.status(500).json({
                err:_error.message
           })


        }


    }
}