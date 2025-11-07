import express from 'express';
import { addComment, getComments } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: View comments for a post
router.get('/:postId', getComments);

// Protected: Add a comment to a post
router.post('/:postId', protect, addComment);

export default router;