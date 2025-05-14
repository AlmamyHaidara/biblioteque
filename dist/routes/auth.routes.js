import express from 'express';
import { register, login, refreshToken, logout, logoutAll } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
export default router;
//# sourceMappingURL=auth.routes.js.map