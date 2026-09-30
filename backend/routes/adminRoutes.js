import express from 'express';
import {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  updateUserStatus,
  getAllCreators,
  getAllProjects,
  getAllCampaigns,
  getAllApplications,
  createReport,
  getReports,
  updateReportStatus,
  getAuditLogs,
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Report creation (Authenticated users can submit reports)
router.post('/reports', protect, createReport);

// All other admin routes require role = 'admin'
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/statistics', getAdminDashboard);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/status', updateUserStatus);
router.get('/creators', getAllCreators);
router.get('/projects', getAllProjects);
router.get('/campaigns', getAllCampaigns);
router.get('/applications', getAllApplications);
router.get('/reports', getReports);
router.put('/reports/:id', updateReportStatus);
router.get('/audit-logs', getAuditLogs);

export default router;
