import { Request, Response, NextFunction } from 'express';
export declare const getReservations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelReservation: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyReservations: (req: Request, res: Response, next: NextFunction) => Promise<void>;
