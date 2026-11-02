import {prisma} from "@repo/db";
import { AppError } from "../utils/AppError.js";

interface roomData{
    slug : string
    userId : string | undefined
}

export const createRoom = async(roomData : roomData)=>{
        try{
            await prisma.room.create({
                data: {
                    adminId : Number(roomData.userId),
                    slug : roomData.slug
                }
            });
        }
        catch(e){
            console.log(e);
            throw new AppError("error while registering room in database" , 500);
        }
}