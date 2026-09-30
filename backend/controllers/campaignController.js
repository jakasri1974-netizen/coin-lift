import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export const getCampaigns = async (req, res, next) => {
  try {
    const {
      category,
      campaignType,
      platform,
      creatorCategory,
      status,
      search,
      keyword,
      page = 1,
      limit = 20,
    } = req.query;

    const searchTerm = search || keyword;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    if (getIsConnected()) {
      const query = {};
      if (status && status !== 'All') query.status = status;
      else if (!status) query.status = 'active';

      if (category && category !== 'All') query.category = new RegExp(category, 'i');
      if (campaignType && campaignType !== 'All') query.campaignType = new RegExp(campaignType, 'i');
      if (platform && platform !== 'All') query.preferredPlatforms = platform;
      if (creatorCategory && creatorCategory !== 'All') query.creatorCategory = new RegExp(creatorCategory, 'i');

      if (searchTerm) {
        query.$or = [
          { title: new RegExp(searchTerm, 'i') },
          { description: new RegExp(searchTerm, 'i') },
          { tags: new RegExp(searchTerm, 'i') },
        ];
      }

      const total = await Campaign.countDocuments(query);
      const campaigns = await Campaign.find(query)
        .populate('projectId', 'name email profileImage isVerified')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: campaigns.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: campaigns,
      });
    } else {
      let filtered = [...memoryStore.campaigns];
      if (status && status !== 'All') filtered = filtered.filter(c => c.status === status);
      if (category && category !== 'All') filtered = filtered.filter(c => (c.category || '').toLowerCase() === category.toLowerCase());
      if (campaignType && campaignType !== 'All') filtered = filtered.filter(c => (c.campaignType || '').toLowerCase() === campaignType.toLowerCase());
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
          (c.title || '').toLowerCase().includes(term) ||
          (c.description || '').toLowerCase().includes(term)
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

export const getCampaignById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const campaign = await Campaign.findById(req.params.id).populate('projectId', 'name email profileImage isVerified');
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      const applicationsCount = await Application.countDocuments({ campaignId: campaign._id });
      return res.json({ success: true, data: { ...campaign.toObject(), applicationsCount } });
    } else {
      const campaign = memoryStore.campaigns.find(c => (c._id || '').toString() === req.params.id.toString());
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      return res.json({ success: true, data: campaign });
    }
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      campaignType,
      budget,
      duration,
      status,
      deliverables,
      tags,
      logoColor,
    } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in required campaign fields (title, description, budget)',
      });
    }

    const processedDeliverables = Array.isArray(deliverables)
      ? deliverables
      : typeof deliverables === 'string'
      ? deliverables.split(',').map((d) => d.trim()).filter(Boolean)
      : ['1x Detailed Video Review', '2x X Threads'];

    if (getIsConnected()) {
      const campaign = await Campaign.create({
        projectId: req.user._id,
        title,
        description,
        category: category || 'Infrastructure',
        campaignType: campaignType || 'Sponsored Content',
        budget: budget || '3,000 USDC',
        duration: duration || '14 Days',
        status: status || 'active',
        deliverables: processedDeliverables,
        tags: tags || [category || 'Web3'],
        logoColor: logoColor || 'from-[#5146E5] via-[#7C3AED] to-[#A855F7]',
      });
      return res.status(201).json({
        success: true,
        message: 'Campaign created successfully',
        data: campaign,
      });
    } else {
      const newCamp = {
        _id: `cmp_${Date.now()}`,
        projectId: req.user._id,
        title,
        description,
        category: category || 'Infrastructure',
        campaignType: campaignType || 'Sponsored Content',
        budget: budget || '3,000 USDC',
        duration: duration || '14 Days',
        status: status || 'active',
        deliverables: processedDeliverables,
        tags: tags || [category || 'Web3'],
        logoColor: logoColor || 'from-[#5146E5] via-[#7C3AED] to-[#A855F7]',
      };
      memoryStore.campaigns.push(newCamp);
      return res.status(201).json({
        success: true,
        message: 'Campaign created successfully (Memory Store)',
        data: newCamp,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      let campaign = await Campaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      if (campaign.projectId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to update this campaign' });
      }
      campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.json({ success: true, message: 'Campaign updated successfully', data: campaign });
    } else {
      const camp = memoryStore.campaigns.find(c => c._id === req.params.id);
      if (!camp) return res.status(404).json({ success: false, message: 'Campaign not found' });
      Object.assign(camp, req.body);
      return res.json({ success: true, message: 'Campaign updated successfully', data: camp });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteCampaign = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
      if (campaign.projectId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this campaign' });
      }
      await campaign.deleteOne();
      return res.json({ success: true, message: 'Campaign deleted successfully' });
    } else {
      memoryStore.campaigns = memoryStore.campaigns.filter(c => c._id !== req.params.id);
      return res.json({ success: true, message: 'Campaign deleted successfully' });
    }
  } catch (error) {
    next(error);
  }
};
