import { projectService } from '../services/projectService.js';

export async function getMyProfile(req, res, next) {
  try {
    const profile = await projectService.getProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'No project profile found for your account' },
      });
    }
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function createMyProfile(req, res, next) {
  try {
    const profileData = {
      ...req.body,
      userId: req.user.id,
    };
    const profile = await projectService.createProfile(profileData);
    res.status(201).json({
      success: true,
      message: 'Project profile created and queued for approval',
      data: profile,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'PROJECT_EXISTS', message: 'A project profile already exists for your account' },
      });
    }
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const profile = await projectService.updateProfileByUserId(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Project profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitMyProfile(req, res, next) {
  try {
    const profile = await projectService.submitProfileForApproval(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Project profile submitted for Admin approval',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function createProjectProfile(req, res, next) {
  return createMyProfile(req, res, next);
}

export async function getAllProjectProfiles(req, res, next) {
  try {
    const profiles = await projectService.getAllProfiles(req.query);
    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
}

export async function getProjectProfileById(req, res, next) {
  try {
    const profile = await projectService.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROJECT_NOT_FOUND', message: 'Project profile not found' },
      });
    }

    // Public Approval Visibility Rule (Section 8 & 14)
    const isOwner = req.user && req.user.id === profile.userId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (profile.approvalStatus !== 'APPROVED' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROJECT_NOT_APPROVED', message: 'This project profile is pending admin approval' },
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}
