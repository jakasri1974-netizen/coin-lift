import { prisma } from '../config/db.js';

export const creatorService = {
  async createProfile(data) {
    // Strip security-sensitive fields from creator input
    delete data.approvalStatus;
    delete data.verified;

    return prisma.creatorProfile.create({
      data: {
        ...data,
        approvalStatus: 'PENDING',
        verified: false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async getProfileByUserId(userId) {
    return prisma.creatorProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async updateProfileByUserId(userId, updateData) {
    // SECURITY GUARD: Creators cannot self-approve profiles via update payload
    delete updateData.approvalStatus;
    delete updateData.verified;

    const existing = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!existing) {
      const error = new Error('Creator profile not found. Please create your profile first.');
      error.statusCode = 404;
      throw error;
    }

    // If existing profile was REJECTED and creator updates fields, transition state back to PENDING if resubmitting
    const dataToUpdate = { ...updateData };

    return prisma.creatorProfile.update({
      where: { userId },
      data: dataToUpdate,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },

  async submitProfileForApproval(userId) {
    const existing = await prisma.creatorProfile.findUnique({ where: { userId } });
    if (!existing) {
      const error = new Error('Creator profile not found. Please create your profile first.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.creatorProfile.update({
      where: { userId },
      data: {
        approvalStatus: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async getAllProfiles(filters = {}) {
    const { category, search, approvalStatus } = filters;
    const where = {};

    if (category && category !== 'All') where.category = category;

    // Approval Visibility Rule (Section 14): Public discovery returns APPROVED profiles only
    where.approvalStatus = approvalStatus || 'APPROVED';

    if (search) {
      where.OR = [
        { displayName: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { headline: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.creatorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getProfileById(id) {
    return prisma.creatorProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  },
};
