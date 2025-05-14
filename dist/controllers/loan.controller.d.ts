import { Request, Response, NextFunction } from 'express';
export declare const getLoans: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getLoan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createLoan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateLoan: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getMyLoans: (req: Request, res: Response, next: NextFunction) => Promise<void>;
