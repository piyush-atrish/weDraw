import { Router } from "express";
import type { Request , Response ,  NextFunction } from "express";
import { userAuth } from "../middlewares/userAuth.js";
import { slugify } from "zod";
import { createRoom } from "../dao/room.dao.js";

export const roomRouter : Router= Router();

roomRouter.use(userAuth);

roomRouter.post('/create' , async(req : Request , res : Response , next : NextFunction)=>{
    try{
        const roomData = {
            userId : req.userId,
            slug : req.body.slug
        }
        await createRoom(roomData!);
        res.status(200).json({
            message : "room created!"
        });
    }
    catch(e){
        next(e);
    }
    
});

roomRouter.post('/join' , async(req : Request , res : Response , next : NextFunction)=>{

});

roomRouter.post('/exit' , async(req : Request , res : Response , next : NextFunction)=>{

});

roomRouter.post('/delete' , async(req : Request , res : Response , next : NextFunction)=>{

});