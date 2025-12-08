import express from 'express';
import { addComment, deleteComment, getComments, updateComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: View comments for a post
router.get('/:postId', getComments);

// Protected: Add a comment to a post
router.post('/:postId', protect, addComment);
router.put('/:commentId', protect, updateComment);
router.delete('/:commentId', protect, deleteComment);

export default router;