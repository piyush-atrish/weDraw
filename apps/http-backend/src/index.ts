import express from "express";
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/userRoutes.js";
import { roomRouter } from "./routes/roomRoutes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { prisma } from "@repo/db";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1/user/room' , roomRouter);
app.use('/api/v1/user' , userRouter);

app.use(globalErrorHandler);

const main = async()=>{
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Successfully connected to database");
    app.listen(3001, () => {
      console.log("Server is running on port 3001...");
    });
  } catch (error) {
    console.error("Database connection failed. Aborting startup.", error);
    process.exit(1);
  }
}

main();