import express from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController.js';
import {
  applyToCampaign,
  getCampaignApplications,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCampaigns)
  .post(protect, authorize('project', 'admin'), createCampaign);

router.route('/:id')
  .get(getCampaignById)
  .put(protect, authorize('project', 'admin'), updateCampaign)
  .delete(protect, authorize('project', 'admin'), deleteCampaign);

// Sub-resource routes
router.post('/:campaignId/apply', protect, authorize('creator'), applyToCampaign);
router.get('/:campaignId/applications', protect, authorize('project', 'admin'), getCampaignApplications);

export default router;
