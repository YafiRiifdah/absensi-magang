// src/routes/userRoutes.js
import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile } from '../controllers/userController.js';

const router = Router();
router.put('/:id', protect, updateProfile);

export default router;