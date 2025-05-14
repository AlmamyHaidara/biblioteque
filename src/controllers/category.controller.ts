import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { createCategorySchema, updateCategorySchema } from '../models/schemas';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        books: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
          },
        },
      },
    });

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = createCategorySchema.parse(req.body);

    // Check if category already exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: validatedData.name },
    });

    if (existingCategory) {
      return next(new AppError('Category with this name already exists', 400));
    }

    // Create category
    const newCategory = await prisma.category.create({
      data: validatedData,
    });

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Validate input
    const validatedData = updateCategorySchema.parse(req.body);

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }

    // Check if name is already taken
    if (validatedData.name && validatedData.name !== categoryExists.name) {
      const nameExists = await prisma.category.findUnique({
        where: { name: validatedData.name },
      });

      if (nameExists) {
        return next(new AppError('Category with this name already exists', 400));
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: validatedData,
    });

    res.status(200).json({
      status: 'success',
      data: {
        category: updatedCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryExists = await prisma.category.findUnique({
      where: { id },
    });

    if (!categoryExists) {
      return next(new AppError('Category not found', 404));
    }

    // Check if category has books
    const booksCount = await prisma.book.count({
      where: { categoryId: id },
    });

    if (booksCount > 0) {
      return next(
        new AppError(
          `Cannot delete category with associated books. The category has ${booksCount} books.`,
          400
        )
      );
    }

    // Delete category
    await prisma.category.delete({
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
