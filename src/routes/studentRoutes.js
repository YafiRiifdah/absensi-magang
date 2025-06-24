import { Router } from 'express';
import { checkIn, checkOut, getMyAttendance } from '../controllers/studentController.js'; // Perhatikan ekstensi .js
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Perhatikan ekstensi .js

const router = Router();

router.post('/checkin', protect, authorizeRoles('mahasiswa'), checkIn);
router.post('/checkout', protect, authorizeRoles('mahasiswa'), checkOut);
router.get('/attendance/me', protect, authorizeRoles('mahasiswa'), getMyAttendance);

export default router;