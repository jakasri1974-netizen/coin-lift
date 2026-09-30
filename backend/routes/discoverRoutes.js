import express from 'express';
import {
  discoverCreators,
  discoverProjects,
  discoverCampaigns,
} from '../controllers/discoverController.js';

const router = express.Router();

router.get('/creators', discoverCreators);
router.get('/projects', discoverProjects);
router.get('/campaigns', discoverCampaigns);

export default router;
