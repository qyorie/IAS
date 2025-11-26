import express from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  likePost
} from '../controllers/postController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getPosts);
router.get('/:id', getPost);

// Protected routes
router.post('/create', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);

// Like / Unlike post
router.post('/:id/like', protect, likePost);

export default router;
