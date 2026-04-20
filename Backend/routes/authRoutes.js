import { Router } from 'express';
const router = Router();
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

// Validation rules for register
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidation = [
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Route: POST /api/auth/register
router.post('/register', registerValidation, register);

// Route: POST /api/auth/login
router.post('/login', loginValidation, login);

//Route: GET /api/auth/me
//Notice we put authMiddleware in the middle! It runs before getMe
router.get('/me', authMiddleware, getMe); // <-- NEW PROTECTED ROUTE


export default router;
