import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import csurf from "csurf";
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import adminRoutes from './routes/admin.js';
import commentRoutes from './routes/comment.js';

dotenv.config();

const app = express();

// 1. Helmet - Sets secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));

// 2. CORS - Must be before other middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// 3. Body parser with size limits (prevents large payload attacks)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Cookie parser
app.use(cookieParser());

// 5. XSS Clean - Sanitizes user input in body, query, params
app.use(xss());

// 6. Mongo Sanitize - Prevents NoSQL injection attacks
app.use(mongoSanitize());

// 7. Rate limiting - Prevents brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per windowMs per IP
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes (prevent brute force login)
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 5, // Max 5 requests per windowMs
  message: 'Too many login attempts, please try again after 1 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// ===== CSRF PROTECTION =====

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  }
});

// Endpoint where frontend fetches CSRF token (no CSRF needed for GET)
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ===== ROUTES =====

// Auth routes with stricter rate limiting (no CSRF for login/register)
app.use('/api/auth', authLimiter, authRoutes);

// Apply CSRF protection to all routes below (POST, PUT, DELETE)
app.use(csrfProtection);

app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);

// ===== ERROR HANDLERS =====

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      error: 'Invalid CSRF token'
    });
  }
  next(err);
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Server error' 
      : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// ===== START SERVER =====

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`✓ Server running on port ${process.env.PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✓ Security: Helmet, XSS-Clean, Rate Limiting, CSRF enabled`);
  });
}).catch((error) => {
  console.error('Failed to connect to database:', error);
  process.exit(1);
});