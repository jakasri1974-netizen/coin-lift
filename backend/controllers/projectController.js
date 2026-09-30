import ProjectProfile from '../models/ProjectProfile.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export const getProjects = async (req, res, next) => {
  try {
    const {
      category,
      network,
      stage,
      projectStage,
      search,
      keyword,
      page = 1,
      limit = 20,
    } = req.query;

    const searchTerm = search || keyword;
    const stageVal = stage || projectStage;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      const query = {};
      if (category && category !== 'All') query.category = new RegExp(category, 'i');
      if (network && network !== 'All') query.network = new RegExp(network, 'i');
      if (stageVal && stageVal !== 'All') query.projectStage = stageVal;

      if (searchTerm) {
        query.$or = [
          { projectName: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') },
          { tokenSymbol: new RegExp(searchTerm, 'i') },
          { category: new RegExp(searchTerm, 'i') },
          { network: new RegExp(searchTerm, 'i') },
        ];
      }

      const total = await ProjectProfile.countDocuments(query);
      const projects = await ProjectProfile.find(query)
        .populate('userId', 'name email isVerified profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: projects.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: projects,
      });
    } else {
      let filtered = [...memoryStore.projectProfiles];
      if (category && category !== 'All') {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
      }
      if (network && network !== 'All') {
        filtered = filtered.filter(p => (p.network || '').toLowerCase() === network.toLowerCase());
      }
      if (stageVal && stageVal !== 'All') {
        filtered = filtered.filter(p => p.projectStage === stageVal);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(p =>
          (p.projectName || '').toLowerCase().includes(term) ||
          (p.description || '').toLowerCase().includes(term) ||
          (p.tokenSymbol || '').toLowerCase().includes(term)
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limitNum);
      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: paginated.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: paginated,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const project = await ProjectProfile.findById(req.params.id).populate('userId', 'name email isVerified profileImage');
      if (!project) return res.status(404).json({ success: false, message: 'Project profile not found' });
      return res.json({ success: true, data: project });
    } else {
      const project = memoryStore.projectProfiles.find(p => p._id === req.params.id) || memoryStore.projectProfiles[0];
      return res.json({ success: true, data: project });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyProjectProfile = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      let profile = await ProjectProfile.findOne({ userId: req.user._id }).populate('userId', 'name email isVerified profileImage');
      if (!profile) {
        profile = await ProjectProfile.create({
          userId: req.user._id,
          projectName: req.user.name || 'Web3 Project',
          description: `${req.user.name || 'Web3'} Project Description`,
          category: 'Infrastructure',
        });
        profile = await ProjectProfile.findById(profile._id).populate('userId', 'name email isVerified profileImage');
      }
      return res.json({ success: true, data: profile });
    } else {
      let profile = memoryStore.projectProfiles.find(p => p.userId === req.user._id);
      if (!profile) {
        profile = {
          _id: `pr_${Date.now()}`,
          userId: req.user._id,
          projectName: req.user.name || 'Web3 Project',
          description: `${req.user.name || 'Web3'} Web3 Project`,
          category: 'Infrastructure',
          network: 'Ethereum',
          projectStage: 'Mainnet',
        };
        memoryStore.projectProfiles.push(profile);
      }
      return res.json({ success: true, data: profile });
    }
  } catch (error) {
    next(error);
  }
};

export const updateMyProjectProfile = async (req, res, next) => {
  try {
    const {
      projectName,
      logo,
      description,
      category,
      website,
      tokenSymbol,
      network,
      contractAddress,
      communitySize,
      socialLinks,
      projectStage,
    } = req.body;

    // Validation
    if (projectName !== undefined && (typeof projectName !== 'string' || projectName.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Project name must be at least 2 characters long' });
    }

    if (website !== undefined && website !== '') {
      if (!/^https?:\/\//i.test(website)) {
        return res.status(400).json({ success: false, message: 'Website must start with http:// or https://' });
      }
    }

    if (projectStage !== undefined) {
      const validStages = ['Testnet', 'Mainnet', 'Alpha', 'Beta', 'Growth'];
      if (!validStages.includes(projectStage)) {
        return res.status(400).json({ success: false, message: `Project stage must be one of: ${validStages.join(', ')}` });
      }
    }

    const updates = {};
    if (projectName !== undefined) updates.projectName = projectName.trim();
    if (logo !== undefined) updates.logo = logo;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (website !== undefined) updates.website = website;
    if (tokenSymbol !== undefined) updates.tokenSymbol = tokenSymbol;
    if (network !== undefined) updates.network = network;
    if (contractAddress !== undefined) updates.contractAddress = contractAddress;
    if (communitySize !== undefined) updates.communitySize = communitySize;
    if (socialLinks !== undefined && typeof socialLinks === 'object') updates.socialLinks = socialLinks;
    if (projectStage !== undefined) updates.projectStage = projectStage;

    if (getIsConnected()) {
      let profile = await ProjectProfile.findOne({ userId: req.user._id });
      if (!profile) {
        profile = new ProjectProfile({
          userId: req.user._id,
          projectName: req.user.name || 'Web3 Project',
          description: 'Project description',
          ...updates,
        });
      } else {
        Object.assign(profile, updates);
      }
      await profile.save();

      // Sync name on User if updated
      if (projectName) {
        await User.findByIdAndUpdate(req.user._id, { name: projectName.trim() });
      }

      const updatedProfile = await ProjectProfile.findById(profile._id).populate('userId', 'name email isVerified profileImage');
      return res.json({ success: true, message: 'Project profile updated successfully', data: updatedProfile });
    } else {
      let profile = memoryStore.projectProfiles.find(p => p.userId === req.user._id);
      if (!profile) {
        profile = { _id: `pr_${Date.now()}`, userId: req.user._id, projectName: req.user.name || 'Web3 Project', ...updates };
        memoryStore.projectProfiles.push(profile);
      } else {
        Object.assign(profile, updates);
      }
      return res.json({ success: true, message: 'Project profile updated successfully', data: profile });
    }
  } catch (error) {
    next(error);
  }
};
