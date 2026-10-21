import { creatorService } from '../services/creatorService.js';

export async function getMyProfile(req, res, next) {
  try {
    const profile = await creatorService.getProfileByUserId(req.user.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'No creator profile found for your account' },
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
    const profile = await creatorService.createProfile(profileData);
    res.status(201).json({
      success: true,
      message: 'Creator profile created and queued for approval',
      data: profile,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'PROFILE_EXISTS', message: 'A creator profile already exists for your account' },
      });
    }
    next(error);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const profile = await creatorService.updateProfileByUserId(req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Creator profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function submitMyProfile(req, res, next) {
  try {
    const profile = await creatorService.submitProfileForApproval(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Profile submitted for Admin approval',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllCreatorProfiles(req, res, next) {
  try {
    const profiles = await creatorService.getAllProfiles(req.query);
    res.status(200).json({
      success: true,
      data: profiles,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCreatorProfileById(req, res, next) {
  try {
    const profile = await creatorService.getProfileById(req.params.id);
    if (!profile) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_FOUND', message: 'Creator profile not found' },
      });
    }

    // Public Approval Visibility Rule (Section 14)
    const isOwner = req.user && req.user.id === profile.userId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (profile.approvalStatus !== 'APPROVED' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        error: { code: 'PROFILE_NOT_APPROVED', message: 'This creator profile is pending admin approval' },
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
