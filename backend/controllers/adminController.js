import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';
import ProjectProfile from '../models/ProjectProfile.js';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Collaboration from '../models/Collaboration.js';
import Report from '../models/Report.js';
import AuditLog from '../models/AuditLog.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

// Helper to log audit actions safely
export const logAuditAction = async ({ actorId, action, entityType, entityId, metadata = {}, req = null }) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';
    if (getIsConnected()) {
      await AuditLog.create({
        actorId,
        action,
        entityType,
        entityId: entityId.toString(),
        metadata,
        ipAddress,
      });
    } else {
      memoryStore.auditLogs = memoryStore.auditLogs || [];
      memoryStore.auditLogs.push({
        _id: `audit_${Date.now()}`,
        actorId,
        action,
        entityType,
        entityId: entityId.toString(),
        metadata,
        ipAddress,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

export const getAdminDashboard = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const totalUsers = await User.countDocuments();
      const totalCreators = await User.countDocuments({ role: 'creator' });
      const totalProjects = await User.countDocuments({ role: 'project' });
      const totalCampaigns = await Campaign.countDocuments();
      const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
      const pendingApplications = await Application.countDocuments({ status: 'pending' });
      const activeCollaborations = await Collaboration.countDocuments({ status: { $in: ['active', 'in_progress'] } });
      const openReports = await Report.countDocuments({ status: 'open' });

      return res.json({
        success: true,
        data: {
          totalUsers,
          totalCreators,
          totalProjects,
          totalCampaigns,
          activeCampaigns,
          pendingApplications,
          activeCollaborations,
          openReports,
        },
      });
    } else {
      return res.json({
        success: true,
        data: {
          totalUsers: memoryStore.users.length,
          totalCreators: memoryStore.users.filter((u) => u.role === 'creator').length,
          totalProjects: memoryStore.users.filter((u) => u.role === 'project').length,
          totalCampaigns: memoryStore.campaigns.length,
          activeCampaigns: memoryStore.campaigns.filter((c) => c.status === 'active').length,
          pendingApplications: memoryStore.applications.filter((a) => a.status === 'pending').length,
          activeCollaborations: memoryStore.collaborations.filter((c) => ['active', 'in_progress'].includes(c.status)).length,
          openReports: (memoryStore.reports || []).filter((r) => r.status === 'open').length,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      let query = {};
      if (role) query.role = role;
      if (status === 'suspended') query.isSuspended = true;
      else if (status === 'active') query.isSuspended = { $ne: true };

      if (search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { email: regex }];
      }

      const total = await User.countDocuments(query);
      const users = await User.find(query)
        .select('-password')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: users.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: users,
      });
    } else {
      let users = memoryStore.users.map((u) => {
        const { password, ...safeUser } = u;
        return safeUser;
      });

      if (role) users = users.filter((u) => u.role === role);
      if (status === 'suspended') users = users.filter((u) => u.isSuspended === true);
      else if (status === 'active') users = users.filter((u) => !u.isSuspended);

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        users = users.filter((u) => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
      }

      const total = users.length;
      const paginated = users.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const user = await User.findById(req.params.id).select('-password');
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      return res.json({ success: true, data: user });
    } else {
      const u = memoryStore.users.find((user) => user._id.toString() === req.params.id.toString());
      if (!u) return res.status(404).json({ success: false, message: 'User not found' });
      const { password, ...safeUser } = u;
      return res.json({ success: true, data: safeUser });
    }
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { isSuspended, status } = req.body;
    const targetUserId = req.params.id;

    // Prevent admin self-suspension
    if (targetUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot suspend their own account' });
    }

    const shouldSuspend = isSuspended !== undefined ? Boolean(isSuspended) : status === 'suspended';

    if (getIsConnected()) {
      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.isSuspended = shouldSuspend;
      user.status = shouldSuspend ? 'suspended' : 'active';
      await user.save();

      await logAuditAction({
        actorId: req.user._id,
        action: shouldSuspend ? 'USER_SUSPEND' : 'USER_ACTIVATE',
        entityType: 'User',
        entityId: user._id,
        metadata: { isSuspended: shouldSuspend, targetUserEmail: user.email },
        req,
      });

      return res.json({
        success: true,
        message: `User ${shouldSuspend ? 'suspended' : 'activated'} successfully`,
        data: { _id: user._id, name: user.name, email: user.email, isSuspended: user.isSuspended, status: user.status },
      });
    } else {
      const user = memoryStore.users.find((u) => u._id.toString() === targetUserId.toString());
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      user.isSuspended = shouldSuspend;
      user.status = shouldSuspend ? 'suspended' : 'active';

      await logAuditAction({
        actorId: req.user._id,
        action: shouldSuspend ? 'USER_SUSPEND' : 'USER_ACTIVATE',
        entityType: 'User',
        entityId: user._id,
        metadata: { isSuspended: shouldSuspend, targetUserEmail: user.email },
        req,
      });

      return res.json({
        success: true,
        message: `User ${shouldSuspend ? 'suspended' : 'activated'} successfully`,
        data: { _id: user._id, name: user.name, email: user.email, isSuspended: user.isSuspended, status: user.status },
      });
    }
  } catch (error) {
    next(error);
  }
};

export const createReport = async (req, res, next) => {
  try {
    const { reportedUserId, campaignId, collaborationId, reason, description } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason is required for submitting a report' });
    }

    if (getIsConnected()) {
      const report = await Report.create({
        reporterId: req.user._id,
        reportedUserId: reportedUserId || null,
        campaignId: campaignId || null,
        collaborationId: collaborationId || null,
        reason: reason.trim(),
        description: description ? description.trim() : '',
        status: 'open',
      });

      return res.status(201).json({ success: true, message: 'Report submitted successfully', data: report });
    } else {
      memoryStore.reports = memoryStore.reports || [];
      const newReport = {
        _id: `rep_${Date.now()}`,
        reporterId: req.user._id,
        reportedUserId: reportedUserId || null,
        campaignId: campaignId || null,
        collaborationId: collaborationId || null,
        reason: reason.trim(),
        description: description ? description.trim() : '',
        status: 'open',
        adminNotes: '',
        resolvedBy: null,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
      };
      memoryStore.reports.push(newReport);
      return res.status(201).json({ success: true, message: 'Report submitted successfully', data: newReport });
    }
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      let query = {};
      if (status) query.status = status;

      const total = await Report.countDocuments(query);
      const reports = await Report.find(query)
        .populate('reporterId', 'name email role')
        .populate('reportedUserId', 'name email role')
        .populate('campaignId', 'title')
        .populate('collaborationId', 'status progress')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: reports.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: reports,
      });
    } else {
      let reports = memoryStore.reports || [];
      if (status) reports = reports.filter((r) => r.status === status);

      const total = reports.length;
      const paginated = reports.slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const reportId = req.params.id;

    if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid report status' });
    }

    if (getIsConnected()) {
      const report = await Report.findById(reportId);
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      report.status = status;
      if (adminNotes !== undefined) report.adminNotes = adminNotes;

      if (['resolved', 'dismissed'].includes(status)) {
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date();
      }

      await report.save();

      await logAuditAction({
        actorId: req.user._id,
        action: 'REPORT_STATUS_UPDATE',
        entityType: 'Report',
        entityId: report._id,
        metadata: { newStatus: status, adminNotes },
        req,
      });

      return res.json({ success: true, message: `Report updated to ${status}`, data: report });
    } else {
      memoryStore.reports = memoryStore.reports || [];
      const report = memoryStore.reports.find((r) => r._id.toString() === reportId.toString());
      if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

      report.status = status;
      if (adminNotes !== undefined) report.adminNotes = adminNotes;

      if (['resolved', 'dismissed'].includes(status)) {
        report.resolvedBy = req.user._id;
        report.resolvedAt = new Date().toISOString();
      }

      await logAuditAction({
        actorId: req.user._id,
        action: 'REPORT_STATUS_UPDATE',
        entityType: 'Report',
        entityId: report._id,
        metadata: { newStatus: status, adminNotes },
        req,
      });

      return res.json({ success: true, message: `Report updated to ${status}`, data: report });
    }
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 30));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      const total = await AuditLog.countDocuments();
      const logs = await AuditLog.find()
        .populate('actorId', 'name email role')
        .sort('-timestamp')
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: logs.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: logs,
      });
    } else {
      const logs = memoryStore.auditLogs || [];
      const total = logs.length;
      const paginated = [...logs].reverse().slice(skip, skip + limitNum);

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllCreators = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const creators = await CreatorProfile.find().populate('userId', 'name email isVerified status').sort('-createdAt');
      return res.json({ success: true, count: creators.length, data: creators });
    } else {
      return res.json({ success: true, count: memoryStore.creators.length, data: memoryStore.creators });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllProjects = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const projects = await ProjectProfile.find().populate('userId', 'name email isVerified status').sort('-createdAt');
      return res.json({ success: true, count: projects.length, data: projects });
    } else {
      return res.json({ success: true, count: memoryStore.projects.length, data: memoryStore.projects });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllCampaigns = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const campaigns = await Campaign.find().populate('projectId', 'name email').sort('-createdAt');
      return res.json({ success: true, count: campaigns.length, data: campaigns });
    } else {
      return res.json({ success: true, count: memoryStore.campaigns.length, data: memoryStore.campaigns });
    }
  } catch (error) {
    next(error);
  }
};

export const getAllApplications = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const apps = await Application.find()
        .populate('campaignId', 'title')
        .populate('creatorId', 'name email')
        .populate('projectId', 'name email')
        .sort('-createdAt');
      return res.json({ success: true, count: apps.length, data: apps });
    } else {
      return res.json({ success: true, count: memoryStore.applications.length, data: memoryStore.applications });
    }
  } catch (error) {
    next(error);
  }
};
