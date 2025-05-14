import { z } from 'zod';
import { Role, LoanStatus, ReservationStatus } from '@prisma/client';

// User schemas
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

// Book schemas
export const createBookSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().min(10, 'ISBN must be at least 10 characters'),
  publicationYear: z.number().int().min(1000).max(new Date().getFullYear()),
  publisher: z.string().min(1, 'Publisher is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().min(0, 'Quantity must be a positive number'),
  categoryId: z.string().uuid('Category ID must be a valid UUID'),
  coverImage: z.string().optional(),
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
  coverImage: z.string().optional(),
});

// Category schemas
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
});

// Book loan schemas
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

// Reservation schemas
export const createReservationSchema = z.object({
  userId: z.string().uuid('User ID must be a valid UUID'),
  bookId: z.string().uuid('Book ID must be a valid UUID'),
});

export const updateReservationSchema = z.object({
  status: z.nativeEnum(ReservationStatus),
});

// Types derived from schemas
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateBookInput = z.infer<typeof createBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateBookLoanInput = z.infer<typeof createBookLoanSchema>;
export type UpdateBookLoanInput = z.infer<typeof updateBookLoanSchema>;
export type CreateReservationInput = z.infer<typeof createReservationSchema>;
export type UpdateReservationInput = z.infer<typeof updateReservationSchema>;
