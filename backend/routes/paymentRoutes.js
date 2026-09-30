import express from 'express';
import {
  createPayment,
  getMyPayments,
  getPaymentById,
  releasePayment,
  cancelPayment,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createPayment);
router.get('/', getMyPayments);
router.get('/:id', getPaymentById);
router.post('/:id/release', releasePayment);
router.post('/:id/cancel', cancelPayment);

export default router;
