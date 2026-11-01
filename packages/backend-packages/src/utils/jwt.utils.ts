import jwt from "jsonwebtoken";

export const createToken = (id : string , jwtKey : string)=>{
    return jwt.sign({
        userId : id,
    },jwtKey);
}

export const verifyToken = (token : string , jwtKey : string)=>{
    try{
        const Response : any = jwt.verify(token,jwtKey);
        return Response.userId;
    }
    catch(e){
         throw new Error("Unaurthorised");
    }
}