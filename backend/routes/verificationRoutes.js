import express from 'express';
import {
  submitVerification,
  getMyVerification,
  getAdminVerifications,
  approveVerification,
  rejectVerification,
} from '../controllers/verificationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// User verification endpoints
router.post('/', protect, submitVerification);
router.get('/me', protect, getMyVerification);

// Admin verification endpoints
router.get('/admin/list', protect, authorize('admin'), getAdminVerifications);
router.put('/admin/:id/approve', protect, authorize('admin'), approveVerification);
router.put('/admin/:id/reject', protect, authorize('admin'), rejectVerification);

export default router;
