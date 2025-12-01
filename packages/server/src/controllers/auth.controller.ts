import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../middlewares/auth.middleware"; // Akan kita buat selanjutnya

import { isValiEmail, validatePassword } from "../utils/validation";
import { LoginInput, RegisterInput } from "@react-express-library/shared";

/**
 * Handler untuk endpoint registrasi (POST /auth/register).
 */
export const handleRegister = async (req: Request, res: Response) => {
    try {
        const userData  = req.body as RegisterInput;
        const { email, password } = userData;
        // Validasi input dasar
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const emailError = isValiEmail(email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({
                success: false,
                message: passwordError,
            });
        }

        const newUser = await authService.register(userData);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to register user:", error);
        if (error instanceof Error) {
            if (error.message.includes("already exists")) {
                return res.status(409).json({
                    success: false,
                    message: error.message,
                });
            }
            if (error.message.includes("required for registration")) {
                return res.status(400).json({
                    success: false,
                    message: error.message,
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk endpoint login (POST /auth/login).
 */
export const handleLogin = async (req: Request, res: Response) => {
    try {
        const credentials = req.body as LoginInput;
        const { email, password } = credentials;
        // Validasi input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            });
        }

        const emailError = isValiEmail(email);
        if (emailError) {
            return res.status(400).json({
                success: false,
                message: emailError,
            });
        }

        //  Basic password check
        if (typeof password !== "string" || password.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "Password is required" });
        }

        const token = await authService.login({ email, password });
        res.status(200).json({
            success: true,
            message: "Login successfully",
            data: { access_token: token },
        });
    } catch (error: unknown) {
        console.error("[ERROR] Failed to login user:", error);
        if (error instanceof Error) {
            if (error.message === "Invalid email or password") {
                return res
                    .status(401)
                    .json({ success: false, message: "Invalid credentials" });
            }
            if (error.message.includes("required for login")) {
                return res
                    .status(400)
                    .json({ success: false, message: error.message });
            }
            if (error.message === "Authentication configuration error.") {
                console.error("CRITICAL: JWT_SECRET is missing or invalid!");
                return res.status(500).json({
                    success: false,
                    message: "Internal server configuration error.",
                });
            }
            return res
                .status(500)
                .json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: "An unknown internal server error occurred",
        });
    }
};

/**
 * Handler untuk mendapatkan profil pengguna saat ini (GET /auth/me).
 */
export const handleGetMe = (req: AuthRequest, res: Response) => {
    // Data 'user' sudah divalidasi dan ditambahkan ke object 'req' oleh middleware
    res.status(200).json({
        success: true,
        message: "Get me successfully",
        data: req.user,
    });
};
