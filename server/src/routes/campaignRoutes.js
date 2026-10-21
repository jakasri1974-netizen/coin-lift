import { Router } from 'express';
import {
  createCampaign,
  getMyCampaigns,
  updateCampaign,
  submitCampaign,
  getCampaignApplications,
  getAllCampaigns,
  getCampaignById,
} from '../controllers/campaignController.js';
import { validate } from '../middleware/validate.js';
import { authenticateToken, optionalAuthToken, requireRole } from '../middleware/auth.js';
import { createCampaignSchema, updateCampaignSchema } from '../utils/validators.js';

const router = Router();

// Protected Project Owner Personal Campaign Routes
router.get('/me', authenticateToken, requireRole('PROJECT_OWNER'), getMyCampaigns);
router.post(
  '/',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  validate(createCampaignSchema),
  createCampaign
);
router.put(
  '/:id',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  validate(updateCampaignSchema),
  updateCampaign
);
router.post(
  '/:id/submit',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  submitCampaign
);
router.get(
  '/:id/applications',
  authenticateToken,
  requireRole('PROJECT_OWNER'),
  getCampaignApplications
);

// Public Read Routes
router.get('/', optionalAuthToken, getAllCampaigns);
router.get('/:id', optionalAuthToken, getCampaignById);

export default router;
