import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { prisma } from '../config/database.js';
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        let token;
        if (authHeader && authHeader.startsWith('Bearer')) {
            token = authHeader.split(' ')[1];
        }
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            return next(new AppError('Not authenticated. Please log in', 401));
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true }
        });
        if (!user) {
            return next(new AppError('User no longer exists', 401));
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return next(new AppError('Token expired', 401));
        }
        return next(new AppError('Not authenticated', 401));
    }
};
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map