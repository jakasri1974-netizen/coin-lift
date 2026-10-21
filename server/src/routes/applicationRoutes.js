import { Router } from 'express';
import {
  createApplication,
  getMyApplications,
  withdrawApplication,
  updateApplicationStatus,
  getAllApplications,
  getApplicationById,
} from '../controllers/applicationController.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { createApplicationSchema, updateApplicationStatusSchema } from '../utils/validators.js';

const router = Router();

// Protected Creator Personal Routes
router.get('/me', authenticateToken, requireRole('CREATOR'), getMyApplications);
router.post(
  '/',
  authenticateToken,
  requireRole('CREATOR'),
  validate(createApplicationSchema),
  createApplication
);
router.post(
  '/:id/withdraw',
  authenticateToken,
  requireRole('CREATOR'),
  withdrawApplication
);

// Protected Project Owner Review Route
router.put(
  '/:id/status',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus
);

// Authenticated Read Routes
router.get('/', authenticateToken, getAllApplications);
router.get('/:id', authenticateToken, getApplicationById);

export default router;
