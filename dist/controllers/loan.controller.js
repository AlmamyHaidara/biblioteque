import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { createBookLoanSchema, updateBookLoanSchema } from '../models/schemas.js';
import { LoanStatus } from '@prisma/client';
export const getLoans = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getLoan = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const createLoan = async (req, res, next) => {
    try {
        const validatedData = createBookLoanSchema.parse(req.body);
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
        if (book.quantity <= 0) {
            return next(new AppError('Book is not available for loan', 400));
        }
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
        const newLoan = await prisma.$transaction(async (tx) => {
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
            await tx.book.update({
                where: { id: validatedData.bookId },
                data: {
                    quantity: {
                        decrement: 1,
                    },
                },
            });
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
    }
    catch (error) {
        next(error);
    }
};
export const updateLoan = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateBookLoanSchema.parse(req.body);
        const loan = await prisma.bookLoan.findUnique({
            where: { id },
            include: {
                book: true,
            },
        });
        if (!loan) {
            return next(new AppError('Loan not found', 404));
        }
        let updateData = { ...validatedData };
        let bookQuantityUpdate = false;
        if (validatedData.status === LoanStatus.RETURNED &&
            loan.status !== LoanStatus.RETURNED) {
            updateData.returnDate = validatedData.returnDate || new Date().toISOString();
            bookQuantityUpdate = true;
        }
        const updatedLoan = await prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getMyLoans = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=loan.controller.js.map