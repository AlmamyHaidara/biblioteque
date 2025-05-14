import { Request, Response, NextFunction } from 'express';
export declare const getBooks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createBook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateBook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteBook: (req: Request, res: Response, next: NextFunction) => Promise<void>;
