import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import adminRoutes from './adminRoutes.js';
import userRoutes from './userRoutes.js';
import creatorRoutes from './creatorRoutes.js';
import projectRoutes from './projectRoutes.js';
import campaignRoutes from './campaignRoutes.js';
import applicationRoutes from './applicationRoutes.js';
import collaborationRoutes from './collaborationRoutes.js';
import agreementRoutes from './agreementRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/users', userRoutes);
router.use('/creators', creatorRoutes);
router.use('/projects', projectRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/applications', applicationRoutes);
router.use('/collaborations', collaborationRoutes);
router.use('/agreements', agreementRoutes);

export default router;
