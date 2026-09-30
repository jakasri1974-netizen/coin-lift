import Collaboration from '../models/Collaboration.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification } from '../sockets/socketServer.js';

export const getMyCollaborations = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      let query = {};
      if (req.user.role === 'creator') query.creatorId = req.user._id;
      else if (req.user.role === 'project') query.projectId = req.user._id;
      const collaborations = await Collaboration.find(query)
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage')
        .sort('-createdAt');
      return res.json({ success: true, count: collaborations.length, data: collaborations });
    } else {
      const collabs = memoryStore.collaborations.filter(c =>
        req.user.role === 'creator' ? c.creatorId === req.user._id : c.projectId === req.user._id
      );
      return res.json({ success: true, count: collabs.length, data: collabs });
    }
  } catch (error) {
    next(error);
  }
};

export const getCollaborationById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const collaboration = await Collaboration.findById(req.params.id)
        .populate('campaignId')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage');
      if (!collaboration) return res.status(404).json({ success: false, message: 'Collaboration not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        collaboration.creatorId._id.toString() === req.user._id.toString() ||
        collaboration.projectId._id.toString() === req.user._id.toString();

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      return res.json({ success: true, data: collaboration });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id === req.params.id) || memoryStore.collaborations[0];
      return res.json({ success: true, data: collab });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCollaboration = async (req, res, next) => {
  try {
    const { status, progress, performance } = req.body;

    if (progress !== undefined) {
      const numProgress = Number(progress);
      if (isNaN(numProgress) || numProgress < 0 || numProgress > 100) {
        return res.status(400).json({ success: false, message: 'Progress must be a number between 0 and 100' });
      }
    }

    if (status !== undefined) {
      const validStatuses = ['active', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid collaboration status' });
      }
    }

    if (getIsConnected()) {
      let collaboration = await Collaboration.findById(req.params.id);
      if (!collaboration) return res.status(404).json({ success: false, message: 'Collaboration not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        collaboration.creatorId.toString() === req.user._id.toString() ||
        collaboration.projectId.toString() === req.user._id.toString();

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      if (status !== undefined) collaboration.status = status;
      if (progress !== undefined) collaboration.progress = Number(progress);
      if (performance && typeof performance === 'object') {
        const currentPerf = collaboration.performance ? collaboration.performance.toObject() : {};
        collaboration.performance = { ...currentPerf, ...performance };
      }

      await collaboration.save();

      const updatedCollab = await Collaboration.findById(collaboration._id)
        .populate('campaignId', 'title category budget deliverables logoColor')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage');

      // Real-time Event & Notification for both participants
      const notificationPayload = {
        type: 'collaboration:updated',
        title: 'Collaboration Progress Updated',
        message: `Campaign progress updated to ${updatedCollab.progress}%`,
        relatedId: updatedCollab._id,
        relatedType: 'Collaboration',
        extraData: {
          collaborationId: updatedCollab._id,
          status: updatedCollab.status,
          progress: updatedCollab.progress,
          performanceMetrics: updatedCollab.performance,
          updatedAt: updatedCollab.updatedAt,
        },
      };

      await createAndEmitNotification({
        ...notificationPayload,
        recipientId: updatedCollab.creatorId._id,
      });

      await createAndEmitNotification({
        ...notificationPayload,
        recipientId: updatedCollab.projectId._id,
      });

      return res.json({ success: true, message: 'Collaboration updated successfully', data: updatedCollab });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id === req.params.id);
      if (!collab) return res.status(404).json({ success: false, message: 'Collaboration not found' });

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId === req.user._id ||
        collab.projectId === req.user._id;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      if (status !== undefined) collab.status = status;
      if (progress !== undefined) collab.progress = Number(progress);
      if (performance && typeof performance === 'object') {
        collab.performance = { ...(collab.performance || {}), ...performance };
      }

      const notificationPayload = {
        type: 'collaboration:updated',
        title: 'Collaboration Progress Updated',
        message: `Campaign progress updated to ${collab.progress}%`,
        relatedId: collab._id,
        relatedType: 'Collaboration',
        extraData: {
          collaborationId: collab._id,
          status: collab.status,
          progress: collab.progress,
          performanceMetrics: collab.performance,
          updatedAt: new Date().toISOString(),
        },
      };

      await createAndEmitNotification({ ...notificationPayload, recipientId: collab.creatorId });
      await createAndEmitNotification({ ...notificationPayload, recipientId: collab.projectId });

      return res.json({ success: true, message: 'Collaboration updated successfully', data: collab });
    }
  } catch (error) {
    next(error);
  }
};
