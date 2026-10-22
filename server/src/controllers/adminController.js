import { adminService } from '../services/adminService.js';

export async function getDashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllUsers(req, res, next) {
  try {
    const users = await adminService.getAllUsers(req.query);
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUserStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Status must be ACTIVE or SUSPENDED' },
      });
    }

    const updatedUser = await adminService.updateUserStatus(req.params.id, status, req.user.id);
    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllCreators(req, res, next) {
  try {
    const creators = await adminService.getAllCreators(req.query);
    res.status(200).json({
      success: true,
      data: creators,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCreatorApproval(req, res, next) {
  try {
    const { approvalStatus, rejectionReason } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Approval status must be APPROVED, REJECTED, or PENDING' },
      });
    }

    const updatedCreator = await adminService.updateCreatorApproval(req.params.id, approvalStatus, req.user.id, rejectionReason);
    res.status(200).json({
      success: true,
      message: `Creator profile approval status updated to ${approvalStatus}`,
      data: updatedCreator,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCreatorVerification(req, res, next) {
  try {
    const { verified } = req.body;
    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_VERIFICATION', message: 'verified field must be a boolean' },
      });
    }

    const updatedCreator = await adminService.updateCreatorVerification(req.params.id, verified, req.user.id);
    res.status(200).json({
      success: true,
      message: `Creator profile verification updated to ${verified}`,
      data: updatedCreator,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllProjects(req, res, next) {
  try {
    const projects = await adminService.getAllProjects(req.query);
    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectApproval(req, res, next) {
  try {
    const { approvalStatus, rejectionReason } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(approvalStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Approval status must be APPROVED, REJECTED, or PENDING' },
      });
    }

    const updatedProject = await adminService.updateProjectApproval(req.params.id, approvalStatus, req.user.id, rejectionReason);
    res.status(200).json({
      success: true,
      message: `Project profile approval status updated to ${approvalStatus}`,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProjectVerification(req, res, next) {
  try {
    const { verified } = req.body;
    if (typeof verified !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_VERIFICATION', message: 'verified field must be a boolean' },
      });
    }

    const updatedProject = await adminService.updateProjectVerification(req.params.id, verified, req.user.id);
    res.status(200).json({
      success: true,
      message: `Project profile verification updated to ${verified}`,
      data: updatedProject,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllAdminCampaigns(req, res, next) {
  try {
    const campaigns = await adminService.getAllCampaigns(req.query);
    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminCampaignApproval(req, res, next) {
  try {
    const { status, approvalStatus, rejectionReason } = req.body;
    const targetStatus = status || approvalStatus;

    if (!['PUBLISHED', 'CANCELLED', 'REJECTED', 'DRAFT'].includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Status must be PUBLISHED, CANCELLED, or REJECTED' },
      });
    }

    const campaign = await adminService.updateCampaignApproval(req.params.id, targetStatus, req.user.id, rejectionReason);
    res.status(200).json({
      success: true,
      message: `Campaign status updated to ${targetStatus}`,
      data: campaign,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminLogs(req, res, next) {
  try {
    const logs = await adminService.getAdminLogs();
    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllAdminAgreements(req, res, next) {
  try {
    const agreements = await adminService.getAllAdminAgreements();
    res.status(200).json({
      success: true,
      data: agreements,
    });
  } catch (error) {
    next(error);
  }
}
