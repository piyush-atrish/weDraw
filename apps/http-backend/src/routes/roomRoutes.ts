import { Router } from "express";
import type { Request , Response ,  NextFunction } from "express";

export const roomRouter : Router= Router();

roomRouter.post('/create' , async(req : Request , res : Response , next : NextFunction)=>{

});

roomRouter.post('/join' , async(req : Request , res : Response , next : NextFunction)=>{

});

roomRouter.post('/exit' , async(req : Request , res : Response , next : NextFunction)=>{

});

roomRouter.post('/delete' , async(req : Request , res : Response , next : NextFunction)=>{

});