import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  resetUserPassword,
  getAllAttendanceRecords,
} from '../controllers/adminController.js'; // Perhatikan ekstensi .js
import { registerUser } from '../controllers/authController.js'; // Perhatikan ekstensi .js
import { protect, authorizeRoles } from '../middleware/authMiddleware.js'; // Perhatikan ekstensi .js

const router = Router();

router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.post('/users', protect, authorizeRoles('admin'), registerUser);
router.put('/users/:id/role', protect, authorizeRoles('admin'), updateUserRole);
router.put('/users/:id/reset-password', protect, authorizeRoles('admin'), resetUserPassword);
router.get('/attendance-records', protect, authorizeRoles('admin'), getAllAttendanceRecords);

export default router;