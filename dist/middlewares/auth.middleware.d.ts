import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: Role;
            };
        }
    }
}
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const restrictTo: (...roles: Role[]) => (req: Request, res: Response, next: NextFunction) => void;
