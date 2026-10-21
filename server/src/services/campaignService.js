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
};
