import { applicationService } from '../services/applicationService.js';
import { prisma } from '../config/db.js';

export async function createApplication(req, res, next) {
  try {
    const userCreator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userCreator) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_CREATOR_PROFILE',
          message: 'You must create a Creator Profile before applying to campaigns',
        },
      });
    }

    const applicationData = {
      ...req.body,
      creatorId: userCreator.id,
    };

    const application = await applicationService.createApplication(applicationData);
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: 'APPLICATION_ERROR', message: error.message },
      });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_APPLICATION',
          message: 'You have already submitted an application for this campaign',
        },
      });
    }
    if (error.code === 'P2003') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CAMPAIGN_NOT_FOUND',
          message: 'Referenced Campaign ID does not exist',
        },
      });
    }
    next(error);
  }
}

export async function getMyApplications(req, res, next) {
  try {
    const userCreator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userCreator) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const applications = await applicationService.getMyApplications(userCreator.id);
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
}

export async function withdrawApplication(req, res, next) {
  try {
    const userCreator = await prisma.creatorProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!userCreator) {
      return res.status(403).json({
        success: false,
        error: { code: 'NO_CREATOR_PROFILE', message: 'Creator Profile required' },
      });
    }

    const application = await applicationService.withdrawApplication(req.params.id, userCreator.id);
    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully',
      data: application,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: 'APPLICATION_ERROR', message: error.message },
      });
    }
    next(error);
  }
}

export async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const application = await applicationService.updateApplicationStatus(req.params.id, req.user.id, status);
    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: application,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: { code: 'APPLICATION_ERROR', message: error.message },
      });
    }
    next(error);
  }
}

export async function getAllApplications(req, res, next) {
  try {
    const applications = await applicationService.getAllApplications(req.query);
    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
}

export async function getApplicationById(req, res, next) {
  try {
    const application = await applicationService.getApplicationById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: { code: 'APPLICATION_NOT_FOUND', message: 'Application not found' },
      });
    }

    // Security Guard: Check if requesting user is applicant creator, project owner, or admin
    const userCreator = req.user ? await prisma.creatorProfile.findUnique({ where: { userId: req.user.id } }) : null;
    const userProject = req.user ? await prisma.projectProfile.findUnique({ where: { userId: req.user.id } }) : null;
    const isApplicant = userCreator && userCreator.id === application.creatorId;
    const isProjectOwner = userProject && userProject.id === application.campaign.projectId;
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (!isApplicant && !isProjectOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have access to view this application' },
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    next(error);
  }
}
