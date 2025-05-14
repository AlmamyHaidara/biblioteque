import express from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  changePassword,
  getMe,
} from '../controllers/user.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router() as express.Router;

// Protect all routes after this middleware
router.use(protect);

// User routes
router.get('/me', getMe);
router.patch('/change-password', changePassword);

// Admin only routes
router.use(restrictTo(Role.ADMIN));
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
