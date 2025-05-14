import express from 'express';
import { getLoans, getLoan, createLoan, updateLoan, getMyLoans, } from '../controllers/loan.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = express.Router();
router.use(protect);
router.get('/my-loans', getMyLoans);
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.get('/', getLoans);
router.get('/:id', getLoan);
router.post('/', createLoan);
router.patch('/:id', updateLoan);
export default router;
//# sourceMappingURL=loan.routes.js.map