import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { createReservationSchema, updateReservationSchema } from '../models/schemas.js';
import { ReservationStatus } from '@prisma/client';
export const getReservations = async (req, res, next) => {
    try {
        const { status, userId, bookId } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        if (userId) {
            where.userId = userId;
        }
        if (bookId) {
            where.bookId = bookId;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        isbn: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                reservationDate: 'desc',
            },
        });
        const totalReservations = await prisma.reservation.count({ where });
        res.status(200).json({
            status: 'success',
            results: reservations.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalReservations / limit),
                totalResults: totalReservations,
            },
            data: {
                reservations,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const getReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        isbn: true,
                    },
                },
            },
        });
        if (!reservation) {
            return next(new AppError('Reservation not found', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                reservation,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const createReservation = async (req, res, next) => {
    try {
        const validatedData = createReservationSchema.parse(req.body);
        const userExists = await prisma.user.findUnique({
            where: { id: validatedData.userId },
        });
        if (!userExists) {
            return next(new AppError('User not found', 404));
        }
        const book = await prisma.book.findUnique({
            where: { id: validatedData.bookId },
        });
        if (!book) {
            return next(new AppError('Book not found', 404));
        }
        const existingReservation = await prisma.reservation.findFirst({
            where: {
                userId: validatedData.userId,
                bookId: validatedData.bookId,
                status: ReservationStatus.PENDING,
            },
        });
        if (existingReservation) {
            return next(new AppError('User already has a pending reservation for this book', 400));
        }
        const existingLoan = await prisma.bookLoan.findFirst({
            where: {
                userId: validatedData.userId,
                bookId: validatedData.bookId,
                status: 'ACTIVE',
            },
        });
        if (existingLoan) {
            return next(new AppError('User already has an active loan for this book', 400));
        }
        const newReservation = await prisma.reservation.create({
            data: {
                userId: validatedData.userId,
                bookId: validatedData.bookId,
                status: ReservationStatus.PENDING,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        isbn: true,
                    },
                },
            },
        });
        res.status(201).json({
            status: 'success',
            data: {
                reservation: newReservation,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateReservationSchema.parse(req.body);
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });
        if (!reservation) {
            return next(new AppError('Reservation not found', 404));
        }
        const updatedReservation = await prisma.reservation.update({
            where: { id },
            data: {
                status: validatedData.status,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        isbn: true,
                    },
                },
            },
        });
        res.status(200).json({
            status: 'success',
            data: {
                reservation: updatedReservation,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const cancelReservation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reservation = await prisma.reservation.findUnique({
            where: { id },
        });
        if (!reservation) {
            return next(new AppError('Reservation not found', 404));
        }
        if (reservation.status !== ReservationStatus.PENDING) {
            return next(new AppError(`Reservation cannot be cancelled because it is already ${reservation.status.toLowerCase()}`, 400));
        }
        await prisma.reservation.update({
            where: { id },
            data: {
                status: ReservationStatus.CANCELLED,
            },
        });
        res.status(200).json({
            status: 'success',
            message: 'Reservation cancelled successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
export const getMyReservations = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        const { status } = req.query;
        const where = {
            userId: req.user.id,
        };
        if (status) {
            where.status = status;
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                book: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        isbn: true,
                        category: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                reservationDate: 'desc',
            },
        });
        const totalReservations = await prisma.reservation.count({ where });
        res.status(200).json({
            status: 'success',
            results: reservations.length,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalReservations / limit),
                totalResults: totalReservations,
            },
            data: {
                reservations,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=reservation.controller.js.map