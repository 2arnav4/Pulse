const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

//Route: GET /api/auth/me
//Notice we put authMiddleware in the middle! It runs before getMe
router.get('/me', authMiddleware, authController.getMe); // <-- NEW PROTECTED ROUTE


module.exports = router;
