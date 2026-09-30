import CampaignAnalytics from '../models/CampaignAnalytics.js';
import AnalyticsSnapshot from '../models/AnalyticsSnapshot.js';
import Collaboration from '../models/Collaboration.js';
import Campaign from '../models/Campaign.js';
import Agreement from '../models/Agreement.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { createAndEmitNotification, getIO } from '../sockets/socketServer.js';

// Calculation Helpers
export const calculateMetrics = ({
  impressions = 0,
  reach = 0,
  views = 0,
  likes = 0,
  comments = 0,
  shares = 0,
  clicks = 0,
  conversions = 0,
  deliverablesTotal = 1,
  deliverablesCompleted = 0,
  budget = 0,
}) => {
  const imp = Math.max(0, Number(impressions) || 0);
  const rch = Math.max(0, Number(reach) || 0);
  const vws = Math.max(0, Number(views) || 0);
  const lks = Math.max(0, Number(likes) || 0);
  const cmts = Math.max(0, Number(comments) || 0);
  const shrs = Math.max(0, Number(shares) || 0);
  const clks = Math.max(0, Number(clicks) || 0);
  const convs = Math.max(0, Number(conversions) || 0);
  const delivTot = Math.max(1, Number(deliverablesTotal) || 1);
  const delivComp = Math.max(0, Number(deliverablesCompleted) || 0);
  const bgt = Math.max(0, Number(budget) || 0);

  const totalEngagement = lks + cmts + shrs;
  const rawEngRate = rch > 0 ? (totalEngagement / rch) * 100 : 0;
  const engagementRate = Math.min(100, Math.max(0, Number(rawEngRate.toFixed(2))));

  const rawProgress = (delivComp / delivTot) * 100;
  const progressPercentage = Math.min(100, Math.max(0, Number(rawProgress.toFixed(2))));

  const costPerClick = clks > 0 ? Number((bgt / clks).toFixed(2)) : null;
  const costPerEngagement = totalEngagement > 0 ? Number((bgt / totalEngagement).toFixed(2)) : null;
  const costPerThousandImpressions = imp > 0 ? Number(((bgt / imp) * 1000).toFixed(2)) : null;

  return {
    impressions: imp,
    reach: rch,
    views: vws,
    likes: lks,
    comments: cmts,
    shares: shrs,
    clicks: clks,
    conversions: convs,
    deliverablesTotal: delivTot,
    deliverablesCompleted: delivComp,
    progressPercentage,
    engagementRate,
    budget: bgt,
    costPerClick,
    costPerEngagement,
    costPerThousandImpressions,
  };
};

// Helper: Ensure analytics record exists
export const ensureAnalyticsExists = async ({ collaborationId, campaignId, creatorId, projectId, budget = 0 }) => {
  try {
    const colId = collaborationId.toString();
    const campId = campaignId.toString();
    const cId = creatorId.toString();
    const pId = projectId.toString();

    if (getIsConnected()) {
      let analytics = await CampaignAnalytics.findOne({ collaborationId: colId });
      if (!analytics) {
        // Try finding agreement for deliverable count
        const agreement = await Agreement.findOne({ collaborationId: colId });
        const deliverablesTotal = agreement?.deliverables?.length || 1;

        const metrics = calculateMetrics({ deliverablesTotal, budget });

        analytics = await CampaignAnalytics.create({
          collaborationId: colId,
          campaignId: campId,
          projectId: pId,
          creatorId: cId,
          ...metrics,
        });
      }
      return analytics;
    } else {
      let analytics = memoryStore.analytics.find(a => a.collaborationId.toString() === colId);
      if (!analytics) {
        const agreement = memoryStore.agreements.find(a => a.collaborationId.toString() === colId);
        const deliverablesTotal = agreement?.deliverables?.length || 1;

        const metrics = calculateMetrics({ deliverablesTotal, budget });

        analytics = {
          _id: `anly_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          collaborationId: colId,
          campaignId: campId,
          projectId: pId,
          creatorId: cId,
          postsPublished: 0,
          videosPublished: 0,
          storiesPublished: 0,
          livestreamsCompleted: 0,
          ...metrics,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryStore.analytics.push(analytics);
      }
      return analytics;
    }
  } catch (err) {
    console.error('[Analytics Error] Failed to ensure analytics exists:', err);
    return null;
  }
};

// @desc    Get Campaign Analytics
// @route   GET /api/analytics/campaigns/:campaignId
// @access  Private
export const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const isOwner = req.user.role === 'admin' || campaign.projectId.toString() === userId;
      if (!isOwner) {
        // Check if user is a creator participant in this campaign
        const isParticipant = await Collaboration.findOne({ campaignId, creatorId: userId });
        if (!isParticipant) {
          return res.status(403).json({ success: false, message: 'Forbidden. You do not have access to this campaign analytics.' });
        }
      }

      const analyticsList = await CampaignAnalytics.find({ campaignId })
        .populate('creatorId', 'name email profileImage')
        .populate('collaborationId', 'status progress');

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);

      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const parsedBudget = typeof campaign.budget === 'number'
        ? campaign.budget
        : parseFloat(String(campaign.budget).replace(/[^0-9.]/g, '')) || 0;

      const summaryMetrics = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
        budget: parsedBudget,
      });

      return res.status(200).json({
        success: true,
        data: {
          campaign: {
            _id: campaign._id,
            title: campaign.title,
            status: campaign.status,
            budget: campaign.budget,
          },
          summary: summaryMetrics,
          collaborationsCount: analyticsList.length,
          breakdown: analyticsList,
        },
      });
    } else {
      const camp = memoryStore.campaigns.find(c => c._id.toString() === campaignId.toString());
      if (!camp) {
        return res.status(404).json({ success: false, message: 'Campaign not found' });
      }

      const isOwner = req.user.role === 'admin' || camp.projectId.toString() === userId;
      if (!isOwner) {
        const isParticipant = memoryStore.collaborations.find(c => c.campaignId.toString() === campaignId.toString() && c.creatorId.toString() === userId);
        if (!isParticipant) {
          return res.status(403).json({ success: false, message: 'Forbidden. You do not have access to this campaign analytics.' });
        }
      }

      const analyticsList = memoryStore.analytics.filter(a => a.campaignId.toString() === campaignId.toString());

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);
      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const parsedBudget = typeof camp.budget === 'number'
        ? camp.budget
        : parseFloat(String(camp.budget || '0').replace(/[^0-9.]/g, '')) || 0;

      const summaryMetrics = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
        budget: parsedBudget,
      });

      return res.status(200).json({
        success: true,
        data: {
          campaign: {
            _id: camp._id,
            title: camp.title,
            status: camp.status,
            budget: camp.budget,
          },
          summary: summaryMetrics,
          collaborationsCount: analyticsList.length,
          breakdown: analyticsList,
        },
      });
    }
  } catch (err) {
    console.error('[Get Campaign Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving campaign analytics' });
  }
};

// @desc    Get Collaboration Analytics
// @route   GET /api/analytics/collaborations/:collaborationId
// @access  Private
export const getCollaborationAnalytics = async (req, res) => {
  try {
    const { collaborationId } = req.params;
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

      const analytics = await ensureAnalyticsExists({
        collaborationId: collaboration._id,
        campaignId: collaboration.campaignId,
        creatorId: collaboration.creatorId,
        projectId: collaboration.projectId,
      });

      return res.status(200).json({ success: true, data: analytics });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not a participant in this collaboration.' });
      }

      const analytics = await ensureAnalyticsExists({
        collaborationId: collab._id,
        campaignId: collab.campaignId,
        creatorId: collab.creatorId,
        projectId: collab.projectId,
      });

      return res.status(200).json({ success: true, data: analytics });
    }
  } catch (err) {
    console.error('[Get Collaboration Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving collaboration analytics' });
  }
};

// @desc    Get Creator Analytics
// @route   GET /api/analytics/creators/:creatorId
// @access  Private
export const getCreatorAnalytics = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const userId = req.user._id.toString();

    const isSelf = creatorId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (getIsConnected()) {
      if (!isSelf && !isAdmin) {
        // Allow project if they share an active collaboration
        const sharedCollab = await Collaboration.findOne({ creatorId, projectId: userId });
        if (!sharedCollab) {
          return res.status(403).json({ success: false, message: 'Forbidden. You can only view your own creator performance analytics.' });
        }
      }

      const analyticsList = await CampaignAnalytics.find({ creatorId })
        .populate('campaignId', 'title category')
        .populate('collaborationId', 'status');

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);
      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const summary = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
      });

      return res.status(200).json({
        success: true,
        data: {
          creatorId,
          activeCollaborationsCount: analyticsList.length,
          summary,
          collaborations: analyticsList,
        },
      });
    } else {
      if (!isSelf && !isAdmin) {
        const sharedCollab = memoryStore.collaborations.find(c => c.creatorId.toString() === creatorId.toString() && c.projectId.toString() === userId);
        if (!sharedCollab) {
          return res.status(403).json({ success: false, message: 'Forbidden. You can only view your own creator performance analytics.' });
        }
      }

      const analyticsList = memoryStore.analytics.filter(a => a.creatorId.toString() === creatorId.toString());

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);
      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const summary = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
      });

      return res.status(200).json({
        success: true,
        data: {
          creatorId,
          activeCollaborationsCount: analyticsList.length,
          summary,
          collaborations: analyticsList,
        },
      });
    }
  } catch (err) {
    console.error('[Get Creator Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving creator analytics' });
  }
};

// @desc    Get Project Analytics
// @route   GET /api/analytics/projects/:projectId
// @access  Private
export const getProjectAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id.toString();

    const isOwner = projectId.toString() === userId || req.user.role === 'admin';
    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Forbidden. You can only view your own project analytics.' });
    }

    if (getIsConnected()) {
      const analyticsList = await CampaignAnalytics.find({ projectId })
        .populate('campaignId', 'title status budget')
        .populate('creatorId', 'name profileImage');

      const campaigns = await Campaign.find({ projectId });

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);
      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const summary = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
      });

      return res.status(200).json({
        success: true,
        data: {
          projectId,
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
          totalCollaborations: analyticsList.length,
          summary,
          collaborations: analyticsList,
        },
      });
    } else {
      const analyticsList = memoryStore.analytics.filter(a => a.projectId.toString() === projectId.toString());
      const campaigns = memoryStore.campaigns.filter(c => c.projectId.toString() === projectId.toString());

      const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
      const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
      const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
      const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
      const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
      const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
      const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
      const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);
      const totalDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesTotal || 1), 0);
      const completedDeliverables = analyticsList.reduce((acc, a) => acc + (a.deliverablesCompleted || 0), 0);

      const summary = calculateMetrics({
        impressions: totalImpressions,
        reach: totalReach,
        views: totalViews,
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        clicks: totalClicks,
        conversions: totalConversions,
        deliverablesTotal: totalDeliverables || 1,
        deliverablesCompleted: completedDeliverables,
      });

      return res.status(200).json({
        success: true,
        data: {
          projectId,
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
          totalCollaborations: analyticsList.length,
          summary,
          collaborations: analyticsList,
        },
      });
    }
  } catch (err) {
    console.error('[Get Project Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving project analytics' });
  }
};

// @desc    Update Collaboration Analytics
// @route   PUT /api/analytics/collaborations/:collaborationId
// @access  Private
export const updateCollaborationAnalytics = async (req, res) => {
  try {
    const { collaborationId } = req.params;
    const userId = req.user._id.toString();

    // Validate non-negative numbers
    const fields = ['impressions', 'reach', 'views', 'likes', 'comments', 'shares', 'clicks', 'conversions', 'postsPublished', 'videosPublished', 'storiesPublished', 'livestreamsCompleted', 'deliverablesTotal', 'deliverablesCompleted', 'budget'];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        const val = Number(req.body[field]);
        if (isNaN(val) || val < 0) {
          return res.status(400).json({ success: false, message: `Field "${field}" must be a numeric value greater than or equal to 0.` });
        }
      }
    }

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
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to update analytics for this collaboration.' });
      }

      let analytics = await ensureAnalyticsExists({
        collaborationId: collaboration._id,
        campaignId: collaboration.campaignId,
        creatorId: collaboration.creatorId,
        projectId: collaboration.projectId,
      });

      const updatedRaw = {
        impressions: req.body.impressions !== undefined ? Number(req.body.impressions) : analytics.impressions,
        reach: req.body.reach !== undefined ? Number(req.body.reach) : analytics.reach,
        views: req.body.views !== undefined ? Number(req.body.views) : analytics.views,
        likes: req.body.likes !== undefined ? Number(req.body.likes) : analytics.likes,
        comments: req.body.comments !== undefined ? Number(req.body.comments) : analytics.comments,
        shares: req.body.shares !== undefined ? Number(req.body.shares) : analytics.shares,
        clicks: req.body.clicks !== undefined ? Number(req.body.clicks) : analytics.clicks,
        conversions: req.body.conversions !== undefined ? Number(req.body.conversions) : analytics.conversions,
        deliverablesTotal: req.body.deliverablesTotal !== undefined ? Number(req.body.deliverablesTotal) : analytics.deliverablesTotal,
        deliverablesCompleted: req.body.deliverablesCompleted !== undefined ? Number(req.body.deliverablesCompleted) : analytics.deliverablesCompleted,
        budget: req.body.budget !== undefined ? Number(req.body.budget) : analytics.budget,
      };

      const calculated = calculateMetrics(updatedRaw);

      analytics.impressions = calculated.impressions;
      analytics.reach = calculated.reach;
      analytics.views = calculated.views;
      analytics.likes = calculated.likes;
      analytics.comments = calculated.comments;
      analytics.shares = calculated.shares;
      analytics.clicks = calculated.clicks;
      analytics.conversions = calculated.conversions;
      analytics.deliverablesTotal = calculated.deliverablesTotal;
      analytics.deliverablesCompleted = calculated.deliverablesCompleted;
      analytics.progressPercentage = calculated.progressPercentage;
      analytics.engagementRate = calculated.engagementRate;
      analytics.budget = calculated.budget;
      analytics.costPerClick = calculated.costPerClick;
      analytics.costPerEngagement = calculated.costPerEngagement;
      analytics.costPerThousandImpressions = calculated.costPerThousandImpressions;
      analytics.lastUpdatedBy = req.user._id;

      if (req.body.postsPublished !== undefined) analytics.postsPublished = Number(req.body.postsPublished);
      if (req.body.videosPublished !== undefined) analytics.videosPublished = Number(req.body.videosPublished);
      if (req.body.storiesPublished !== undefined) analytics.storiesPublished = Number(req.body.storiesPublished);
      if (req.body.livestreamsCompleted !== undefined) analytics.livestreamsCompleted = Number(req.body.livestreamsCompleted);

      await analytics.save();

      // Emit Socket.IO and Notification
      const recipientId = collaboration.creatorId.toString() === userId
        ? collaboration.projectId.toString()
        : collaboration.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'analytics:updated',
        title: 'Campaign Performance Updated',
        message: `${req.user.name || 'Partner'} updated collaboration analytics metrics.`,
        relatedId: analytics._id,
        relatedType: 'CampaignAnalytics',
        extraData: { analyticsId: analytics._id, collaborationId: analytics.collaborationId },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${collaboration._id.toString()}`).emit('analytics:updated', analytics);
        io.to(`user:${recipientId}`).emit('analytics:updated', analytics);
        io.to(`user:${userId}`).emit('analytics:updated', analytics);
      }

      return res.status(200).json({ success: true, message: 'Analytics updated successfully', data: analytics });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to update analytics for this collaboration.' });
      }

      let analytics = await ensureAnalyticsExists({
        collaborationId: collab._id,
        campaignId: collab.campaignId,
        creatorId: collab.creatorId,
        projectId: collab.projectId,
      });

      const updatedRaw = {
        impressions: req.body.impressions !== undefined ? Number(req.body.impressions) : analytics.impressions,
        reach: req.body.reach !== undefined ? Number(req.body.reach) : analytics.reach,
        views: req.body.views !== undefined ? Number(req.body.views) : analytics.views,
        likes: req.body.likes !== undefined ? Number(req.body.likes) : analytics.likes,
        comments: req.body.comments !== undefined ? Number(req.body.comments) : analytics.comments,
        shares: req.body.shares !== undefined ? Number(req.body.shares) : analytics.shares,
        clicks: req.body.clicks !== undefined ? Number(req.body.clicks) : analytics.clicks,
        conversions: req.body.conversions !== undefined ? Number(req.body.conversions) : analytics.conversions,
        deliverablesTotal: req.body.deliverablesTotal !== undefined ? Number(req.body.deliverablesTotal) : analytics.deliverablesTotal,
        deliverablesCompleted: req.body.deliverablesCompleted !== undefined ? Number(req.body.deliverablesCompleted) : analytics.deliverablesCompleted,
        budget: req.body.budget !== undefined ? Number(req.body.budget) : analytics.budget,
      };

      const calculated = calculateMetrics(updatedRaw);

      Object.assign(analytics, calculated, {
        updatedAt: new Date().toISOString(),
        lastUpdatedBy: userId,
      });

      if (req.body.postsPublished !== undefined) analytics.postsPublished = Number(req.body.postsPublished);
      if (req.body.videosPublished !== undefined) analytics.videosPublished = Number(req.body.videosPublished);
      if (req.body.storiesPublished !== undefined) analytics.storiesPublished = Number(req.body.storiesPublished);
      if (req.body.livestreamsCompleted !== undefined) analytics.livestreamsCompleted = Number(req.body.livestreamsCompleted);

      const recipientId = collab.creatorId.toString() === userId
        ? collab.projectId.toString()
        : collab.creatorId.toString();

      await createAndEmitNotification({
        recipientId,
        type: 'analytics:updated',
        title: 'Campaign Performance Updated',
        message: `${req.user.name || 'Partner'} updated collaboration analytics metrics.`,
        relatedId: analytics._id,
        relatedType: 'CampaignAnalytics',
        extraData: { analyticsId: analytics._id, collaborationId: analytics.collaborationId },
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${collab._id.toString()}`).emit('analytics:updated', analytics);
        io.to(`user:${recipientId}`).emit('analytics:updated', analytics);
        io.to(`user:${userId}`).emit('analytics:updated', analytics);
      }

      return res.status(200).json({ success: true, message: 'Analytics updated successfully', data: analytics });
    }
  } catch (err) {
    console.error('[Update Analytics Error]', err);
    return res.status(500).json({ success: false, message: 'Server error updating analytics' });
  }
};

// @desc    Create Analytics Snapshot
// @route   POST /api/analytics/collaborations/:collaborationId/snapshot
// @access  Private
export const createAnalyticsSnapshot = async (req, res) => {
  try {
    const { collaborationId } = req.params;
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
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to create snapshots for this collaboration.' });
      }

      const analytics = await ensureAnalyticsExists({
        collaborationId: collaboration._id,
        campaignId: collaboration.campaignId,
        creatorId: collaboration.creatorId,
        projectId: collaboration.projectId,
      });

      const snapshot = await AnalyticsSnapshot.create({
        analyticsId: analytics._id,
        campaignId: analytics.campaignId,
        collaborationId: analytics.collaborationId,
        projectId: analytics.projectId,
        creatorId: analytics.creatorId,
        impressions: analytics.impressions,
        reach: analytics.reach,
        views: analytics.views,
        likes: analytics.likes,
        comments: analytics.comments,
        shares: analytics.shares,
        clicks: analytics.clicks,
        conversions: analytics.conversions,
        engagementRate: analytics.engagementRate,
        progressPercentage: analytics.progressPercentage,
        capturedAt: new Date(),
      });

      const io = getIO();
      if (io) {
        io.to(`conversation:${collaboration._id.toString()}`).emit('analytics:snapshot', snapshot);
      }

      return res.status(201).json({ success: true, message: 'Analytics snapshot captured', data: snapshot });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to create snapshots for this collaboration.' });
      }

      const analytics = await ensureAnalyticsExists({
        collaborationId: collab._id,
        campaignId: collab.campaignId,
        creatorId: collab.creatorId,
        projectId: collab.projectId,
      });

      const snapshot = {
        _id: `snap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        analyticsId: analytics._id,
        campaignId: analytics.campaignId,
        collaborationId: analytics.collaborationId,
        projectId: analytics.projectId,
        creatorId: analytics.creatorId,
        impressions: analytics.impressions,
        reach: analytics.reach,
        views: analytics.views,
        likes: analytics.likes,
        comments: analytics.comments,
        shares: analytics.shares,
        clicks: analytics.clicks,
        conversions: analytics.conversions,
        engagementRate: analytics.engagementRate,
        progressPercentage: analytics.progressPercentage,
        capturedAt: new Date().toISOString(),
      };

      memoryStore.analyticsSnapshots.push(snapshot);

      const io = getIO();
      if (io) {
        io.to(`conversation:${collab._id.toString()}`).emit('analytics:snapshot', snapshot);
      }

      return res.status(201).json({ success: true, message: 'Analytics snapshot captured', data: snapshot });
    }
  } catch (err) {
    console.error('[Create Analytics Snapshot Error]', err);
    return res.status(500).json({ success: false, message: 'Server error capturing snapshot' });
  }
};

// @desc    Get Analytics History (Snapshots)
// @route   GET /api/analytics/collaborations/:collaborationId/history
// @access  Private
export const getAnalyticsHistory = async (req, res) => {
  try {
    const { collaborationId } = req.params;
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
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to view analytics history for this collaboration.' });
      }

      const snapshots = await AnalyticsSnapshot.find({ collaborationId }).sort({ capturedAt: 1 });
      return res.status(200).json({ success: true, count: snapshots.length, data: snapshots });
    } else {
      const collab = memoryStore.collaborations.find(c => c._id.toString() === collaborationId.toString());
      if (!collab) {
        return res.status(404).json({ success: false, message: 'Collaboration not found' });
      }

      const isParticipant =
        req.user.role === 'admin' ||
        collab.creatorId.toString() === userId ||
        collab.projectId.toString() === userId;

      if (!isParticipant) {
        return res.status(403).json({ success: false, message: 'Forbidden. You are not authorized to view analytics history for this collaboration.' });
      }

      const snapshots = memoryStore.analyticsSnapshots
        .filter(s => s.collaborationId.toString() === collaborationId.toString())
        .sort((a, b) => new Date(a.capturedAt) - new Date(b.capturedAt));

      return res.status(200).json({ success: true, count: snapshots.length, data: snapshots });
    }
  } catch (err) {
    console.error('[Get Analytics History Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving analytics history' });
  }
};

// @desc    Get User Overview Analytics
// @route   GET /api/analytics/overview
// @access  Private
export const getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const role = req.user.role;

    if (role === 'project') {
      return getProjectAnalytics({ params: { projectId: userId }, user: req.user }, res);
    } else if (role === 'creator') {
      return getCreatorAnalytics({ params: { creatorId: userId }, user: req.user }, res);
    } else {
      // Admin: Overall platform aggregation
      if (getIsConnected()) {
        const analyticsList = await CampaignAnalytics.find({});
        const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
        const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
        const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);
        const totalLikes = analyticsList.reduce((acc, a) => acc + (a.likes || 0), 0);
        const totalComments = analyticsList.reduce((acc, a) => acc + (a.comments || 0), 0);
        const totalShares = analyticsList.reduce((acc, a) => acc + (a.shares || 0), 0);
        const totalClicks = analyticsList.reduce((acc, a) => acc + (a.clicks || 0), 0);
        const totalConversions = analyticsList.reduce((acc, a) => acc + (a.conversions || 0), 0);

        const summary = calculateMetrics({
          impressions: totalImpressions,
          reach: totalReach,
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          shares: totalShares,
          clicks: totalClicks,
          conversions: totalConversions,
        });

        return res.status(200).json({ success: true, data: { summary, count: analyticsList.length } });
      } else {
        const analyticsList = memoryStore.analytics;
        const totalImpressions = analyticsList.reduce((acc, a) => acc + (a.impressions || 0), 0);
        const totalReach = analyticsList.reduce((acc, a) => acc + (a.reach || 0), 0);
        const totalViews = analyticsList.reduce((acc, a) => acc + (a.views || 0), 0);

        const summary = calculateMetrics({
          impressions: totalImpressions,
          reach: totalReach,
          views: totalViews,
        });

        return res.status(200).json({ success: true, data: { summary, count: analyticsList.length } });
      }
    }
  } catch (err) {
    console.error('[Get Analytics Overview Error]', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving overview analytics' });
  }
};
