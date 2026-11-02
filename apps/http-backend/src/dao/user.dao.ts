import {prisma} from "@repo/db";
import { AppError } from "../utils/AppError.js";

interface userData{
    email : string
    userName : string
    password : string
}

export const createUser = async(userData : userData)=>{
        try{
            await prisma.user.create({
                data: userData
            });
        }
        catch(e){
            console.log(e);
            throw new AppError("error while registering user in database" , 500);
        }
}