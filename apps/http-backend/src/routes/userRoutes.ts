import "dotenv/config";
import { Router } from "express";
import type { Request , Response ,  NextFunction } from "express";
import { credSchema } from "../validators/auth.validator.js";
import { createToken } from "@repo/backend-packages/jwt.utils";
import { createUser , userSignIn } from "../dao/user.dao.js";

export const userRouter : Router = Router();

userRouter.post('/signup' , async(req : Request , res : Response , next : NextFunction)=>{
    const{email,userName,password} = req.body;
    const userData = {
        email,
        userName,
        password
    };
    try{
        const response = credSchema.safeParse(userData);
        if(!response.success){
            console.log( response.error.issues.map(issue => issue.message));
            res.status(401).json({
                message:"provide proper creds"
            });
        }

        await createUser(userData);
        
        res.status(200).json({
            message : "user signed up!"
        });

    }
    catch(e){
        next(e);
    }
});

userRouter.post('/signin' , async(req : Request , res : Response , next : NextFunction)=>{
        const {email ,password} = req.body;
        const signInData = {
            email,
            password
        };
        try{
            const id = await userSignIn(signInData);
            const jwtKey = process.env.JWT_USER as string;
            if(!jwtKey)throw new Error("missing jwt key");
            const token = createToken(id ,jwtKey);
            res.cookie("token", token, {
            httpOnly: true,  
            secure: false,  
            maxAge: 86400000
            });
            res.status(200).json({
            message : "you have signed in"
        });
        }
        catch(e){
            next(e);
        }
});