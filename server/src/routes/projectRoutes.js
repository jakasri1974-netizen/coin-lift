import { Router } from 'express';
import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  submitMyProfile,
  createProjectProfile,
  getAllProjectProfiles,
  getProjectProfileById,
} from '../controllers/projectController.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken, optionalAuthToken, requireRole } from '../middleware/auth.js';
import { createProjectProfileSchema, updateProjectProfileSchema } from '../utils/validators.js';

const router = Router();

// Protected Project Owner Personal Routes (/api/projects/me)
router.get('/me', authenticateToken, requireRole('PROJECT_OWNER'), getMyProfile);
router.post('/me', authenticateToken, requireRole('PROJECT_OWNER'), validate(createProjectProfileSchema), createMyProfile);
router.put('/me', authenticateToken, requireRole('PROJECT_OWNER'), validate(updateProjectProfileSchema), updateMyProfile);
router.post('/me/submit', authenticateToken, requireRole('PROJECT_OWNER'), submitMyProfile);

// Public Read Routes (/api/projects)
router.get('/', getAllProjectProfiles);
router.get('/:id', optionalAuthToken, getProjectProfileById);

// Legacy POST /api/projects endpoint for backward compatibility
router.post(
  '/',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  validate(createProjectProfileSchema),
  createProjectProfile
);

export default router;
