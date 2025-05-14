import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    let statusCode = 500;
    let message = 'Something went wrong';
    let errors = undefined;
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation error';
        errors = err.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        }));
    }
    else if (err instanceof PrismaClientKnownRequestError) {
        statusCode = 400;
        switch (err.code) {
            case 'P2002':
                message = `Duplicate field value: ${err.meta?.target}`;
                break;
            case 'P2025':
                message = 'Record not found';
                break;
            default:
                message = 'Database error';
        }
    }
    else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }
    res.status(statusCode).json({
        status: 'error',
        message,
        errors,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
//# sourceMappingURL=errorHandler.js.map