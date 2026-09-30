import express from 'express';
import {
  getCreators,
  getCreatorById,
  getMyCreatorProfile,
  updateMyCreatorProfile,
} from '../controllers/creatorController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getCreators);
router.get('/me', protect, authorize('creator'), getMyCreatorProfile);
router.put('/me', protect, authorize('creator'), updateMyCreatorProfile);
router.get('/:id', getCreatorById);

export default router;
