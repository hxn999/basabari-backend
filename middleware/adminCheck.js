import jwt from 'jsonwebtoken'
import { User } from '../models/userModel.js';

export async function adminCheck(req, res, next) {

    try {

        // verifying user jwt access token



        const admin = jwt.verify(req.cookies.adminToken, process.env.ADMIN_TOKEN_SECRET)

        if (admin) {

         if(admin.role==="admin"&&admin.name==="akib_hasan")  {
            next()
         }
         else{
            throw Error("Unauthorized !!")
         }
            // authentication successfull and forwarding to the next function
           
        }

        else {

            // there is no data in the token , so it is unauthorized

            throw Error("Unauthorized !!")
        }

    }


    // if the jwt access token failed to verify or expires

    catch (error) {

        res.status(500).json({
            err:error.message
        })


    }
}