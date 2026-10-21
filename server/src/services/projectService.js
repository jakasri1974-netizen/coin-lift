import { prisma } from '../config/db.js';

export const projectService = {
  async createProfile(data) {
    // Strip security-sensitive fields from user input
    delete data.approvalStatus;
    delete data.verified;

    return prisma.projectProfile.create({
      data: {
        ...data,
        approvalStatus: 'PENDING',
        verified: false,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        campaigns: true,
      },
    });
  },

  async getProfileByUserId(userId) {
    return prisma.projectProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        campaigns: true,
      },
    });
  },

  async updateProfileByUserId(userId, updateData) {
    // SECURITY GUARD: Project Owners cannot self-approve profiles via update payload
    delete updateData.approvalStatus;
    delete updateData.verified;

    const existing = await prisma.projectProfile.findUnique({ where: { userId } });
    if (!existing) {
      const error = new Error('Project profile not found. Please create your profile first.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.projectProfile.update({
      where: { userId },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        campaigns: true,
      },
    });
  },

  async submitProfileForApproval(userId) {
    const existing = await prisma.projectProfile.findUnique({ where: { userId } });
    if (!existing) {
      const error = new Error('Project profile not found. Please create your profile first.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.projectProfile.update({
      where: { userId },
      data: {
        approvalStatus: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        campaigns: true,
      },
    });
  },

  async getAllProfiles(filters = {}) {
    const { category, network, projectType, search, approvalStatus } = filters;
    const where = {};

    if (category && category !== 'All') where.category = category;
    if (network && network !== 'All') where.network = network;
    if (projectType && projectType !== 'All') where.projectType = projectType;

    // Approval Visibility Rule (Section 8 & 14): Public discovery defaults to APPROVED profiles only
    where.approvalStatus = approvalStatus || 'APPROVED';

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tagline: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
        { network: { contains: search, mode: 'insensitive' } },
        { tokenSymbol: { contains: search, mode: 'insensitive' } },
      ];
    }

    return prisma.projectProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        campaigns: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getProfileById(id) {
    return prisma.projectProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        campaigns: true,
      },
    });
  },
};
