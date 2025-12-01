import { prisma } from "../config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
import { Prisma } from "@prisma/client";

import {
    LoginInput,
    RegisterInput,
    RegisterResponse,
} from "@react-express-library/shared";

/**
 * Mendaftarkan pengguna baru ke database.
 * @param userData Data pengguna (email, password, username).
 * @returns Objek pengguna baru tanpa password.
 */
export const register = async (userData: RegisterInput): Promise<RegisterResponse> => {
    const { email, password, username } = userData;

    if (!email || !password) {
        throw new Error("Email and password are required for registration.");
    }

    try {
        // Enkripsi (hash) password sebelum disimpan untuk keamanan
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                username: username ?? null,
            },
            // Pilih hanya data yang aman untuk dikembalikan
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
            },
        });
        return newUser;
    } catch (error: unknown) {
        console.error("Error during user registration:", error);
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // P2002: Unique constraint violation (email already exists)
            if (error.code === "P2002") {
                // Check if the target is the email field
                if ((error.meta?.target as string[])?.includes("email")) {
                    throw new Error(
                        `Registration failed: Email "${email}" already exists.`
                    );
                }
            }
        }
        // Generic fallback
        throw new Error("Database error during user registration.");
    }
};

/**
 * Memvalidasi kredensial pengguna dan mengembalikan JWT.
 * @param credentials Data login (email, password).
 * @returns JWT token jika valid, atau null jika tidak.
 */
export const login = async (
    credentials: LoginInput
): Promise<string> => {
    const { email, password } = credentials;

    if (!email || !password) {
        throw new Error("Email and password are required for login.");
    }

    try {
        // Cari pengguna berdasarkan email
        const user = await prisma.user.findUnique({
            where: { email },
        });

        // Jika pengguna tidak ditemukan, kembalikan null
        if (!user) {
            throw new Error("Invalid email or password");
        }

        // Bandingkan password yang diinput dengan hash di database
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("JWT_SECRET environment variable is not set!");
            throw new Error("Authentication configuration error."); // Don't expose details
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, // Payload
            jwtSecret,
            { expiresIn: "1d" } // Token expires in 1 day
        );

        return token;
    } catch (error: unknown) {
        console.error("Error during user login:", error);

        if (error instanceof Error && error.message.includes("Invalid")) {
            throw error;
        }
        if (
            error instanceof Error &&
            error.message.includes("configuration error")
        ) {
            throw error;
        }

        // Generic fallback
        throw new Error("An error occurred during login.");
    }
};
