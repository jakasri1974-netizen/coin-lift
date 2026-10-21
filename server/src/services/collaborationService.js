import { prisma } from '../config/db.js';

export const collaborationService = {
  /**
   * Fetch all collaborations for the authenticated user (Creator or Project Owner)
   */
  async getMyCollaborations(userId, role) {
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
      where = {}; // Admin can see all
    } else {
      return [];
    }

    return prisma.collaboration.findMany({
      where,
      include: {
        campaign: {
          select: { id: true, title: true, category: true, budget: true, currency: true, status: true },
        },
        project: {
          select: { id: true, name: true, logo: true, category: true, verified: true },
        },
        creator: {
          select: { id: true, displayName: true, profileImage: true, category: true, verified: true },
        },
        application: {
          select: { id: true, proposal: true, proposedRate: true, proposedDeliverables: true, status: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: { select: { id: true, name: true, role: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  /**
   * Get collaboration by ID with strict participant security authorization
   */
  async getCollaborationById(collaborationId, userId, role) {
    const collaboration = await prisma.collaboration.findUnique({
      where: { id: collaborationId },
      include: {
        campaign: {
          select: { id: true, title: true, description: true, category: true, budget: true, currency: true, deliverables: true, status: true },
        },
        project: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        creator: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        application: {
          select: { id: true, proposal: true, proposedRate: true, proposedDeliverables: true, status: true, createdAt: true },
        },
      },
    });

    if (!collaboration) {
      const error = new Error('Collaboration workspace not found');
      error.statusCode = 404;
      throw error;
    }

    // SECURITY GUARD: Participant verification
    const isCreatorParticipant = collaboration.creator.userId === userId;
    const isProjectOwnerParticipant = collaboration.project.userId === userId;
    const isAdmin = role === 'ADMIN';

    if (!isCreatorParticipant && !isProjectOwnerParticipant && !isAdmin) {
      const error = new Error('Forbidden: You are not a participant in this collaboration workspace');
      error.statusCode = 403;
      throw error;
    }

    return collaboration;
  },

  /**
   * Update collaboration status (ACTIVE -> COMPLETED or CANCELLED)
   */
  async updateCollaborationStatus(collaborationId, userId, role, newStatus) {
    const collaboration = await this.getCollaborationById(collaborationId, userId, role);

    if (!['COMPLETED', 'CANCELLED'].includes(newStatus)) {
      const error = new Error('Invalid collaboration status transition');
      error.statusCode = 400;
      throw error;
    }

    if (collaboration.status === newStatus) {
      return collaboration;
    }

    return prisma.collaboration.update({
      where: { id: collaborationId },
      data: {
        status: newStatus,
        completedAt: new Date(),
      },
      include: {
        campaign: { select: { id: true, title: true } },
        project: { select: { id: true, name: true } },
        creator: { select: { id: true, displayName: true } },
      },
    });
  },

  /**
   * Fetch messages for a collaboration with participant verification
   */
  async getCollaborationMessages(collaborationId, userId, role) {
    // Verify participant first
    await this.getCollaborationById(collaborationId, userId, role);

    return prisma.message.findMany({
      where: { collaborationId },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  },

  /**
   * Send message within a collaboration workspace
   */
  async sendMessage(collaborationId, senderUserId, role, content) {
    // Verify participant first
    const collaboration = await this.getCollaborationById(collaborationId, senderUserId, role);

    if (collaboration.status === 'COMPLETED' || collaboration.status === 'CANCELLED') {
      const error = new Error(`Cannot send messages in a ${collaboration.status} collaboration`);
      error.statusCode = 400;
      throw error;
    }

    const message = await prisma.message.create({
      data: {
        collaborationId,
        senderId: senderUserId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    // Touch collaboration updatedAt timestamp
    await prisma.collaboration.update({
      where: { id: collaborationId },
      data: { updatedAt: new Date() },
    });

    return message;
  },
};
