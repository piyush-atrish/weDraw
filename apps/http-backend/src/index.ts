import express from "express";
import cookieParser from "cookie-parser"
import { userRouter } from "./routes/userRoutes.js";
import { roomRouter } from "./routes/roomRoutes.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { prisma } from "@repo/db";
import cors from "cors";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.set("trust proxy", 1);


app.use(cors({
  origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use('/api/v1/user/room' , roomRouter);
app.use('/api/v1/user' , userRouter);

app.use(globalErrorHandler);

const main = async()=>{
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Successfully connected to database");
    app.listen(PORT, () => console.log(`http-backend listening on ${PORT}`));
  } catch (error) {
    console.error("Database connection failed. Aborting startup.", error);
    process.exit(1);
  }
}

main();