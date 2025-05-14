import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { createBookSchema, updateBookSchema } from '../models/schemas';

export const getBooks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, author, category, available } = req.query;
    
    // Build filter conditions
    const where: any = {};
    
    if (title) {
      where.title = {
        contains: String(title),
        mode: 'insensitive',
      };
    }
    
    if (author) {
      where.author = {
        contains: String(author),
        mode: 'insensitive',
      };
    }
    
    if (category) {
      where.category = {
        name: {
          contains: String(category),
          mode: 'insensitive',
        },
      };
    }
    
    if (available === 'true') {
      where.quantity = {
        gt: 0,
      };
    }
    
    // Pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get books
    const books = await prisma.book.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        title: 'asc',
      },
    });
    
    // Get total count for pagination
    const totalBooks = await prisma.book.count({ where });
    
    res.status(200).json({
      status: 'success',
      results: books.length,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalBooks / limit),
        totalResults: totalBooks,
      },
      data: {
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    if (!book) {
      return next(new AppError('Book not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        book,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = createBookSchema.parse(req.body);
    
    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id: validatedData.categoryId },
    });
    
    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }
    
    // Check if ISBN is unique
    const isbnExists = await prisma.book.findUnique({
      where: { isbn: validatedData.isbn },
    });
    
    if (isbnExists) {
      return next(new AppError('A book with this ISBN already exists', 400));
    }
    
    // Create book
    const newBook = await prisma.book.create({
      data: validatedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        book: newBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Validate input
    const validatedData = updateBookSchema.parse(req.body);
    
    // Check if book exists
    const bookExists = await prisma.book.findUnique({
      where: { id },
    });
    
    if (!bookExists) {
      return next(new AppError('Book not found', 404));
    }
    
    // Check if category exists if provided
    if (validatedData.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      });
      
      if (!categoryExists) {
        return next(new AppError('Category not found', 404));
      }
    }
    
    // Check if ISBN is unique if provided
    if (validatedData.isbn && validatedData.isbn !== bookExists.isbn) {
      const isbnExists = await prisma.book.findUnique({
        where: { isbn: validatedData.isbn },
      });
      
      if (isbnExists) {
        return next(new AppError('A book with this ISBN already exists', 400));
      }
    }
    
    // Update book
    const updatedBook = await prisma.book.update({
      where: { id },
      data: validatedData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        book: updatedBook,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    // Check if book exists
    const bookExists = await prisma.book.findUnique({
      where: { id },
    });
    
    if (!bookExists) {
      return next(new AppError('Book not found', 404));
    }
    
    // Check if book has active loans
    const activeLoans = await prisma.bookLoan.findFirst({
      where: {
        bookId: id,
        status: 'ACTIVE',
      },
    });
    
    if (activeLoans) {
      return next(new AppError('Cannot delete book with active loans', 400));
    }
    
    // Delete book
    await prisma.book.delete({
      where: { id },
    });
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
