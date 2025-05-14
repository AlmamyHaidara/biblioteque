import express from 'express';
import { getReservations, getReservation, createReservation, updateReservation, cancelReservation, getMyReservations, } from '../controllers/reservation.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = express.Router();
router.use(protect);
router.get('/my-reservations', getMyReservations);
router.post('/cancel/:id', cancelReservation);
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.get('/', getReservations);
router.get('/:id', getReservation);
router.post('/', createReservation);
router.patch('/:id', updateReservation);
export default router;
//# sourceMappingURL=reservation.routes.js.map