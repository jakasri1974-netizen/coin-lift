import { prisma } from '../config/db.js';

export const agreementService = {
  /**
   * Create a new draft agreement for an existing collaboration
   * STRICT: Only the Project Owner of the collaboration can create agreements
   */
  async createAgreement(collaborationId, projectOwnerUserId, data) {
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        project: true,
        creator: true,
        campaign: true,
      },
    });

    if (!collaboration) {
      const error = new Error('Referenced collaboration workspace not found');
      error.statusCode = 404;
      throw error;
    }

    // Role & Ownership Enforcement
    if (collaboration.project.userId !== projectOwnerUserId) {
      const error = new Error('Forbidden: Only the Project Owner of this collaboration can create an agreement');
      error.statusCode = 403;
      throw error;
    }

    // Check existing active or pending agreement
    const existing = await prisma.agreement.findFirst({
      where: {
        collaborationId,
        status: { in: ['DRAFT', 'PENDING_ACCEPTANCE', 'ACCEPTED'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      if (existing.status === 'ACCEPTED') {
        const error = new Error('An agreement has already been accepted and finalized for this collaboration');
        error.statusCode = 400;
        throw error;
      }
      if (existing.status === 'PENDING_ACCEPTANCE') {
        const error = new Error('An agreement is currently pending Creator review. It must be accepted or rejected before creating a new one');
        error.statusCode = 400;
        throw error;
      }
      if (existing.status === 'DRAFT') {
        const error = new Error('A draft agreement already exists for this collaboration. You can edit or submit the existing draft');
        error.statusCode = 400;
        error.data = { agreementId: existing.id };
        throw error;
      }
    }

    return prisma.agreement.create({
      data: {
        title: data.title,
        collaborationId,
        campaignId: collaboration.campaignId,
        projectId: collaboration.projectId,
        creatorId: collaboration.creatorId,
        projectOwnerId: projectOwnerUserId,
        scope: data.scope,
        deliverables: data.deliverables,
        rate: data.rate,
        currency: data.currency || 'USDC',
        startDate: data.startDate ? new Date(data.startDate) : null,
        deadline: data.deadline ? new Date(data.deadline) : null,
        status: 'DRAFT',
        version: 1,
      },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true, budget: true, currency: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Get an agreement by ID with strict participant authorization
   */
  async getAgreementById(agreementId, userId, role) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true, budget: true, currency: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
        collaboration: { select: { id: true, status: true, startedAt: true } },
      },
    });

    if (!agreement) {
      const error = new Error('Digital agreement not found');
      error.statusCode = 404;
      throw error;
    }

    const isProjectOwner = agreement.project.userId === userId;
    const isCreator = agreement.creator.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isProjectOwner && !isCreator && !isAdmin) {
      const error = new Error('Forbidden: You are not authorized to view this agreement');
      error.statusCode = 403;
      throw error;
    }

    return agreement;
  },

  /**
   * Fetch all agreements for a given collaboration workspace
   */
  async getAgreementsByCollaboration(collaborationId, userId, role) {
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        project: true,
        creator: true,
      },
    });

    if (!collaboration) {
      const error = new Error('Collaboration workspace not found');
      error.statusCode = 404;
      throw error;
    }

    const isProjectOwner = collaboration.project.userId === userId;
    const isCreator = collaboration.creator.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isProjectOwner && !isCreator && !isAdmin) {
      const error = new Error('Forbidden: You are not a participant in this collaboration workspace');
      error.statusCode = 403;
      throw error;
    }

    return prisma.agreement.findMany({
      where: { collaborationId },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Fetch all agreements for the current authenticated user
   */
  async getMyAgreements(userId, role) {
    let where = {};

    if (role === 'CREATOR') {
      const creator = await prisma.creatorProfile.findUnique({ where: { userId } });
      if (!creator) return [];
      where.creatorId = creator.id;
    } else if (role === 'PROJECT_OWNER') {
      const project = await prisma.projectProfile.findUnique({ where: { userId } });
      if (!project) return [];
      where.projectId = project.id;
    } else if (role === 'ADMIN') {
      where = {};
    } else {
      return [];
    }

    return prisma.agreement.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true, budget: true, currency: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
        collaboration: { select: { id: true, status: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  /**
   * Update agreement details
   * STRICT: Only Project Owner can edit, and only in DRAFT or REJECTED status
   */
  async updateAgreement(agreementId, projectOwnerUserId, data) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: { project: true },
    });

    if (!agreement) {
      const error = new Error('Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    if (agreement.project.userId !== projectOwnerUserId) {
      const error = new Error('Forbidden: Only the Project Owner can edit this agreement');
      error.statusCode = 403;
      throw error;
    }

    if (agreement.status === 'ACCEPTED') {
      const error = new Error('Forbidden: Accepted agreements cannot be edited');
      error.statusCode = 400;
      throw error;
    }

    if (agreement.status === 'PENDING_ACCEPTANCE') {
      const error = new Error('Cannot edit an agreement while pending Creator review. It must be reviewed or rejected first');
      error.statusCode = 400;
      throw error;
    }

    // Build update payload
    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.deliverables !== undefined) updateData.deliverables = data.deliverables;
    if (data.rate !== undefined) updateData.rate = data.rate;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;

    return prisma.agreement.update({
      where: { id: agreementId },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Submit agreement for Creator review
   * Transitions DRAFT or REJECTED -> PENDING_ACCEPTANCE
   */
  async submitAgreement(agreementId, projectOwnerUserId) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: { project: true },
    });

    if (!agreement) {
      const error = new Error('Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    if (agreement.project.userId !== projectOwnerUserId) {
      const error = new Error('Forbidden: Only the Project Owner can submit this agreement');
      error.statusCode = 403;
      throw error;
    }

    if (agreement.status === 'ACCEPTED') {
      const error = new Error('Agreement has already been accepted and cannot be resubmitted');
      error.statusCode = 400;
      throw error;
    }

    if (agreement.status === 'PENDING_ACCEPTANCE') {
      const error = new Error('Agreement is already pending Creator acceptance');
      error.statusCode = 400;
      throw error;
    }

    // Validation checks
    if (!agreement.title || !agreement.scope || !agreement.deliverables?.length || !agreement.rate) {
      const error = new Error('Incomplete agreement terms. Title, scope, deliverables, and rate are required before submission');
      error.statusCode = 400;
      throw error;
    }

    const nextVersion = agreement.status === 'REJECTED' ? agreement.version + 1 : agreement.version;

    return prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: 'PENDING_ACCEPTANCE',
        version: nextVersion,
        rejectionReason: null, // Clear rejection reason on revision resubmit
      },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Accept agreement
   * STRICT: Only the designated Creator can accept, and only in PENDING_ACCEPTANCE status
   */
  async acceptAgreement(agreementId, creatorUserId) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: { creator: true },
    });

    if (!agreement) {
      const error = new Error('Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    if (agreement.creator.userId !== creatorUserId) {
      const error = new Error('Forbidden: Only the assigned Creator can accept this agreement');
      error.statusCode = 403;
      throw error;
    }

    if (agreement.status === 'ACCEPTED') {
      const error = new Error('Agreement has already been accepted');
      error.statusCode = 400;
      throw error;
    }

    if (agreement.status !== 'PENDING_ACCEPTANCE') {
      const error = new Error(`Cannot accept an agreement in ${agreement.status} status`);
      error.statusCode = 400;
      throw error;
    }

    return prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: 'ACCEPTED',
        creatorAcceptedAt: new Date(),
      },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Reject agreement
   * STRICT: Only the designated Creator can reject, with mandatory rejection reason
   */
  async rejectAgreement(agreementId, creatorUserId, rejectionReason) {
    const agreement = await prisma.agreement.findUnique({
      where: { id: agreementId },
      include: { creator: true },
    });

    if (!agreement) {
      const error = new Error('Agreement not found');
      error.statusCode = 404;
      throw error;
    }

    if (agreement.creator.userId !== creatorUserId) {
      const error = new Error('Forbidden: Only the assigned Creator can reject this agreement');
      error.statusCode = 403;
      throw error;
    }

    if (agreement.status === 'ACCEPTED') {
      const error = new Error('Cannot reject an agreement that has already been accepted');
      error.statusCode = 400;
      throw error;
    }

    if (agreement.status !== 'PENDING_ACCEPTANCE') {
      const error = new Error(`Cannot reject an agreement in ${agreement.status} status`);
      error.statusCode = 400;
      throw error;
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      const error = new Error('A rejection reason must be provided');
      error.statusCode = 400;
      throw error;
    }

    return prisma.agreement.update({
      where: { id: agreementId },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim(),
      },
      include: {
        project: { select: { id: true, name: true, logo: true, userId: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, userId: true } },
        campaign: { select: { id: true, title: true, category: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Admin read-only visibility into all agreements
   */
  async getAllAdminAgreements() {
    return prisma.agreement.findMany({
      include: {
        project: { select: { id: true, name: true, logo: true, category: true } },
        creator: { select: { id: true, displayName: true, profileImage: true, category: true } },
        campaign: { select: { id: true, title: true, category: true, budget: true, currency: true } },
        projectOwner: { select: { id: true, name: true, email: true } },
        collaboration: { select: { id: true, status: true, startedAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
