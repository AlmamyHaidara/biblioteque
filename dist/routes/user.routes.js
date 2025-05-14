import express from 'express';
import { getUsers, getUser, updateUser, deleteUser, changePassword, getMe, } from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = express.Router();
router.use(protect);
router.get('/me', getMe);
router.patch('/change-password', changePassword);
router.use(restrictTo(Role.ADMIN));
router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
//# sourceMappingURL=user.routes.js.map