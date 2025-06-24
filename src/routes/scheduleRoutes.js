// src/routes/scheduleRoutes.js
import { Router } from 'express';
import { getSchedule } from '../controllers/scheduleController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// Endpoint untuk melihat jadwal
// Bisa diakses oleh mahasiswa dan admin
router.get('/current', protect, authorizeRoles('mahasiswa', 'admin', 'mentor'), getSchedule);

export default router;