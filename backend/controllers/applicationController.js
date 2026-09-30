import Application from '../models/Application.js';
import Campaign from '../models/Campaign.js';
import Collaboration from '../models/Collaboration.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification } from '../sockets/socketServer.js';
import { ensureConversationExists } from './chatController.js';
import { ensureAgreementExists } from './agreementController.js';

export const applyToCampaign = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    const { message } = req.body;

    if (req.user.role !== 'creator' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only creators can apply to campaigns' });
    }

    if (getIsConnected()) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      if (campaign.status !== 'active') return res.status(400).json({ success: false, message: 'Campaign is not active' });

      const existingApp = await Application.findOne({ campaignId, creatorId: req.user._id });
      if (existingApp) {
        return res.status(400).json({ success: false, message: 'You have already applied to this campaign' });
      }

      const application = await Application.create({
        campaignId,
        creatorId: req.user._id,
        projectId: campaign.projectId,
        message: message || 'Excited to collaborate!',
        status: 'pending',
      });

      // Real-time Notification for Project Owner
      await createAndEmitNotification({
        recipientId: campaign.projectId,
        type: 'application:new',
        title: 'New Campaign Application',
        message: `${req.user.name || 'A creator'} applied to your campaign "${campaign.title}"`,
        relatedId: application._id,
        relatedType: 'Application',
        extraData: {
          applicationId: application._id,
          campaignId: campaign._id,
          creatorId: req.user._id,
          creatorName: req.user.name,
          campaignTitle: campaign.title,
          message: message || 'Excited to collaborate!',
          createdAt: application.createdAt,
        },
      });

      return res.status(201).json({ success: true, message: 'Application submitted successfully', data: application });
    } else {
      const campaign = memoryStore.campaigns.find(c => (c._id || '').toString() === campaignId.toString());
      const existing = memoryStore.applications.find(a => a.campaignId === campaignId && a.creatorId === req.user._id);
      if (existing) {
        return res.status(400).json({ success: false, message: 'You have already applied to this campaign' });
      }

      const newApp = {
        _id: `app_${Date.now()}`,
        campaignId,
        creatorId: req.user._id,
        projectId: campaign?.projectId || 'usr_p1',
        message: message || 'Excited to collaborate!',
        status: 'pending',
        createdAt: new Date(),
      };
      memoryStore.applications.push(newApp);

      // Real-time Notification (Memory Store Fallback)
      await createAndEmitNotification({
        recipientId: newApp.projectId,
        type: 'application:new',
        title: 'New Campaign Application',
        message: `${req.user.name || 'A creator'} applied to your campaign "${campaign?.title || 'Campaign'}"`,
        relatedId: newApp._id,
        relatedType: 'Application',
        extraData: {
          applicationId: newApp._id,
          campaignId: newApp.campaignId,
          creatorId: req.user._id,
          creatorName: req.user.name,
          campaignTitle: campaign?.title || 'Campaign',
          message: message || 'Excited to collaborate!',
          createdAt: newApp.createdAt,
        },
      });

      return res.status(201).json({ success: true, message: 'Application submitted successfully', data: newApp });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      let query = {};
      if (req.user.role === 'creator') query.creatorId = req.user._id;
      else if (req.user.role === 'project') query.projectId = req.user._id;
      const applications = await Application.find(query)
        .populate('campaignId', 'title category budget status deliverables')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage')
        .sort('-createdAt');
      return res.json({ success: true, count: applications.length, data: applications });
    } else {
      let apps = memoryStore.applications.filter(a =>
        req.user.role === 'creator' ? a.creatorId === req.user._id : a.projectId === req.user._id
      );
      return res.json({ success: true, count: apps.length, data: apps });
    }
  } catch (error) {
    next(error);
  }
};

export const getCampaignApplications = async (req, res, next) => {
  try {
    const { campaignId } = req.params;
    if (getIsConnected()) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      const applications = await Application.find({ campaignId }).populate('creatorId', 'name email profileImage').sort('-createdAt');
      return res.json({ success: true, count: applications.length, data: applications });
    } else {
      const apps = memoryStore.applications.filter(a => a.campaignId === campaignId);
      return res.json({ success: true, count: apps.length, data: apps });
    }
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid application status' });
    }

    if (req.user.role !== 'project' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized. Only project or admin users can update application status.' });
    }

    if (getIsConnected()) {
      const application = await Application.findById(req.params.id);
      if (!application) return res.status(404).json({ success: false, message: 'Application not found' });

      if (req.user.role !== 'admin' && application.projectId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this project application.' });
      }

      application.status = status;
      await application.save();

      const campaign = await Campaign.findById(application.campaignId);
      const campaignTitle = campaign?.title || 'Web3 Campaign';

      let collaboration = null;
      if (status === 'accepted') {
        let existingCollab = await Collaboration.findOne({ applicationId: application._id });
        if (!existingCollab) {
          existingCollab = await Collaboration.create({
            applicationId: application._id,
            campaignId: application.campaignId,
            creatorId: application.creatorId,
            projectId: application.projectId,
            status: 'active',
            progress: 0,
            deliverables: campaign?.deliverables || ['1x Review Video'],
            performance: { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, reach: '0', engagement: '0%' },
          });
        }
        collaboration = await Collaboration.findById(existingCollab._id)
          .populate('campaignId', 'title category budget deliverables logoColor')
          .populate('creatorId', 'name email profileImage')
          .populate('projectId', 'name email profileImage');

        // Automatically create Conversation for real-time private chat
        await ensureConversationExists({
          collaborationId: collaboration._id,
          campaignId: application.campaignId,
          creatorId: application.creatorId,
          projectId: application.projectId,
        });

        // Automatically create initial Collaboration Agreement
        await ensureAgreementExists({
          collaborationId: collaboration._id,
          campaignId: application.campaignId,
          creatorId: application.creatorId,
          projectId: application.projectId,
          title: `${campaignTitle} Agreement`,
          budget: campaign?.budget,
          deliverables: campaign?.deliverables,
        });

        // Real-time Notification for Creator (Accepted)
        await createAndEmitNotification({
          recipientId: application.creatorId,
          type: 'application:accepted',
          title: 'Application Accepted!',
          message: `${req.user.name || 'Project'} accepted your application for "${campaignTitle}"`,
          relatedId: application._id,
          relatedType: 'Application',
          extraData: {
            applicationId: application._id,
            campaignId: application.campaignId,
            projectId: req.user._id,
            projectName: req.user.name,
            campaignTitle,
            collaborationId: collaboration._id,
          },
        });

        // Real-time Collaboration Created Event for both Creator and Project
        await createAndEmitNotification({
          recipientId: application.creatorId,
          type: 'collaboration:created',
          title: 'New Collaboration Started',
          message: `Collaboration started for campaign "${campaignTitle}"`,
          relatedId: collaboration._id,
          relatedType: 'Collaboration',
          extraData: {
            collaborationId: collaboration._id,
            campaignId: application.campaignId,
            creatorId: application.creatorId,
            projectId: application.projectId,
            status: 'active',
          },
        });

        await createAndEmitNotification({
          recipientId: application.projectId,
          type: 'collaboration:created',
          title: 'New Collaboration Started',
          message: `Collaboration started for campaign "${campaignTitle}"`,
          relatedId: collaboration._id,
          relatedType: 'Collaboration',
          extraData: {
            collaborationId: collaboration._id,
            campaignId: application.campaignId,
            creatorId: application.creatorId,
            projectId: application.projectId,
            status: 'active',
          },
        });
      } else if (status === 'rejected') {
        // Real-time Notification for Creator (Rejected)
        await createAndEmitNotification({
          recipientId: application.creatorId,
          type: 'application:rejected',
          title: 'Application Status Update',
          message: `Your application for "${campaignTitle}" was not accepted.`,
          relatedId: application._id,
          relatedType: 'Application',
          extraData: {
            applicationId: application._id,
            campaignId: application.campaignId,
            projectId: req.user._id,
            projectName: req.user.name,
            campaignTitle,
          },
        });
      }

      const updatedApplication = await Application.findById(application._id)
        .populate('campaignId', 'title category budget status deliverables')
        .populate('creatorId', 'name email profileImage')
        .populate('projectId', 'name email profileImage');

      return res.json({
        success: true,
        message: `Application ${status} successfully`,
        data: { application: updatedApplication, collaboration },
      });
    } else {
      const app = memoryStore.applications.find(a => a._id === req.params.id);
      if (!app) return res.status(404).json({ success: false, message: 'Application not found' });

      if (req.user.role !== 'admin' && app.projectId !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Forbidden. You do not own this project application.' });
      }

      app.status = status;
      const campaign = memoryStore.campaigns.find(c => c._id === app.campaignId);
      const campaignTitle = campaign?.title || 'Web3 Campaign';

      let collaboration = memoryStore.collaborations.find(c => c.applicationId === app._id);
      if (status === 'accepted') {
        if (!collaboration) {
          collaboration = {
            _id: `collab_${Date.now()}`,
            applicationId: app._id,
            campaignId: app.campaignId,
            creatorId: app.creatorId,
            projectId: app.projectId,
            status: 'active',
            progress: 0,
            performance: { views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, reach: '0', engagement: '0%' },
            createdAt: new Date(),
          };
          memoryStore.collaborations.push(collaboration);
        }

        // Automatically create Conversation for real-time private chat
        await ensureConversationExists({
          collaborationId: collaboration._id,
          campaignId: app.campaignId,
          creatorId: app.creatorId,
          projectId: app.projectId,
        });

        // Automatically create initial Collaboration Agreement
        await ensureAgreementExists({
          collaborationId: collaboration._id,
          campaignId: app.campaignId,
          creatorId: app.creatorId,
          projectId: app.projectId,
          title: `${campaignTitle} Agreement`,
          budget: campaign?.budget,
          deliverables: campaign?.deliverables,
        });

        await createAndEmitNotification({
          recipientId: app.creatorId,
          type: 'application:accepted',
          title: 'Application Accepted!',
          message: `${req.user.name || 'Project'} accepted your application for "${campaignTitle}"`,
          relatedId: app._id,
          relatedType: 'Application',
          extraData: {
            applicationId: app._id,
            campaignId: app.campaignId,
            projectId: req.user._id,
            projectName: req.user.name,
            campaignTitle,
            collaborationId: collaboration._id,
          },
        });

        await createAndEmitNotification({
          recipientId: app.creatorId,
          type: 'collaboration:created',
          title: 'New Collaboration Started',
          message: `Collaboration started for campaign "${campaignTitle}"`,
          relatedId: collaboration._id,
          relatedType: 'Collaboration',
          extraData: {
            collaborationId: collaboration._id,
            campaignId: app.campaignId,
            creatorId: app.creatorId,
            projectId: app.projectId,
            status: 'active',
          },
        });

        await createAndEmitNotification({
          recipientId: app.projectId,
          type: 'collaboration:created',
          title: 'New Collaboration Started',
          message: `Collaboration started for campaign "${campaignTitle}"`,
          relatedId: collaboration._id,
          relatedType: 'Collaboration',
          extraData: {
            collaborationId: collaboration._id,
            campaignId: app.campaignId,
            creatorId: app.creatorId,
            projectId: app.projectId,
            status: 'active',
          },
        });
      } else if (status === 'rejected') {
        await createAndEmitNotification({
          recipientId: app.creatorId,
          type: 'application:rejected',
          title: 'Application Status Update',
          message: `Your application for "${campaignTitle}" was not accepted.`,
          relatedId: app._id,
          relatedType: 'Application',
          extraData: {
            applicationId: app._id,
            campaignId: app.campaignId,
            projectId: req.user._id,
            projectName: req.user.name,
            campaignTitle,
          },
        });
      }

      return res.json({ success: true, message: `Application ${status} successfully`, data: { application: app, collaboration } });
    }
  } catch (error) {
    next(error);
  }
};
