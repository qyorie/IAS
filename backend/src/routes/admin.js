import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { getAllUsers, deleteUser, getUserById, banUser, unbanUser } from '../controllers/adminController.js';

const router = express.Router();

// Only admin can access these
router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/users/:id', getUserById);
router.patch('/users/:id/ban', banUser);
router.patch('/users/:id/unban', unbanUser);

export default router;
