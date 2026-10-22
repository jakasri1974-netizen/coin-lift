import { Router } from 'express';
import { collaborationController } from '../controllers/collaborationController.js';
import { authenticateToken } from '../middleware/auth.js';

import { agreementController } from '../controllers/agreementController.js';

const router = Router();

// Protect all collaboration & chat routes with JWT authentication
router.use(authenticateToken);

router.get('/me', collaborationController.getMyCollaborations);
router.get('/:id', collaborationController.getCollaborationById);
router.put('/:id/status', collaborationController.updateCollaborationStatus);
router.get('/:id/messages', collaborationController.getCollaborationMessages);
router.post('/:id/messages', collaborationController.sendMessage);

// Phase 10: Collaboration Digital Agreement endpoints
router.get('/:id/agreements', agreementController.getAgreementsForCollaboration);
router.post('/:id/agreements', agreementController.createAgreementForCollaboration);

export default router;
