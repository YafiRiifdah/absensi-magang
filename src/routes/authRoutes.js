import { Router } from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js'; // Perhatikan ekstensi .js
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Perhatikan ekstensi .js

const router = Router();

router.post('/register', protect, authorizeRoles('admin'), registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

export default router;