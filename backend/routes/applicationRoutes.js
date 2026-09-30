import express from 'express';
import {
  getMyApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.put('/:id/status', protect, updateApplicationStatus);

export default router;
