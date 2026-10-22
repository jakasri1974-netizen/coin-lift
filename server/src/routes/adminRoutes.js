import { Router } from 'express';
import {
  getDashboard,
  getAllUsers,
  updateUserStatus,
  getAllCreators,
  updateCreatorApproval,
  updateCreatorVerification,
  getAllProjects,
  updateProjectApproval,
  updateProjectVerification,
  getAllAdminCampaigns,
  updateAdminCampaignApproval,
  getAdminLogs,
  getAllAdminAgreements,
} from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect ALL Admin Routes with Bearer JWT Authentication and ADMIN Role Check
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// Admin Dashboard & Metrics
router.get('/dashboard', getDashboard);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Creator Moderation
router.get('/creators', getAllCreators);
router.put('/creators/:id/approval', updateCreatorApproval);
router.put('/creators/:id/verification', updateCreatorVerification);

// Project Moderation
router.get('/projects', getAllProjects);
router.put('/projects/:id/approval', updateProjectApproval);
router.put('/projects/:id/verification', updateProjectVerification);

// Campaign Moderation
router.get('/campaigns', getAllAdminCampaigns);
router.put('/campaigns/:id/approval', updateAdminCampaignApproval);

// Digital Agreements Moderation & Read-Only Visibility (Phase 10)
router.get('/agreements', getAllAdminAgreements);

// Audit Logs
router.get('/logs', getAdminLogs);

export default router;
