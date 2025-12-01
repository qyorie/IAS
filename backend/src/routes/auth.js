import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser, getCurrentUser } from '../controllers/authController.js';
import csurf from "csurf";
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// CSRF Protection
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  }
});

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/refresh', csrfProtection, refreshAccessToken);
router.get('/me', protect, getCurrentUser)
router.post('/logout', logoutUser);

export default router;