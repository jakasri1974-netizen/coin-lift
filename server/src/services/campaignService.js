import { prisma } from '../config/db.js';

export const campaignService = {
  async createCampaign(data) {
    // SECURITY GUARD: Strip status and rejectionReason from user input
    delete data.status;
    delete data.rejectionReason;

    return prisma.campaign.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: {
        project: true,
      },
    });
  },

  async getMyCampaigns(projectId) {
    return prisma.campaign.findMany({
      where: { projectId },
      include: {
        project: {
          select: { id: true, name: true, logo: true, category: true, verified: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async updateCampaign(campaignId, projectId, updateData) {
    // SECURITY GUARD: Project Owner cannot self-publish via update payload
    delete updateData.status;
    delete updateData.rejectionReason;

    const existing = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!existing) {
      const error = new Error('Campaign not found');
      error.statusCode = 404;
      throw error;
    }

    if (existing.projectId !== projectId) {
      const error = new Error('Forbidden: You do not have permission to modify this campaign');
      error.statusCode = 403;
      throw error;
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        project: true,
      },
    });
  },

  async submitCampaignForApproval(campaignId, projectId) {
    const existing = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!existing) {
      const error = new Error('Campaign not found');
      error.statusCode = 404;
      throw error;
    }

    if (existing.projectId !== projectId) {
      const error = new Error('Forbidden: You do not have permission to submit this campaign');
      error.statusCode = 403;
      throw error;
    }

    if (!['DRAFT', 'REJECTED', 'CANCELLED'].includes(existing.status)) {
      const error = new Error(`Cannot submit campaign in '${existing.status}' state for approval`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: 'PENDING_APPROVAL',
      },
      include: {
        project: true,
      },
    });
  },

  async getAllCampaigns(filters = {}) {
    const { category, search, status } = filters;
    const where = {};

    if (category && category !== 'All') where.category = category;

    // Server-Side Public Discovery Rule (Section 5): Public discovery defaults to PUBLISHED campaigns only
    where.status = status || 'PUBLISHED';

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return prisma.campaign.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, logo: true, category: true, verified: true },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getCampaignById(id) {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        project: true,
        applications: {
          include: {
            creator: {
              select: { id: true, displayName: true, category: true, profileImage: true, followersCount: true },
            },
          },
        },
      },
    });
  },

  async inviteCreatorToCampaign({
    campaignId,
    projectProfileId,
    creatorId,
    message,
    proposedRate,
    proposedDeliverables,
  }) {
    // 1. Validate Campaign exists
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        project: {
          select: { id: true, name: true, userId: true },
        },
      },
    });

    if (!campaign) {
      const error = new Error('Referenced campaign does not exist');
      error.statusCode = 404;
      error.code = 'CAMPAIGN_NOT_FOUND';
      throw error;
    }

    // 2. Validate Ownership: Campaign must belong to the authenticated Project Owner
    if (campaign.projectId !== projectProfileId) {
      const error = new Error('Forbidden: You do not have permission to invite creators to this campaign');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    // 3. Validate Campaign Status: Only PUBLISHED campaigns accept invitations/collaborations
    if (campaign.status !== 'PUBLISHED') {
      const error = new Error(`Cannot invite creators to a ${campaign.status} campaign. Campaign must be PUBLISHED.`);
      error.statusCode = 400;
      error.code = 'CAMPAIGN_NOT_PUBLISHED';
      throw error;
    }

    // 4. Validate Target Creator: Check by CreatorProfile.id or User.id
    let targetCreator = await prisma.creatorProfile.findUnique({
      where: { id: creatorId },
      include: { user: { select: { id: true, email: true, name: true } } },
    });

    if (!targetCreator) {
      targetCreator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        include: { user: { select: { id: true, email: true, name: true } } },
      });
    }

    if (!targetCreator) {
      const error = new Error('Referenced Creator profile does not exist');
      error.statusCode = 404;
      error.code = 'CREATOR_NOT_FOUND';
      throw error;
    }

    // 5. Check duplicate application/invitation
    const existingApplication = await prisma.application.findUnique({
      where: {
        unique_creator_campaign_application: {
          creatorId: targetCreator.id,
          campaignId: campaign.id,
        },
      },
    });

    if (existingApplication) {
      const error = new Error('This creator has already been invited or applied to this campaign');
      error.statusCode = 409;
      error.code = 'DUPLICATE_INVITATION';
      throw error;
    }

    // 6. Create Application record as invitation
    const application = await prisma.application.create({
      data: {
        creatorId: targetCreator.id,
        campaignId: campaign.id,
        proposal: message?.trim() || `Campaign invitation from ${campaign.project.name}`,
        proposedDeliverables: proposedDeliverables || campaign.deliverables || [],
        proposedRate: proposedRate !== undefined ? proposedRate : campaign.budget,
        status: 'PENDING',
      },
      include: {
        creator: {
          select: { id: true, displayName: true, category: true, profileImage: true },
        },
        campaign: {
          select: { id: true, title: true, budget: true, category: true, currency: true, status: true, project: { select: { id: true, name: true, logo: true } } },
        },
      },
    });

    return application;
  },
};
