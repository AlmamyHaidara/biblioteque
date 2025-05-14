import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { createReservationSchema, updateReservationSchema } from '../models/schemas';
import { ReservationStatus } from '@prisma/client';

export const getReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status, userId, bookId } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (bookId) {
      where.bookId = bookId;
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get reservations
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
    
    // Get total count for pagination
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
  } catch (error) {
    next(error);
  }
};

export const getReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
  } catch (error) {
    next(error);
  }
};

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = createReservationSchema.parse(req.body);
    
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: validatedData.userId },
    });
    
    if (!userExists) {
      return next(new AppError('User not found', 404));
    }
    
    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: validatedData.bookId },
    });
    
    if (!book) {
      return next(new AppError('Book not found', 404));
    }
    
    // Check if user already has an active reservation for this book
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
    
    // Check if user already has an active loan for this book
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
    
    // Create reservation
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
  } catch (error) {
    next(error);
  }
};

export const updateReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const validatedData = updateReservationSchema.parse(req.body);
    
    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });
    
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }
    
    // Update reservation
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
  } catch (error) {
    next(error);
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if reservation exists
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });
    
    if (!reservation) {
      return next(new AppError('Reservation not found', 404));
    }
    
    // Check if reservation is already fulfilled or cancelled
    if (reservation.status !== ReservationStatus.PENDING) {
      return next(
        new AppError(
          `Reservation cannot be cancelled because it is already ${reservation.status.toLowerCase()}`,
          400
        )
      );
    }
    
    // Update reservation status to cancelled
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
  } catch (error) {
    next(error);
  }
};

export const getMyReservations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    
    const { status } = req.query;
    
    // Build filter conditions
    const where: any = {
      userId: req.user.id,
    };
    
    if (status) {
      where.status = status;
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get reservations
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
    
    // Get total count for pagination
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
  } catch (error) {
    next(error);
  }
};
