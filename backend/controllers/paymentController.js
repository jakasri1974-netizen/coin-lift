import Payment from '../models/Payment.js';
import Collaboration from '../models/Collaboration.js';
import Agreement from '../models/Agreement.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification } from '../sockets/socketServer.js';
import { logAuditAction } from './adminController.js';
import {
  processPaymentAuthorization,
  processPaymentRelease,
  processPaymentRefund,
} from '../services/paymentService.js';

// @desc Create payment/escrow record for collaboration
// @route POST /api/payments
// @access Private
export const createPayment = async (req, res, next) => {
  try {
    const { collaborationId, agreementId, amount, currency, method, notes } = req.body;

    if (!collaborationId) {
      return res.status(400).json({ success: false, message: 'collaborationId is required' });
    }

    if (isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const collaboration = await Collaboration.findById(collaborationId);
      if (!collaboration) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collaboration.creatorId.toString() === userId ||
        collaboration.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const payerId = collaboration.projectId;
      const payeeId = collaboration.creatorId;

      const authResult = await processPaymentAuthorization({
        amount,
        currency,
        method,
        payerId,
        payeeId,
      });

      const payment = await Payment.create({
        collaborationId: collaboration._id,
        agreementId: agreementId || null,
        payerId,
        payeeId,
        amount: authResult.amount,
        currency: authResult.currency,
        method: authResult.method,
        status: authResult.status,
        transactionReference: authResult.transactionReference,
        paidAt: authResult.authorizedAt,
        notes: notes || 'Escrow deposit initialized',
      });

      // Send notification to creator
      await createAndEmitNotification({
        recipientId: payeeId,
        type: 'payment:escrow_deposited',
        title: 'Escrow Funds Deposited',
        message: `Escrow payment of ${authResult.amount} ${authResult.currency} deposited for your collaboration.`,
        relatedId: payment._id,
        relatedType: 'Collaboration',
        extraData: { paymentId: payment._id, amount: payment.amount, currency: payment.currency },
      });

      await logAuditAction({
        actorId: req.user._id,
        action: 'PAYMENT_DEPOSIT',
        entityType: 'Payment',
        entityId: payment._id,
        metadata: { amount: payment.amount, currency: payment.currency, collaborationId: payment.collaborationId },
        req,
      });

      return res.status(201).json({ success: true, message: 'Payment escrow initialized successfully', data: payment });
    } else {
      const collab = memoryStore.collaborations.find((c) => c._id.toString() === collaborationId.toString());
      if (!collab) return res.status(404).json({ success: false, message: 'Collaboration not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const authResult = await processPaymentAuthorization({
        amount,
        currency,
        method,
        payerId: collab.projectId,
        payeeId: collab.creatorId,
      });

      memoryStore.payments = memoryStore.payments || [];
      const payment = {
        _id: `pay_${Date.now()}`,
        collaborationId: collab._id,
        agreementId: agreementId || null,
        payerId: collab.projectId,
        payeeId: collab.creatorId,
        amount: authResult.amount,
        currency: authResult.currency,
        method: authResult.method,
        status: authResult.status,
        transactionReference: authResult.transactionReference,
        paidAt: authResult.authorizedAt.toISOString(),
        releasedAt: null,
        notes: notes || 'Escrow deposit initialized',
        createdAt: new Date().toISOString(),
      };
      memoryStore.payments.push(payment);

      await createAndEmitNotification({
        recipientId: collab.creatorId,
        type: 'payment:escrow_deposited',
        title: 'Escrow Funds Deposited',
        message: `Escrow payment of ${authResult.amount} ${authResult.currency} deposited for your collaboration.`,
        relatedId: payment._id,
        relatedType: 'Collaboration',
        extraData: { paymentId: payment._id, amount: payment.amount, currency: payment.currency },
      });

      return res.status(201).json({ success: true, message: 'Payment escrow initialized successfully', data: payment });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get user's payment records
// @route GET /api/payments
// @access Private
export const getMyPayments = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      let query = {};
      if (req.user.role === 'creator') query.payeeId = userId;
      else if (req.user.role === 'project') query.payerId = userId;
      else if (req.user.role !== 'admin') query = { $or: [{ payerId: userId }, { payeeId: userId }] };

      const payments = await Payment.find(query)
        .populate('collaborationId')
        .populate('payerId', 'name email profileImage')
        .populate('payeeId', 'name email profileImage')
        .sort('-createdAt');

      return res.json({ success: true, count: payments.length, data: payments });
    } else {
      memoryStore.payments = memoryStore.payments || [];
      const userPayments = memoryStore.payments.filter(
        (p) => req.user.role === 'admin' || p.payerId.toString() === userId || p.payeeId.toString() === userId
      );
      return res.json({ success: true, count: userPayments.length, data: userPayments });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get single payment by ID
// @route GET /api/payments/:id
// @access Private
export const getPaymentById = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const payment = await Payment.findById(paymentId)
        .populate('collaborationId')
        .populate('payerId', 'name email profileImage')
        .populate('payeeId', 'name email profileImage');

      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        payment.payerId._id.toString() === userId ||
        payment.payeeId._id.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this payment.' });
      }

      return res.json({ success: true, data: payment });
    } else {
      memoryStore.payments = memoryStore.payments || [];
      const payment = memoryStore.payments.find((p) => p._id.toString() === paymentId.toString());
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        payment.payerId.toString() === userId ||
        payment.payeeId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this payment.' });
      }

      return res.json({ success: true, data: payment });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Release escrow funds to payee
// @route POST /api/payments/:id/release
// @access Private (Payer / Admin)
export const releasePayment = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isPayerOrAdmin = req.user.role === 'admin' || payment.payerId.toString() === userId;
      if (!isPayerOrAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. Only the paying project or admin can release escrow funds.' });
      }

      const releaseResult = await processPaymentRelease({ paymentRecord: payment, releaserId: userId });

      payment.status = releaseResult.status;
      payment.releasedAt = releaseResult.releasedAt;
      payment.notes = `Escrow released. TxRef: ${releaseResult.releaseTxRef}`;
      await payment.save();

      await createAndEmitNotification({
        recipientId: payment.payeeId,
        type: 'payment:escrow_released',
        title: 'Payment Released!',
        message: `Escrow payment of ${payment.amount} ${payment.currency} has been released to your account.`,
        relatedId: payment._id,
        relatedType: 'Collaboration',
        extraData: { paymentId: payment._id, amount: payment.amount, currency: payment.currency },
      });

      await logAuditAction({
        actorId: req.user._id,
        action: 'PAYMENT_RELEASE',
        entityType: 'Payment',
        entityId: payment._id,
        metadata: { amount: payment.amount, payeeId: payment.payeeId },
        req,
      });

      return res.json({ success: true, message: 'Payment released successfully to creator', data: payment });
    } else {
      memoryStore.payments = memoryStore.payments || [];
      const payment = memoryStore.payments.find((p) => p._id.toString() === paymentId.toString());
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isPayerOrAdmin = req.user.role === 'admin' || payment.payerId.toString() === userId;
      if (!isPayerOrAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. Only the paying project or admin can release escrow funds.' });
      }

      const releaseResult = await processPaymentRelease({ paymentRecord: payment, releaserId: userId });

      payment.status = releaseResult.status;
      payment.releasedAt = releaseResult.releasedAt.toISOString();
      payment.notes = `Escrow released. TxRef: ${releaseResult.releaseTxRef}`;

      await createAndEmitNotification({
        recipientId: payment.payeeId,
        type: 'payment:escrow_released',
        title: 'Payment Released!',
        message: `Escrow payment of ${payment.amount} ${payment.currency} has been released to your account.`,
        relatedId: payment._id,
        relatedType: 'Collaboration',
        extraData: { paymentId: payment._id, amount: payment.amount, currency: payment.currency },
      });

      return res.json({ success: true, message: 'Payment released successfully to creator', data: payment });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Cancel/Refund payment escrow
// @route POST /api/payments/:id/cancel
// @access Private (Payer / Admin)
export const cancelPayment = async (req, res, next) => {
  try {
    const paymentId = req.params.id;
    const { reason } = req.body;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const payment = await Payment.findById(paymentId);
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isPayerOrAdmin = req.user.role === 'admin' || payment.payerId.toString() === userId;
      if (!isPayerOrAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. Only the paying project or admin can cancel/refund payment.' });
      }

      const refundResult = await processPaymentRefund({ paymentRecord: payment, cancelerId: userId, reason });

      payment.status = refundResult.status;
      payment.notes = `Payment cancelled/refunded. Reason: ${refundResult.reason}`;
      await payment.save();

      await logAuditAction({
        actorId: req.user._id,
        action: 'PAYMENT_CANCEL',
        entityType: 'Payment',
        entityId: payment._id,
        metadata: { amount: payment.amount, reason: refundResult.reason },
        req,
      });

      return res.json({ success: true, message: 'Payment cancelled and refunded successfully', data: payment });
    } else {
      memoryStore.payments = memoryStore.payments || [];
      const payment = memoryStore.payments.find((p) => p._id.toString() === paymentId.toString());
      if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

      const isPayerOrAdmin = req.user.role === 'admin' || payment.payerId.toString() === userId;
      if (!isPayerOrAdmin) {
        return res.status(403).json({ success: false, message: 'Forbidden. Only the paying project or admin can cancel/refund payment.' });
      }

      const refundResult = await processPaymentRefund({ paymentRecord: payment, cancelerId: userId, reason });

      payment.status = refundResult.status;
      payment.notes = `Payment cancelled/refunded. Reason: ${refundResult.reason}`;

      return res.json({ success: true, message: 'Payment cancelled and refunded successfully', data: payment });
    }
  } catch (error) {
    next(error);
  }
};
