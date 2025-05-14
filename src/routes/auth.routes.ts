import express from 'express';
import { 
  register, 
  login, 
  refreshToken, 
  logout,
  logoutAll
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router() as express.Router;

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Protected routes
router.post('/logout-all', protect, logoutAll);

export default router;
