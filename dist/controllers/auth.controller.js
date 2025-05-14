import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { loginSchema, registerUserSchema } from '../models/schemas.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, deleteRefreshToken, deleteAllUserRefreshTokens } from '../utils/token.utils.js';
export const register = async (req, res, next) => {
    try {
        const validatedData = registerUserSchema.parse(req.body);
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (existingUser) {
            return next(new AppError('User with this email already exists', 400));
        }
        const hashedPassword = await bcrypt.hashSync(validatedData.password, 12);
        const newUser = await prisma.user.create({
            data: {
                ...validatedData,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                user: newUser,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email },
        });
        if (!user) {
            return next(new AppError('Invalid email or password', 401));
        }
        const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
        if (!isPasswordValid) {
            return next(new AppError('Invalid email or password', 401));
        }
        const tokenPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = generateAccessToken(tokenPayload);
        const refreshToken = await generateRefreshToken(tokenPayload);
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                },
                accessToken,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return next(new AppError('Refresh token not provided', 401));
        }
        const decoded = await verifyRefreshToken(refreshToken);
        const accessToken = generateAccessToken({
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        });
        res.status(200).json({
            status: 'success',
            data: {
                accessToken,
            },
        });
    }
    catch (error) {
        res.clearCookie('refreshToken');
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await deleteRefreshToken(refreshToken);
        }
        res.clearCookie('refreshToken');
        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
export const logoutAll = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        await deleteAllUserRefreshTokens(req.user.id);
        res.clearCookie('refreshToken');
        res.status(200).json({
            status: 'success',
            message: 'Logged out from all devices successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=auth.controller.js.map