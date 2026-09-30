import express from 'express';
import {
  getMyCollaborations,
  getCollaborationById,
  updateCollaboration,
} from '../controllers/collaborationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyCollaborations);
router.get('/:id', protect, getCollaborationById);
router.put('/:id', protect, updateCollaboration);

export default router;
