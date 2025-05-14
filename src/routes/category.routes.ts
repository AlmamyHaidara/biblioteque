import express from 'express';
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router() as express.Router;

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes
router.use(protect);

// Admin and Librarian routes
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
