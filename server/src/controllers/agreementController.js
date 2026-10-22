import { agreementService } from '../services/agreementService.js';
import {
  createAgreementSchema,
  updateAgreementSchema,
  rejectAgreementSchema,
} from '../utils/validators.js';

export const agreementController = {
  /**
   * POST /api/collaborations/:id/agreements
   * Project Owner creates draft agreement for collaboration
   */
  async createAgreementForCollaboration(req, res, next) {
    try {
      const validated = createAgreementSchema.parse(req.body);
      const agreement = await agreementService.createAgreement(
        req.params.id,
        req.user.id,
        validated
      );
      res.status(201).json({
        success: true,
        message: 'Digital agreement created in DRAFT status',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/collaborations/:id/agreements
   * Fetch all agreements for a collaboration
   */
  async getAgreementsForCollaboration(req, res, next) {
    try {
      const agreements = await agreementService.getAgreementsByCollaboration(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.json({
        success: true,
        data: agreements,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/agreements/me
   * Fetch current user's agreements
   */
  async getMyAgreements(req, res, next) {
    try {
      const agreements = await agreementService.getMyAgreements(req.user.id, req.user.role);
      res.json({
        success: true,
        data: agreements,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/agreements/:id
   * Fetch single agreement details
   */
  async getAgreementById(req, res, next) {
    try {
      const agreement = await agreementService.getAgreementById(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.json({
        success: true,
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/agreements/:id
   * Update draft or rejected agreement
   */
  async updateAgreement(req, res, next) {
    try {
      const validated = updateAgreementSchema.parse(req.body);
      const agreement = await agreementService.updateAgreement(
        req.params.id,
        req.user.id,
        validated
      );
      res.json({
        success: true,
        message: 'Agreement updated successfully',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/agreements/:id/submit
   * Submit agreement for Creator acceptance
   */
  async submitAgreement(req, res, next) {
    try {
      const agreement = await agreementService.submitAgreement(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Agreement submitted to Creator for review',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/agreements/:id/accept
   * Creator accepts the digital agreement
   */
  async acceptAgreement(req, res, next) {
    try {
      const agreement = await agreementService.acceptAgreement(req.params.id, req.user.id);
      res.json({
        success: true,
        message: 'Digital agreement officially accepted and executed',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/agreements/:id/reject
   * Creator rejects the agreement with reason
   */
  async rejectAgreement(req, res, next) {
    try {
      const validated = rejectAgreementSchema.parse(req.body);
      const agreement = await agreementService.rejectAgreement(
        req.params.id,
        req.user.id,
        validated.rejectionReason
      );
      res.json({
        success: true,
        message: 'Agreement rejected. Project owner can review feedback and revise.',
        data: agreement,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/admin/agreements
   * Admin read-only overview
   */
  async getAllAdminAgreements(req, res, next) {
    try {
      const agreements = await agreementService.getAllAdminAgreements();
      res.json({
        success: true,
        data: agreements,
      });
    } catch (error) {
      next(error);
    }
  },
};
