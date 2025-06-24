import { Router } from 'express';
import { getAllAttendances, verifyAttendance } from '../controllers/mentorController.js'; // Perhatikan ekstensi .js
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Perhatikan ekstensi .js

const router = Router();

router.get('/attendances', protect, authorizeRoles('mentor', 'admin'), getAllAttendances);
router.put('/attendances/:id/verify', protect, authorizeRoles('mentor', 'admin'), verifyAttendance);

export default router;