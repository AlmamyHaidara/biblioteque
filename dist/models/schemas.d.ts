import { z } from 'zod';
export declare const registerUserSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    role: z.ZodOptional<z.ZodNativeEnum<{
        ADMIN: "ADMIN";
        LIBRARIAN: "LIBRARIAN";
        USER: "USER";
    }>>;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "ADMIN" | "LIBRARIAN" | "USER" | undefined;
}, {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: "ADMIN" | "LIBRARIAN" | "USER" | undefined;
}>;
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    password: string;
}, {
    email: string;
    password: string;
}>;
export declare const updateUserSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodNativeEnum<{
        ADMIN: "ADMIN";
        LIBRARIAN: "LIBRARIAN";
        USER: "USER";
    }>>;
}, "strip", z.ZodTypeAny, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "ADMIN" | "LIBRARIAN" | "USER" | undefined;
}, {
    email?: string | undefined;
    firstName?: string | undefined;
    lastName?: string | undefined;
    role?: "ADMIN" | "LIBRARIAN" | "USER" | undefined;
}>;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const createBookSchema: z.ZodObject<{
    title: z.ZodString;
    author: z.ZodString;
    isbn: z.ZodString;
    publicationYear: z.ZodNumber;
    publisher: z.ZodString;
    description: z.ZodString;
    quantity: z.ZodNumber;
    categoryId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    title: string;
    author: string;
    isbn: string;
    publicationYear: number;
    publisher: string;
    description: string;
    quantity: number;
    categoryId: string;
}, {
    title: string;
    author: string;
    isbn: string;
    publicationYear: number;
    publisher: string;
    description: string;
    quantity: number;
    categoryId: string;
}>;
export declare const updateBookSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodOptional<z.ZodString>;
    isbn: z.ZodOptional<z.ZodString>;
    publicationYear: z.ZodOptional<z.ZodNumber>;
    publisher: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    quantity: z.ZodOptional<z.ZodNumber>;
    categoryId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    author?: string | undefined;
    isbn?: string | undefined;
    publicationYear?: number | undefined;
    publisher?: string | undefined;
    description?: string | undefined;
    quantity?: number | undefined;
    categoryId?: string | undefined;
}, {
    title?: string | undefined;
    author?: string | undefined;
    isbn?: string | undefined;
    publicationYear?: number | undefined;
    publisher?: string | undefined;
    description?: string | undefined;
    quantity?: number | undefined;
    categoryId?: string | undefined;
}>;
export declare const createCategorySchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description?: string | undefined;
}, {
    name: string;
    description?: string | undefined;
}>;
export declare const updateCategorySchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    description?: string | undefined;
    name?: string | undefined;
}, {
    description?: string | undefined;
    name?: string | undefined;
}>;
export declare const createBookLoanSchema: z.ZodObject<{
    userId: z.ZodString;
    bookId: z.ZodString;
    dueDate: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    bookId: string;
    dueDate: string;
}, {
    userId: string;
    bookId: string;
    dueDate: string;
}>;
export declare const updateBookLoanSchema: z.ZodObject<{
    returnDate: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodNativeEnum<{
        ACTIVE: "ACTIVE";
        RETURNED: "RETURNED";
        OVERDUE: "OVERDUE";
    }>>;
    dueDate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "RETURNED" | "OVERDUE" | undefined;
    dueDate?: string | undefined;
    returnDate?: string | undefined;
}, {
    status?: "ACTIVE" | "RETURNED" | "OVERDUE" | undefined;
    dueDate?: string | undefined;
    returnDate?: string | undefined;
}>;
export declare const createReservationSchema: z.ZodObject<{
    userId: z.ZodString;
    bookId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    userId: string;
    bookId: string;
}, {
    userId: string;
    bookId: string;
}>;
export declare const updateReservationSchema: z.ZodObject<{
    status: z.ZodNativeEnum<{
        PENDING: "PENDING";
        FULFILLED: "FULFILLED";
        CANCELLED: "CANCELLED";
    }>;
}, "strip", z.ZodTypeAny, {
    status: "PENDING" | "FULFILLED" | "CANCELLED";
}, {
    status: "PENDING" | "FULFILLED" | "CANCELLED";
}>;
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
