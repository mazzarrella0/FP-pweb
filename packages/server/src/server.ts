import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { prisma } from "./config/prisma";
import mainRouter from "./api/index";
import cors from "cors";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Increase JSON body size limit to 10MB for image uploads (base64)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to the Express.js Application!" });
});

app.get("/health-check", (req: Request, res: Response) => {
    try {
        const currentDate = new Date();
        const formattedDate = currentDate.toDateString();

        res.status(200).json({
            success: true,
            message: "Server is healthy",
            date: formattedDate,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server is unhealthy",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});

app.use("/api", mainRouter);

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
};

startServer();
