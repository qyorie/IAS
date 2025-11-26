import express from 'express';
import { registerUser, loginUser, refreshAccessToken, logoutUser } from '../controllers/authController.js';
import csurf from "csurf";

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
router.post('/logout', logoutUser);

export default router;