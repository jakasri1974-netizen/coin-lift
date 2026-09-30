import Verification from '../models/Verification.js';
import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';
import ProjectProfile from '../models/ProjectProfile.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { logAuditAction } from './adminController.js';

// @desc Submit verification request
// @route POST /api/verification
// @access Private
export const submitVerification = async (req, res, next) => {
  try {
    const { submittedData, documents } = req.body;
    const userId = req.user._id.toString();
    const type = req.user.role === 'project' ? 'project' : 'creator';

    if (getIsConnected()) {
      const existing = await Verification.findOne({ userId, status: { $in: ['pending', 'under_review', 'verified'] } });
      if (existing) {
        if (existing.status === 'verified') {
          return res.status(400).json({ success: false, message: 'Your account is already verified' });
        }
        return res.status(400).json({ success: false, message: 'You already have an active verification request under review' });
      }

      const verification = await Verification.create({
        userId,
        type,
        submittedData: submittedData || {},
        documents: documents || [],
        status: 'pending',
      });

      return res.status(201).json({ success: true, message: 'Verification request submitted successfully', data: verification });
    } else {
      memoryStore.verifications = memoryStore.verifications || [];
      const existing = memoryStore.verifications.find(
        (v) => v.userId.toString() === userId && ['pending', 'under_review', 'verified'].includes(v.status)
      );

      if (existing) {
        if (existing.status === 'verified') {
          return res.status(400).json({ success: false, message: 'Your account is already verified' });
        }
        return res.status(400).json({ success: false, message: 'You already have an active verification request under review' });
      }

      const newVer = {
        _id: `ver_${Date.now()}`,
        userId,
        type,
        submittedData: submittedData || {},
        documents: documents || [],
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        rejectionReason: null,
        createdAt: new Date().toISOString(),
      };
      memoryStore.verifications.push(newVer);

      return res.status(201).json({ success: true, message: 'Verification request submitted successfully', data: newVer });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Get current user's verification status
// @route GET /api/verification/me
// @access Private
export const getMyVerification = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();

    if (getIsConnected()) {
      const verification = await Verification.findOne({ userId }).sort('-createdAt');
      return res.json({
        success: true,
        data: verification || { status: 'unverified', isVerified: req.user.isVerified || false },
      });
    } else {
      memoryStore.verifications = memoryStore.verifications || [];
      const userVers = memoryStore.verifications.filter((v) => v.userId.toString() === userId);
      const verification = userVers[userVers.length - 1];
      return res.json({
        success: true,
        data: verification || { status: 'unverified', isVerified: req.user.isVerified || false },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Admin: Get all verification requests
// @route GET /api/admin/verifications
// @access Private (Admin)
export const getAdminVerifications = async (req, res, next) => {
  try {
    const { status = '', type = '', page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      let query = {};
      if (status) query.status = status;
      if (type) query.type = type;

      const total = await Verification.countDocuments(query);
      const verifications = await Verification.find(query)
        .populate('userId', 'name email role isVerified')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      return res.json({
        success: true,
        count: verifications.length,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum) || 1,
        data: verifications,
      });
    } else {
      let vers = memoryStore.verifications || [];
      if (status) vers = vers.filter((v) => v.status === status);
      if (type) vers = vers.filter((v) => v.type === type);

      const total = vers.length;
      const paginated = vers.slice(skip, skip + limitNum);

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

// @desc Admin: Approve verification
// @route PUT /api/admin/verifications/:id/approve
// @access Private (Admin)
export const approveVerification = async (req, res, next) => {
  try {
    const verificationId = req.params.id;

    if (getIsConnected()) {
      const verification = await Verification.findById(verificationId);
      if (!verification) return res.status(404).json({ success: false, message: 'Verification request not found' });

      verification.status = 'verified';
      verification.reviewedBy = req.user._id;
      verification.reviewedAt = new Date();
      await verification.save();

      // Update User and Profile
      await User.findByIdAndUpdate(verification.userId, { isVerified: true });
      if (verification.type === 'creator') {
        await CreatorProfile.findOneAndUpdate({ userId: verification.userId }, { isVerified: true });
      } else {
        await ProjectProfile.findOneAndUpdate({ userId: verification.userId }, { isVerified: true });
      }

      await logAuditAction({
        actorId: req.user._id,
        action: 'VERIFICATION_APPROVE',
        entityType: 'Verification',
        entityId: verification._id,
        metadata: { userId: verification.userId, type: verification.type },
        req,
      });

      return res.json({ success: true, message: 'Verification approved successfully', data: verification });
    } else {
      memoryStore.verifications = memoryStore.verifications || [];
      const verification = memoryStore.verifications.find((v) => v._id.toString() === verificationId.toString());
      if (!verification) return res.status(404).json({ success: false, message: 'Verification request not found' });

      verification.status = 'verified';
      verification.reviewedBy = req.user._id;
      verification.reviewedAt = new Date().toISOString();

      const user = memoryStore.users.find((u) => u._id.toString() === verification.userId.toString());
      if (user) user.isVerified = true;

      await logAuditAction({
        actorId: req.user._id,
        action: 'VERIFICATION_APPROVE',
        entityType: 'Verification',
        entityId: verification._id,
        metadata: { userId: verification.userId, type: verification.type },
        req,
      });

      return res.json({ success: true, message: 'Verification approved successfully', data: verification });
    }
  } catch (error) {
    next(error);
  }
};

// @desc Admin: Reject verification
// @route PUT /api/admin/verifications/:id/reject
// @access Private (Admin)
export const rejectVerification = async (req, res, next) => {
  try {
    const verificationId = req.params.id;
    const { rejectionReason } = req.body;

    if (getIsConnected()) {
      const verification = await Verification.findById(verificationId);
      if (!verification) return res.status(404).json({ success: false, message: 'Verification request not found' });

      verification.status = 'rejected';
      verification.reviewedBy = req.user._id;
      verification.reviewedAt = new Date();
      verification.rejectionReason = rejectionReason || 'Information provided did not meet verification guidelines';
      await verification.save();

      await logAuditAction({
        actorId: req.user._id,
        action: 'VERIFICATION_REJECT',
        entityType: 'Verification',
        entityId: verification._id,
        metadata: { userId: verification.userId, rejectionReason: verification.rejectionReason },
        req,
      });

      return res.json({ success: true, message: 'Verification request rejected', data: verification });
    } else {
      memoryStore.verifications = memoryStore.verifications || [];
      const verification = memoryStore.verifications.find((v) => v._id.toString() === verificationId.toString());
      if (!verification) return res.status(404).json({ success: false, message: 'Verification request not found' });

      verification.status = 'rejected';
      verification.reviewedBy = req.user._id;
      verification.reviewedAt = new Date().toISOString();
      verification.rejectionReason = rejectionReason || 'Information provided did not meet verification guidelines';

      await logAuditAction({
        actorId: req.user._id,
        action: 'VERIFICATION_REJECT',
        entityType: 'Verification',
        entityId: verification._id,
        metadata: { userId: verification.userId, rejectionReason: verification.rejectionReason },
        req,
      });

      return res.json({ success: true, message: 'Verification request rejected', data: verification });
    }
  } catch (error) {
    next(error);
  }
};
