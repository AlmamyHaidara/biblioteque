import { z } from 'zod';
import { Role, LoanStatus, ReservationStatus } from '@prisma/client';
export const registerUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    role: z.nativeEnum(Role).optional(),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});
export const updateUserSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters').optional(),
    lastName: z.string().min(2, 'Last name must be at least 2 characters').optional(),
    email: z.string().email('Invalid email address').optional(),
    role: z.nativeEnum(Role).optional(),
});
export const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});
export const createBookSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    author: z.string().min(1, 'Author is required'),
    isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
    publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
    publisher: z.string().min(1, 'Publisher is required'),
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().int().min(0, 'Quantity must be a positive number'),
    categoryId: z.string().uuid('Category ID must be a valid UUID'),
});
export const updateBookSchema = z.object({
    title: z.string().min(1, 'Title is required').optional(),
    author: z.string().min(1, 'Author is required').optional(),
    isbn: z.string().min(10, 'ISBN must be at least 10 characters').optional(),
    publicationYear: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
    publisher: z.string().min(1, 'Publisher is required').optional(),
    description: z.string().min(1, 'Description is required').optional(),
    quantity: z.number().int().min(0, 'Quantity must be a positive number').optional(),
    categoryId: z.string().uuid('Category ID must be a valid UUID').optional(),
});
export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
});
export const updateCategorySchema = z.object({
    name: z.string().min(1, 'Name is required').optional(),
    description: z.string().optional(),
});
export const createBookLoanSchema = z.object({
    userId: z.string().uuid('User ID must be a valid UUID'),
    bookId: z.string().uuid('Book ID must be a valid UUID'),
    dueDate: z.string().datetime({ offset: true }),
});
export const updateBookLoanSchema = z.object({
    returnDate: z.string().datetime({ offset: true }).optional(),
    status: z.nativeEnum(LoanStatus).optional(),
    dueDate: z.string().datetime({ offset: true }).optional(),
});
export const createReservationSchema = z.object({
    userId: z.string().uuid('User ID must be a valid UUID'),
    bookId: z.string().uuid('Book ID must be a valid UUID'),
});
export const updateReservationSchema = z.object({
    status: z.nativeEnum(ReservationStatus),
});
//# sourceMappingURL=schemas.js.map