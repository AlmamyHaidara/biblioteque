import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { createBookLoanSchema, updateBookLoanSchema } from '../models/schemas';
import { LoanStatus } from '@prisma/client';

export const getLoans = async (
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
    
    // Get loans
    const loans = await prisma.bookLoan.findMany({
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
        loanDate: 'desc',
      },
    });
    
    // Get total count for pagination
    const totalLoans = await prisma.bookLoan.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: loans.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalLoans / limit),
        totalResults: totalLoans,
      },
      data: {
        loans,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const loan = await prisma.bookLoan.findUnique({
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
    
    if (!loan) {
      return next(new AppError('Loan not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        loan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = createBookLoanSchema.parse(req.body);
    
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
    
    // Check if book is available
    if (book.quantity <= 0) {
      return next(new AppError('Book is not available for loan', 400));
    }
    
    // Check if user already has an active loan for this book
    const existingLoan = await prisma.bookLoan.findFirst({
      where: {
        userId: validatedData.userId,
        bookId: validatedData.bookId,
        status: LoanStatus.ACTIVE,
      },
    });
    
    if (existingLoan) {
      return next(new AppError('User already has an active loan for this book', 400));
    }
    
    // Create loan and update book quantity in a transaction
    const newLoan = await prisma.$transaction(async (tx: any) => {
      // Create loan
      const loan = await tx.bookLoan.create({
        data: {
          userId: validatedData.userId,
          bookId: validatedData.bookId,
          dueDate: new Date(validatedData.dueDate),
          status: LoanStatus.ACTIVE,
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
      
      // Update book quantity
      await tx.book.update({
        where: { id: validatedData.bookId },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
      
      // Check for pending reservations and fulfill if applicable
      const pendingReservation = await tx.reservation.findFirst({
        where: {
          bookId: validatedData.bookId,
          status: 'PENDING',
        },
        orderBy: {
          reservationDate: 'asc',
        },
      });
      
      if (pendingReservation) {
        await tx.reservation.update({
          where: { id: pendingReservation.id },
          data: {
            status: 'FULFILLED',
          },
        });
      }
      
      return loan;
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        loan: newLoan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateLoan = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const validatedData = updateBookLoanSchema.parse(req.body);
    
    // Check if loan exists
    const loan = await prisma.bookLoan.findUnique({
      where: { id },
      include: {
        book: true,
      },
    });
    
    if (!loan) {
      return next(new AppError('Loan not found', 404));
    }
    
    // Handle return logic
    let updateData = { ...validatedData };
    let bookQuantityUpdate = false;
    
    // If status is being updated to RETURNED and it wasn't before
    if (
      validatedData.status === LoanStatus.RETURNED &&
      loan.status !== LoanStatus.RETURNED
    ) {
      updateData.returnDate = validatedData.returnDate || new Date().toISOString();
      bookQuantityUpdate = true;
    }
    
    // Update loan and book quantity in a transaction if needed
    const updatedLoan = await prisma.$transaction(async (tx) => {
      // Update loan
      const updatedLoan = await tx.bookLoan.update({
        where: { id },
        data: updateData,
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
      
      // Update book quantity if book is returned
      if (bookQuantityUpdate) {
        await tx.book.update({
          where: { id: loan.bookId },
          data: {
            quantity: {
              increment: 1,
            },
          },
        });
      }
      
      return updatedLoan;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        loan: updatedLoan,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLoans = async (
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
    
    // Get loans
    const loans = await prisma.bookLoan.findMany({
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
        loanDate: 'desc',
      },
    });
    
    // Get total count for pagination
    const totalLoans = await prisma.bookLoan.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: loans.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalLoans / limit),
        totalResults: totalLoans,
      },
      data: {
        loans,
      },
    });
  } catch (error) {
    next(error);
  }
};
