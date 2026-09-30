import express from 'express';
import {
  getProjects,
  getProjectById,
  getMyProjectProfile,
  updateMyProjectProfile,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/me', protect, authorize('project'), getMyProjectProfile);
router.put('/me', protect, authorize('project'), updateMyProjectProfile);
router.get('/:id', getProjectById);

export default router;
