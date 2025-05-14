import express from 'express';
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory, } from '../controllers/category.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = express.Router();
router.get('/', getCategories);
router.get('/:id', getCategory);
router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.post('/', createCategory);
router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);
export default router;
//# sourceMappingURL=category.routes.js.map