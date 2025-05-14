import express from 'express';
import {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,
  getMyReservations,
} from '../controllers/reservation.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = express.Router() as express.Router;

// Protect all routes
router.use(protect);

// User routes
router.get('/my-reservations', getMyReservations);
router.post('/cancel/:id', cancelReservation);

// Admin and Librarian routes
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.get('/', getReservations);
router.get('/:id', getReservation);
router.post('/', createReservation);
router.patch('/:id', updateReservation);

export default router;
