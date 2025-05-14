import express from 'express';
import { getBooks, getBook, createBook, updateBook, deleteBook, } from '../controllers/book.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { Role } from '@prisma/client';
const router = express.Router();
router.get('/', getBooks);
router.get('/:id', getBook);
router.use(protect);
router.use(restrictTo(Role.ADMIN, Role.LIBRARIAN));
router.post('/', createBook);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);
export default router;
//# sourceMappingURL=book.routes.js.map