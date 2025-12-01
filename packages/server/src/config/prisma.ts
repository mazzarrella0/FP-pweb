import { PrismaClient } from "@prisma/client";

// This creates one single instance of the PrismaClient
// and makes it available to your entire application.
export const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"], // Optional: good for debugging
});
