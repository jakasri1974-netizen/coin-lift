import { collaborationService } from '../services/collaborationService.js';
import { sendMessageSchema, updateCollaborationStatusSchema } from '../utils/validators.js';

export const collaborationController = {
  async getMyCollaborations(req, res, next) {
    try {
      const collaborations = await collaborationService.getMyCollaborations(req.user.id, req.user.role);
      res.json({
        success: true,
        data: collaborations,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCollaborationById(req, res, next) {
    try {
      const collaboration = await collaborationService.getCollaborationById(req.params.id, req.user.id, req.user.role);
      res.json({
        success: true,
        data: collaboration,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCollaborationStatus(req, res, next) {
    try {
      const validated = updateCollaborationStatusSchema.parse(req.body);
      const collaboration = await collaborationService.updateCollaborationStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        validated.status
      );
      res.json({
        success: true,
        data: collaboration,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCollaborationMessages(req, res, next) {
    try {
      const messages = await collaborationService.getCollaborationMessages(req.params.id, req.user.id, req.user.role);
      res.json({
        success: true,
        data: messages,
      });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req, res, next) {
    try {
      const validated = sendMessageSchema.parse(req.body);
      const message = await collaborationService.sendMessage(
        req.params.id,
        req.user.id,
        req.user.role,
        validated.content
      );
      res.status(201).json({
        success: true,
        data: message,
      });
    } catch (error) {
      next(error);
    }
  },
};
