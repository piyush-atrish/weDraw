import {prisma} from "@repo/db";
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcrypt";

interface userData{
    email : string
    userName : string
    password : string
}


interface signInData {
    email: string;
    password: string;
}

export const createUser = async(userData : userData)=>{
        try{
            userData.password = await bcrypt.hash(userData.password,10);
            await prisma.user.create({
                data: userData
            });
        }
        catch(e){
            console.log(e);
            throw new AppError("error while registering user in database" , 500);
        }
}


export const userSignIn = async (signInData: signInData) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: signInData.email,
            },
        });

        if (!user) {
            throw new AppError("Invalid email or password", 401);
        }

        const isPasswordValid = await bcrypt.compare(signInData.password, user.password);

        if (!isPasswordValid) {
            throw new AppError("Invalid email or password", 401);
        }

        return user.id.toString();
    } catch (e) {
        if (e instanceof AppError) {
            throw e;
        }
        console.error("Database error during sign-in:", e);
        throw new AppError("Error while signing in", 500);
    }
};
