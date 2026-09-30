import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Collaboration from '../models/Collaboration.js';
import CreatorProfile from '../models/CreatorProfile.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export const getCreatorDashboard = async (req, res, next) => {
  try {
    const creatorId = req.user._id;

    if (getIsConnected()) {
      const totalApplications = await Application.countDocuments({ creatorId });
      const pendingApplications = await Application.countDocuments({ creatorId, status: 'pending' });
      const acceptedApplications = await Application.countDocuments({ creatorId, status: 'accepted' });
      const rejectedApplications = await Application.countDocuments({ creatorId, status: 'rejected' });
      const activeCollaborations = await Collaboration.countDocuments({ creatorId, status: { $in: ['active', 'in_progress'] } });
      const completedCollaborations = await Collaboration.countDocuments({ creatorId, status: 'completed' });
      const profile = await CreatorProfile.findOne({ userId: creatorId });

      return res.json({
        success: true,
        data: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          activeCollaborations,
          completedCollaborations,
          totalReach: profile?.followers || '0',
          averageEngagement: profile?.engagementRate || '0%',
        },
      });
    } else {
      const totalApplications = memoryStore.applications.filter(a => a.creatorId === creatorId).length;
      const pendingApplications = memoryStore.applications.filter(a => a.creatorId === creatorId && a.status === 'pending').length;
      const acceptedApplications = memoryStore.applications.filter(a => a.creatorId === creatorId && a.status === 'accepted').length;
      const rejectedApplications = memoryStore.applications.filter(a => a.creatorId === creatorId && a.status === 'rejected').length;
      const activeCollaborations = memoryStore.collaborations.filter(c => c.creatorId === creatorId && ['active', 'in_progress'].includes(c.status)).length;
      const completedCollaborations = memoryStore.collaborations.filter(c => c.creatorId === creatorId && c.status === 'completed').length;

      return res.json({
        success: true,
        data: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          rejectedApplications,
          activeCollaborations,
          completedCollaborations,
          totalReach: '0',
          averageEngagement: '0%',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectDashboard = async (req, res, next) => {
  try {
    const projectId = req.user._id;

    if (getIsConnected()) {
      const totalCampaigns = await Campaign.countDocuments({ projectId });
      const activeCampaigns = await Campaign.countDocuments({ projectId, status: 'active' });
      const totalApplications = await Application.countDocuments({ projectId });
      const acceptedApplications = await Application.countDocuments({ projectId, status: 'accepted' });
      const rejectedApplications = await Application.countDocuments({ projectId, status: 'rejected' });
      const activeCollaborations = await Collaboration.countDocuments({ projectId, status: { $in: ['active', 'in_progress'] } });
      const completedCollaborations = await Collaboration.countDocuments({ projectId, status: 'completed' });

      return res.json({
        success: true,
        data: {
          totalCampaigns,
          activeCampaigns,
          totalApplications,
          acceptedApplications,
          acceptedCreators: acceptedApplications,
          rejectedApplications,
          activeCollaborations,
          completedCollaborations,
          totalReach: '0',
          averageEngagement: '0%',
        },
      });
    } else {
      const totalCampaigns = memoryStore.campaigns.filter(c => c.projectId === projectId).length;
      const activeCampaigns = memoryStore.campaigns.filter(c => c.projectId === projectId && c.status === 'active').length;
      const totalApplications = memoryStore.applications.filter(a => a.projectId === projectId).length;
      const acceptedApplications = memoryStore.applications.filter(a => a.projectId === projectId && a.status === 'accepted').length;
      const rejectedApplications = memoryStore.applications.filter(a => a.projectId === projectId && a.status === 'rejected').length;
      const activeCollaborations = memoryStore.collaborations.filter(c => c.projectId === projectId && ['active', 'in_progress'].includes(c.status)).length;
      const completedCollaborations = memoryStore.collaborations.filter(c => c.projectId === projectId && c.status === 'completed').length;

      return res.json({
        success: true,
        data: {
          totalCampaigns,
          activeCampaigns,
          totalApplications,
          acceptedApplications,
          acceptedCreators: acceptedApplications,
          rejectedApplications,
          activeCollaborations,
          completedCollaborations,
          totalReach: '0',
          averageEngagement: '0%',
        },
      });
    }
  } catch (error) {
    next(error);
  }
};
