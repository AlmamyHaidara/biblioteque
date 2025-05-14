import { prisma } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { createCategorySchema, updateCategorySchema } from '../models/schemas.js';
export const getCategories = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const getCategory = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
export const createCategory = async (req, res, next) => {
    try {
        const validatedData = createCategorySchema.parse(req.body);
        const existingCategory = await prisma.category.findUnique({
            where: { name: validatedData.name },
        });
        if (existingCategory) {
            return next(new AppError('Category with this name already exists', 400));
        }
        const newCategory = await prisma.category.create({
            data: validatedData,
        });
        res.status(201).json({
            status: 'success',
            data: {
                category: newCategory,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const validatedData = updateCategorySchema.parse(req.body);
        const categoryExists = await prisma.category.findUnique({
            where: { id },
        });
        if (!categoryExists) {
            return next(new AppError('Category not found', 404));
        }
        if (validatedData.name && validatedData.name !== categoryExists.name) {
            const nameExists = await prisma.category.findUnique({
                where: { name: validatedData.name },
            });
            if (nameExists) {
                return next(new AppError('Category with this name already exists', 400));
            }
        }
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
    }
    catch (error) {
        next(error);
    }
};
export const deleteCategory = async (req, res, next) => {
    try {
        const { id } = req.params;
        const categoryExists = await prisma.category.findUnique({
            where: { id },
        });
        if (!categoryExists) {
            return next(new AppError('Category not found', 404));
        }
        const booksCount = await prisma.book.count({
            where: { categoryId: id },
        });
        if (booksCount > 0) {
            return next(new AppError(`Cannot delete category with associated books. The category has ${booksCount} books.`, 400));
        }
        await prisma.category.delete({
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
//# sourceMappingURL=category.controller.js.map