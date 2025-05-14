import { prisma } from '../config/database.js';
import jwt from 'jsonwebtoken';
export const generateAccessToken = (payload) => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
        throw new Error('ACCESS_TOKEN_SECRET is not defined');
    }
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' });
};
export const generateRefreshToken = async (payload) => {
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    const expiresInMs = expiresIn.endsWith('d') ? parseInt(expiresIn) * 24 * 60 * 60 * 1000 :
        expiresIn.endsWith('h') ? parseInt(expiresIn) * 60 * 60 * 1000 :
            expiresIn.endsWith('m') ? parseInt(expiresIn) * 60 * 1000 :
                parseInt(expiresIn) * 1000;
    const expiresAt = new Date(Date.now() + expiresInMs);
    if (!process.env.REFRESH_TOKEN_SECRET) {
        throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn });
    await prisma.refreshToken.create({
        data: {
            token: refreshToken,
            userId: payload.id,
            expiresAt,
        },
    });
    return refreshToken;
};
export const verifyRefreshToken = async (token) => {
    try {
        if (!process.env.REFRESH_TOKEN_SECRET) {
            throw new Error('REFRESH_TOKEN_SECRET is not defined');
        }
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!storedToken) {
            throw new Error('Invalid refresh token');
        }
        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            throw new Error('Refresh token expired');
        }
        return {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
    }
    catch (error) {
        throw error;
    }
};
export const deleteRefreshToken = async (token) => {
    await prisma.refreshToken.deleteMany({
        where: { token },
    });
};
export const deleteAllUserRefreshTokens = async (userId) => {
    await prisma.refreshToken.deleteMany({
        where: { userId },
    });
};
//# sourceMappingURL=token.utils.js.map