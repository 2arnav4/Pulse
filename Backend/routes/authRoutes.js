import { Router } from 'express';
const router = Router();
import { register, login, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Route: POST /api/auth/register
router.post('/register', register);

// Route: POST /api/auth/login
router.post('/login', login);

//Route: GET /api/auth/me
//Notice we put authMiddleware in the middle! It runs before getMe
router.get('/me', authMiddleware, getMe); // <-- NEW PROTECTED ROUTE


export default router;
