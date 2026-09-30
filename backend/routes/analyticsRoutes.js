import express from 'express';
import {
  getCampaignAnalytics,
  getCollaborationAnalytics,
  getCreatorAnalytics,
  getProjectAnalytics,
  updateCollaborationAnalytics,
  createAnalyticsSnapshot,
  getAnalyticsHistory,
  getAnalyticsOverview,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getAnalyticsOverview);
router.get('/campaigns/:campaignId', getCampaignAnalytics);
router.get('/collaborations/:collaborationId', getCollaborationAnalytics);
router.put('/collaborations/:collaborationId', updateCollaborationAnalytics);
router.post('/collaborations/:collaborationId/snapshot', createAnalyticsSnapshot);
router.get('/collaborations/:collaborationId/history', getAnalyticsHistory);
router.get('/creators/:creatorId', getCreatorAnalytics);
router.get('/projects/:projectId', getProjectAnalytics);

export default router;
