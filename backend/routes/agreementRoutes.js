import express from 'express';
import {
  createAgreement,
  getAgreements,
  getAgreementById,
  updateAgreement,
  acceptAgreement,
  rejectAgreement,
  cancelAgreement,
} from '../controllers/agreementController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createAgreement);
router.get('/', getAgreements);
router.get('/:id', getAgreementById);
router.put('/:id', updateAgreement);
router.put('/:id/accept', acceptAgreement);
router.put('/:id/reject', rejectAgreement);
router.put('/:id/cancel', cancelAgreement);

export default router;
