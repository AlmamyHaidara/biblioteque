import express from 'express';
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from '../controllers/book.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router() as express.Router;

// Public routes
router.get('/', getBooks);
router.get('/:id', getBook);

// Protected routes
router.use(protect);

// Admin and Librarian routes
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.post('/', createBook);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);

export default router;
