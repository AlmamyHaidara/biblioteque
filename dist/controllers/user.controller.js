import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { updateUserSchema, changePasswordSchema } from '../models/schemas.js';
export const getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateUserSchema.parse(req.body);
        const userExists = await prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            return next(new AppError('User not found', 404));
        }
        if (validatedData.email && validatedData.email !== userExists.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email: validatedData.email },
            });
            if (emailExists) {
                return next(new AppError('Email already in use', 400));
            }
        }
        const updatedUser = await prisma.user.update({
            where: { id },
            data: validatedData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                user: updatedUser,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userExists = await prisma.user.findUnique({
            where: { id },
        });
        if (!userExists) {
            return next(new AppError('User not found', 404));
        }
        await prisma.user.delete({
            where: { id },
        });
        res.status(204).json({
            status: 'success',
            data: null,
        });
    }
    catch (error) {
        next(error);
    }
};
export const changePassword = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        const validatedData = changePasswordSchema.parse(req.body);
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        const isPasswordCorrect = await bcrypt.compare(validatedData.currentPassword, user.password);
        if (!isPasswordCorrect) {
            return next(new AppError('Current password is incorrect', 401));
        }
        const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);
        await prisma.user.update({
            where: { id: req.user.id },
            data: {
                password: hashedPassword,
            },
        });
        res.status(200).json({
            status: 'success',
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMe = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return next(new AppError('User not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=user.controller.js.map