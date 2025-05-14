import { prisma } from '../config/database';
import jwt from 'jsonwebtoken';

// Define Role enum directly to avoid import issues
type Role = 'ADMIN' | 'LIBRARIAN' | 'USER';

interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }
  // Use type assertion to fix TypeScript errors
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' } as jwt.SignOptions
  );
};

export const generateRefreshToken = async (payload: TokenPayload): Promise<string> => {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
  
  // Calculate expiry date
  const expiresInMs = 
    expiresIn.endsWith('d') ? parseInt(expiresIn) * 24 * 60 * 60 * 1000 :
    expiresIn.endsWith('h') ? parseInt(expiresIn) * 60 * 60 * 1000 :
    expiresIn.endsWith('m') ? parseInt(expiresIn) * 60 * 1000 :
    parseInt(expiresIn) * 1000;
  
  const expiresAt = new Date(Date.now() + expiresInMs);
  
  // Generate the token
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  // Use type assertion to fix TypeScript errors
  const refreshToken = jwt.sign(
    payload,
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn } as jwt.SignOptions
  );
  
  // Store the token in the database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: payload.id,
      expiresAt,
    },
  });
  
  return refreshToken;
};

export const verifyRefreshToken = async (token: string): Promise<TokenPayload> => {
  try {
    // Verify the token signature
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined');
    }
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET as string
    ) as TokenPayload;
    
    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
    
    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }
    
    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Delete expired token
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error('Refresh token expired');
    }
    
    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    throw error;
  }
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
};

export const deleteAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
