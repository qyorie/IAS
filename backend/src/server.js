import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { connect } from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import postRoutes from './routes/post.js';
import adminRoutes from './routes/admin.js';

dotenv.config();
const app = express();

// Connect to database
connectDB();
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);

// Start the server
app.listen(process.env.PORT, () => {
  console.log('listening for requests on port', process.env.PORT)
});