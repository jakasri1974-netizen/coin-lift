import express from 'express';
import { getCreatorDashboard, getProjectDashboard } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/creator', protect, authorize('creator', 'admin'), getCreatorDashboard);
router.get('/project', protect, authorize('project', 'admin'), getProjectDashboard);

export default router;
