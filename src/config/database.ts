import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
export const prisma = new PrismaClient();

// Connect to database on startup
export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Disconnect from database on shutdown
export const disconnectDB = async () => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};
