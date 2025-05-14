import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database';
import { AppError } from '../middlewares/errorHandler';
import { loginSchema, registerUserSchema } from '../models/schemas';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken, 
  deleteRefreshToken,
  deleteAllUserRefreshTokens
} from '../utils/token.utils';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = registerUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (existingUser) {
      return next(new AppError('User with this email already exists', 400));
    }
    
    // Hash password
    const hashedPassword =  await bcrypt.hashSync(validatedData.password as string, 12);
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate input
    const validatedData = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    
    if (!user) {
      return next(new AppError('Invalid email or password', 401));
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.password
    );
    
    if (!isPasswordValid) {
      return next(new AppError('Invalid email or password', 401));
    }
    
    // Generate tokens
    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = await generateRefreshToken(tokenPayload);
    
    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return next(new AppError('Refresh token not provided', 401));
    }
    
    // Verify refresh token
    const decoded = await verifyRefreshToken(refreshToken);
    
    // Generate new access token
    const accessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        accessToken,
      },
    });
  } catch (error) {
    // Clear the invalid refresh token cookie
    res.clearCookie('refreshToken');
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Delete refresh token from database
      await deleteRefreshToken(refreshToken);
    }
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('Not authenticated', 401));
    }
    
    // Delete all refresh tokens for the user
    await deleteAllUserRefreshTokens(req.user.id);
    
    // Clear refresh token cookie
    res.clearCookie('refreshToken');
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out from all devices successfully',
    });
  } catch (error) {
    next(error);
  }
};
