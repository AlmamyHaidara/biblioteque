import { PrismaClient } from '@prisma/client';
export const prisma = new PrismaClient();
export const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};
export const disconnectDB = async () => {
    await prisma.$disconnect();
    console.log('Database disconnected');
};
//# sourceMappingURL=database.js.map