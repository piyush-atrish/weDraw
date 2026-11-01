import express from "express";
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/userRoutes.js";
import { roomRouter } from "./routes/roomRoutes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/user/room' , roomRouter);
app.use('/api/v1/user' , userRouter);

app.use(globalErrorHandler);

app.listen(3001,()=>{
    console.log("http-backend server running on port 3001...");
})