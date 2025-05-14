import express from 'express';
import {
  getLoans,
  getLoan,
  createLoan,
  updateLoan,
  getMyLoans,
} from '../controllers/loan.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router() as express.Router;

// Protect all routes
router.use(protect);

// User routes
router.get('/my-loans', getMyLoans);

// Admin and Librarian routes
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/', createLoan);
router.patch('/:id', updateLoan);

export default router;
