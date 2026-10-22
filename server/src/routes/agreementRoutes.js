import { Router } from 'express';
import { agreementController } from '../controllers/agreementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Protect all agreement routes with Bearer JWT Authentication
router.use(authenticateToken);

// User agreements list
router.get('/me', agreementController.getMyAgreements);

// Single agreement by ID
router.get('/:id', agreementController.getAgreementById);

// Update draft/rejected agreement (Project Owner)
router.put('/:id', agreementController.updateAgreement);

// Submit agreement for Creator review (Project Owner)
router.post('/:id/submit', agreementController.submitAgreement);

// Accept agreement (Creator)
router.post('/:id/accept', agreementController.acceptAgreement);

// Reject agreement with reason (Creator)
router.post('/:id/reject', agreementController.rejectAgreement);

export default router;
