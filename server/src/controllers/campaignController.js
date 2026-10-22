import { campaignService } from '../services/campaignService.js';
import { prisma } from '../config/db.js';

export async function createCampaign(req, res, next) {
  try {
    const userProject = await prisma.projectProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProject) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_PROJECT_PROFILE',
          message: 'You must create a Project Profile before launching a campaign',
        },
      });
    }

    const campaignData = {
      ...req.body,
      projectId: userProject.id,
    };

    const campaign = await campaignService.createCampaign(campaignData);
    res.status(201).json({
      success: true,
      message: 'Campaign created as draft',
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyCampaigns(req, res, next) {
  try {
    const userProject = await prisma.projectProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProject) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const campaigns = await campaignService.getMyCampaigns(userProject.id);
    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCampaign(req, res, next) {
  try {
    const userProject = await prisma.projectProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProject) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_PROJECT_PROFILE', message: 'Project Profile required' },
      });
    }

    const campaign = await campaignService.updateCampaign(req.params.id, userProject.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: campaign,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: 'CAMPAIGN_ERROR', message: error.message },
      });
    }
    next(error);
  }
}

export async function submitCampaign(req, res, next) {
  try {
    const userProject = await prisma.projectProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProject) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_PROJECT_PROFILE', message: 'Project Profile required' },
      });
    }

    const campaign = await campaignService.submitCampaignForApproval(req.params.id, userProject.id);
    res.status(200).json({
      success: true,
      message: 'Campaign submitted for Admin approval',
      data: campaign,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: 'CAMPAIGN_ERROR', message: error.message },
      });
    }
    next(error);
  }
}

export async function getCampaignApplications(req, res, next) {
  try {
    const userProject = await prisma.projectProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userProject) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_PROJECT_PROFILE', message: 'Project Profile required' },
      });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: req.params.id },
    });

    if (!campaign || campaign.projectId !== userProject.id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to applications for this campaign' },
      });
    }

    const applications = await prisma.application.findMany({
      where: { campaignId: req.params.id },
      include: {
        creator: {
          select: { id: true, displayName: true, category: true, profileImage: true, followersCount: true, engagementRate: true, user: { select: { email: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllCampaigns(req, res, next) {
  try {
    const campaigns = await campaignService.getAllCampaigns(req.query);
    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCampaignById(req, res, next) {
  try {
    const campaign = await campaignService.getCampaignById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAMPAIGN_NOT_FOUND', message: 'Campaign not found' },
      });
    }

    // Public Approval Visibility Guard (Section 5)
    const userProject = req.user ? await prisma.projectProfile.findUnique({ where: { userId: req.user.id } }) : null;
    const isOwner = userProject && userProject.id === campaign.projectId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (campaign.status !== 'PUBLISHED' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: 'CAMPAIGN_NOT_PUBLISHED', message: 'This campaign is not currently published' },
      });
    }

    res.status(200).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
}
