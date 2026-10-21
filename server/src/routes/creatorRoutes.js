import { Router } from 'express';
import {
  getMyProfile,
  createMyProfile,
  updateMyProfile,
  submitMyProfile,
  getAllCreatorProfiles,
  getCreatorProfileById,
} from '../controllers/creatorController.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { createCreatorProfileSchema, updateCreatorProfileSchema } from '../utils/validators.js';

const router = Router();

// Protected Creator Personal Routes (/api/creators/me)
router.get('/me', authenticateToken, requireRole('CREATOR'), getMyProfile);
router.post('/me', authenticateToken, requireRole('CREATOR'), validate(createCreatorProfileSchema), createMyProfile);
router.put('/me', authenticateToken, requireRole('CREATOR'), validate(updateCreatorProfileSchema), updateMyProfile);
router.post('/me/submit', authenticateToken, requireRole('CREATOR'), submitMyProfile);

// Public Read Routes (/api/creators)
router.get('/', getAllCreatorProfiles);
router.get('/:id', getCreatorProfileById);

// Legacy POST /api/creators endpoint for backward compatibility
router.post('/', authenticateToken, requireRole('CREATOR'), validate(createCreatorProfileSchema), createMyProfile);

export default router;
