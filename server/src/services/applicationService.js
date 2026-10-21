import { prisma } from '../config/db.js';

export const applicationService = {
  async createApplication(data) {
    // Check target campaign status (Section 6: Only PUBLISHED campaigns accept applications)
    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
    });

    if (!campaign) {
      const error = new Error('Referenced Campaign does not exist');
      error.statusCode = 404;
      throw error;
    }

    if (campaign.status !== 'PUBLISHED') {
      const error = new Error('Applications are only accepted for PUBLISHED campaigns');
      error.statusCode = 400;
      throw error;
    }

    // Strip status from user payload to enforce PENDING initial status
    delete data.status;

    return prisma.application.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        creator: {
          select: { id: true, displayName: true, category: true, profileImage: true },
        },
        campaign: {
          select: { id: true, title: true, budget: true, category: true, project: { select: { id: true, name: true, logo: true } } },
        },
      },
    });
  },

  async getMyApplications(creatorId) {
    return prisma.application.findMany({
      where: { creatorId },
      include: {
        creator: {
          select: { id: true, displayName: true, category: true, profileImage: true },
        },
        campaign: {
          select: { id: true, title: true, budget: true, category: true, currency: true, status: true, project: { select: { id: true, name: true, logo: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async withdrawApplication(applicationId, creatorId) {
    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!existing) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (existing.creatorId !== creatorId) {
      const error = new Error('Forbidden: You do not have permission to withdraw this application');
      error.statusCode = 403;
      throw error;
    }

    if (existing.status !== 'PENDING') {
      const error = new Error(`Cannot withdraw an application with status: ${existing.status}`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.application.update({
      where: { id: applicationId },
      data: { status: 'WITHDRAWN' },
      include: {
        campaign: { select: { id: true, title: true } },
      },
    });
  },

  async updateApplicationStatus(applicationId, projectOwnerUserId, newStatus) {
    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        campaign: {
          include: {
            project: { select: { userId: true } },
          },
        },
      },
    });

    if (!existing) {
      const error = new Error('Application not found');
      error.statusCode = 404;
      throw error;
    }

    if (existing.campaign.project.userId !== projectOwnerUserId) {
      const error = new Error('Forbidden: You do not have permission to manage applications for this project');
      error.statusCode = 403;
      throw error;
    }

    if (!['ACCEPTED', 'REJECTED'].includes(newStatus)) {
      const error = new Error('Invalid status transition. Status must be ACCEPTED or REJECTED');
      error.statusCode = 400;
      throw error;
    }

    if (existing.status !== 'PENDING') {
      const error = new Error(`Application state cannot be changed from ${existing.status} to ${newStatus}`);
      error.statusCode = 400;
      throw error;
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
      include: {
        creator: { select: { id: true, displayName: true, user: { select: { email: true } } } },
        campaign: { select: { id: true, title: true, projectId: true } },
        collaboration: { select: { id: true, status: true } },
      },
    });

    if (newStatus === 'ACCEPTED') {
      const existingCollab = await prisma.collaboration.findUnique({
        where: { applicationId },
      });

      if (!existingCollab) {
        const collab = await prisma.collaboration.create({
          data: {
            applicationId,
            creatorId: existing.creatorId,
            projectId: existing.campaign.projectId,
            campaignId: existing.campaignId,
            status: 'ACTIVE',
          },
        });
        updatedApplication.collaboration = collab;
      }
    }

    return updatedApplication;
  },

  async getAllApplications(filters = {}) {
    const { creatorId, campaignId, status } = filters;
    const where = {};
    if (creatorId) where.creatorId = creatorId;
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;

    return prisma.application.findMany({
      where,
      include: {
        creator: {
          select: { id: true, displayName: true, category: true, profileImage: true },
        },
        campaign: {
          select: { id: true, title: true, budget: true, category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getApplicationById(id) {
    return prisma.application.findUnique({
      where: { id },
      include: {
        creator: true,
        campaign: {
          include: {
            project: true,
          },
        },
      },
    });
  },
};
