import { prisma } from '../config/db.js';

export const adminService = {
  /**
   * Aggregate dynamic metrics for Admin Dashboard
   */
  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalCreators,
        totalProjects,
        pendingCreators,
        pendingProjects,
        publishedCampaigns,
        pendingApplications,
        suspendedUsers,
        recentActivity,
        recentUsers,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'CREATOR' } }),
        prisma.user.count({ where: { role: 'PROJECT_OWNER' } }),
        prisma.creatorProfile.count({ where: { approvalStatus: 'PENDING' } }),
        prisma.projectProfile.count({ where: { approvalStatus: 'PENDING' } }),
        prisma.campaign.count({ where: { status: 'PUBLISHED' } }),
        prisma.application.count({ where: { status: 'PENDING' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.adminLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            adminUser: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.user.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        }),
      ]);

      return {
        metrics: {
          totalUsers,
          totalCreators,
          totalProjects,
          pendingCreators,
          pendingProjects,
          publishedCampaigns,
          pendingApplications,
          suspendedUsers,
        },
        recentActivity,
        recentUsers,
      };
    } catch (error) {
      // Fallback response if database connection is offline during dev testing
      return {
        metrics: {
          totalUsers: 0,
          totalCreators: 0,
          totalProjects: 0,
          pendingCreators: 0,
          pendingProjects: 0,
          publishedCampaigns: 0,
          pendingApplications: 0,
          suspendedUsers: 0,
        },
        recentActivity: [],
        recentUsers: [],
        warning: `Database metric aggregation offline: ${error.message}`,
      };
    }
  },

  /**
   * Get Users list with search and filters
   */
  async getAllUsers(filters = {}) {
    const { search, role, status } = filters;
    const where = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        creatorProfile: { select: { id: true, approvalStatus: true } },
        projectProfile: { select: { id: true, approvalStatus: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Update User account status (ACTIVE | SUSPENDED) & record AdminLog
   */
  async updateUserStatus(userId, status, adminUserId) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status },
      select: { id: true, name: true, email: true, role: true, status: true },
    });

    const action = status === 'SUSPENDED' ? 'USER_SUSPENDED' : 'USER_REACTIVATED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'User',
        targetId: userId,
        metadata: { targetUserEmail: user.email, targetUserName: user.name, newStatus: status },
      },
    });

    return user;
  },

  /**
   * Get Creator Profiles for Admin Moderation
   */
  async getAllCreators(filters = {}) {
    const { search, category, approvalStatus, verificationStatus } = filters;
    const where = {};

    if (category) where.category = category;

    if (approvalStatus && approvalStatus !== 'ALL') {
      if (approvalStatus === 'VERIFIED') {
        where.approvalStatus = 'APPROVED';
        where.verified = true;
      } else if (approvalStatus === 'UNVERIFIED') {
        where.approvalStatus = 'APPROVED';
        where.verified = false;
      } else {
        where.approvalStatus = approvalStatus;
      }
    }

    if (verificationStatus === 'VERIFIED') where.verified = true;
    if (verificationStatus === 'UNVERIFIED') where.verified = false;

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.creatorProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Approve or Reject Creator Profile with optional rejection reason & log action
   */
  async updateCreatorApproval(creatorId, approvalStatus, adminUserId, rejectionReason = null) {
    const updateData = {
      approvalStatus,
    };

    if (approvalStatus === 'APPROVED') {
      updateData.verified = true; // Auto-grant verified status upon initial approval
      updateData.rejectionReason = null;
    } else if (approvalStatus === 'REJECTED') {
      updateData.verified = false;
      updateData.rejectionReason = rejectionReason || 'Profile submission did not meet minimum CoinLift community guidelines.';
    }

    const creator = await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const action = approvalStatus === 'APPROVED' ? 'CREATOR_APPROVED' : 'CREATOR_REJECTED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'CreatorProfile',
        targetId: creatorId,
        metadata: {
          creatorName: creator.displayName,
          userEmail: creator.user.email,
          newApprovalStatus: approvalStatus,
          rejectionReason: updateData.rejectionReason || null,
        },
      },
    });

    return creator;
  },

  /**
   * Toggle Verification status for an Approved Creator Profile & log action
   */
  async updateCreatorVerification(creatorId, verified, adminUserId) {
    const creator = await prisma.creatorProfile.update({
      where: { id: creatorId },
      data: { verified: Boolean(verified) },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const action = verified ? 'CREATOR_VERIFIED' : 'CREATOR_UNVERIFIED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'CreatorProfile',
        targetId: creatorId,
        metadata: {
          creatorName: creator.displayName,
          userEmail: creator.user.email,
          verified: Boolean(verified),
        },
      },
    });

    return creator;
  },

  /**
   * Get Project Profiles for Admin Moderation
   */
  async getAllProjects(filters = {}) {
    const { search, category, approvalStatus, verificationStatus } = filters;
    const where = {};

    if (category) where.category = category;

    if (approvalStatus && approvalStatus !== 'ALL') {
      if (approvalStatus === 'VERIFIED') {
        where.approvalStatus = 'APPROVED';
        where.verified = true;
      } else if (approvalStatus === 'UNVERIFIED') {
        where.approvalStatus = 'APPROVED';
        where.verified = false;
      } else {
        where.approvalStatus = approvalStatus;
      }
    }

    if (verificationStatus === 'VERIFIED') where.verified = true;
    if (verificationStatus === 'UNVERIFIED') where.verified = false;

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.projectProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, status: true } },
        campaigns: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Approve or Reject Project Profile with optional rejection reason & log action
   */
  async updateProjectApproval(projectId, approvalStatus, adminUserId, rejectionReason = null) {
    const updateData = {
      approvalStatus,
    };

    if (approvalStatus === 'APPROVED') {
      updateData.verified = true; // Auto-grant verified status upon initial approval
      updateData.rejectionReason = null;
    } else if (approvalStatus === 'REJECTED') {
      updateData.verified = false;
      updateData.rejectionReason = rejectionReason || 'Project profile submission requires revisions before approval.';
    }

    const project = await prisma.projectProfile.update({
      where: { id: projectId },
      data: updateData,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const action = approvalStatus === 'APPROVED' ? 'PROJECT_APPROVED' : 'PROJECT_REJECTED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'ProjectProfile',
        targetId: projectId,
        metadata: {
          projectName: project.name,
          userEmail: project.user.email,
          newApprovalStatus: approvalStatus,
          rejectionReason: updateData.rejectionReason || null,
        },
      },
    });

    return project;
  },

  /**
   * Toggle Verification status for an Approved Project Profile & log action
   */
  async updateProjectVerification(projectId, verified, adminUserId) {
    const project = await prisma.projectProfile.update({
      where: { id: projectId },
      data: { verified: Boolean(verified) },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    const action = verified ? 'PROJECT_VERIFIED' : 'PROJECT_UNVERIFIED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'ProjectProfile',
        targetId: projectId,
        metadata: {
          projectName: project.name,
          userEmail: project.user.email,
          verified: Boolean(verified),
        },
      },
    });

    return project;
  },

  /**
   * Get Campaigns for Admin Moderation
   */
  async getAllCampaigns(filters = {}) {
    const { search, category, status } = filters;
    const where = {};

    if (category && category !== 'ALL') where.category = category;
    if (status && status !== 'ALL') where.status = status;

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    return prisma.campaign.findMany({
      where,
      include: {
        project: {
          select: { id: true, name: true, category: true, user: { select: { email: true } } },
        },
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Approve or Reject Campaign & log action
   */
  async updateCampaignApproval(campaignId, newStatus, adminUserId, rejectionReason = null) {
    const updateData = {
      status: newStatus,
    };

    if (newStatus === 'PUBLISHED') {
      updateData.rejectionReason = null;
    } else if (newStatus === 'CANCELLED' || newStatus === 'REJECTED' || newStatus === 'DRAFT') {
      updateData.rejectionReason = rejectionReason || 'Campaign brief requires modifications before publishing.';
    }

    const campaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: updateData,
      include: {
        project: {
          select: { name: true, user: { select: { email: true } } },
        },
      },
    });

    const action = newStatus === 'PUBLISHED' ? 'CAMPAIGN_APPROVED' : 'CAMPAIGN_REJECTED';

    await prisma.adminLog.create({
      data: {
        adminUserId,
        action,
        targetType: 'Campaign',
        targetId: campaignId,
        metadata: {
          campaignTitle: campaign.title,
          projectName: campaign.project.name,
          userEmail: campaign.project.user.email,
          newStatus,
          rejectionReason: updateData.rejectionReason || null,
        },
      },
    });

    return campaign;
  },

  /**
   * Get Audit Logs
   */
  async getAdminLogs() {
    return prisma.adminLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        adminUser: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Phase 10: Admin Read-Only Agreements Directory
   */
  async getAllAdminAgreements() {
    return prisma.agreement.findMany({
      include: {
        project: { select: { id: true, name: true, logo: true, category: true, verified: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, category: true, verified: true } },
        campaign: { select: { id: true, title: true, category: true, budget: true, currency: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
        collaboration: { select: { id: true, status: true, startedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
