import CreatorProfile from '../models/CreatorProfile.js';
import User from '../models/User.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';

export const getCreators = async (req, res, next) => {
  try {
    const {
      category,
      platform,
      location,
      availability,
      minFollowers,
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
      if (category && category !== 'All') query.category = new RegExp(`^${category}$`, 'i');
      if (platform && platform !== 'All') query.platforms = platform;
      if (location && location !== 'All') query.location = new RegExp(location, 'i');
      if (availability && availability !== 'All') query.availability = availability;
      if (minFollowers) query.rawFollowers = { $gte: Number(minFollowers) };

      if (searchTerm) {
        query.$or = [
          { displayName: new RegExp(searchTerm, 'i') },
          { bio: new RegExp(searchTerm, 'i') },
          { web3Interests: new RegExp(searchTerm, 'i') },
          { location: new RegExp(searchTerm, 'i') },
          { category: new RegExp(searchTerm, 'i') },
        ];
      }

      const total = await CreatorProfile.countDocuments(query);
      const creators = await CreatorProfile.find(query)
        .populate('userId', 'name email isVerified profileImage')
        .sort('-createdAt')
        .skip(skip)
        .limit(limitNum);

      const totalPages = Math.ceil(total / limitNum) || 1;

      return res.json({
        success: true,
        count: creators.length,
        total,
        page: pageNum,
        totalPages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
        data: creators,
      });
    } else {
      let filtered = [...memoryStore.creatorProfiles];
      if (category && category !== 'All') {
        filtered = filtered.filter(c => (c.category || '').toLowerCase() === category.toLowerCase());
      }
      if (platform && platform !== 'All') {
        filtered = filtered.filter(c => (c.platforms || []).includes(platform));
      }
      if (location && location !== 'All') {
        filtered = filtered.filter(c => (c.location || '').toLowerCase().includes(location.toLowerCase()));
      }
      if (availability && availability !== 'All') {
        filtered = filtered.filter(c => c.availability === availability);
      }
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(c =>
          (c.displayName || '').toLowerCase().includes(term) ||
          (c.bio || '').toLowerCase().includes(term) ||
          (c.category || '').toLowerCase().includes(term)
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

export const getCreatorById = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const creator = await CreatorProfile.findById(req.params.id).populate('userId', 'name email isVerified profileImage');
      if (!creator) return res.status(404).json({ success: false, message: 'Creator profile not found' });
      return res.json({ success: true, data: creator });
    } else {
      const creator = memoryStore.creatorProfiles.find(c => c._id === req.params.id) || memoryStore.creatorProfiles[0];
      return res.json({ success: true, data: creator });
    }
  } catch (error) {
    next(error);
  }
};

export const getMyCreatorProfile = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      let profile = await CreatorProfile.findOne({ userId: req.user._id }).populate('userId', 'name email isVerified profileImage');
      if (!profile) {
        profile = await CreatorProfile.create({
          userId: req.user._id,
          displayName: req.user.name || 'Web3 Creator',
          category: 'Web3',
          followers: '10K',
          engagementRate: '5.0%',
        });
        profile = await CreatorProfile.findById(profile._id).populate('userId', 'name email isVerified profileImage');
      }
      return res.json({ success: true, data: profile });
    } else {
      let profile = memoryStore.creatorProfiles.find(c => c.userId === req.user._id);
      if (!profile) {
        profile = {
          _id: `cr_${Date.now()}`,
          userId: req.user._id,
          displayName: req.user.name || 'Web3 Creator',
          category: 'Web3',
          followers: '10K',
          engagementRate: '5.2%',
          availability: 'Available',
          location: 'Global',
          platforms: ['YouTube', 'X'],
        };
        memoryStore.creatorProfiles.push(profile);
      }
      return res.json({ success: true, data: profile });
    }
  } catch (error) {
    next(error);
  }
};

export const updateMyCreatorProfile = async (req, res, next) => {
  try {
    const {
      displayName,
      bio,
      profileImage,
      category,
      followers,
      rawFollowers,
      engagementRate,
      platforms,
      web3Interests,
      location,
      languages,
      portfolioUrl,
      socialLinks,
      availability,
    } = req.body;

    // Validation
    if (displayName !== undefined && (typeof displayName !== 'string' || displayName.trim().length < 2)) {
      return res.status(400).json({ success: false, message: 'Display name must be at least 2 characters long' });
    }

    if (category !== undefined) {
      const validCategories = ['Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle', 'DeFi', 'Infrastructure'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, message: `Category must be one of: ${validCategories.join(', ')}` });
      }
    }

    if (rawFollowers !== undefined && (typeof rawFollowers !== 'number' || rawFollowers < 0)) {
      return res.status(400).json({ success: false, message: 'rawFollowers must be a non-negative number' });
    }

    if (availability !== undefined) {
      const validAvail = ['Available', 'Busy', 'On Hold'];
      if (!validAvail.includes(availability)) {
        return res.status(400).json({ success: false, message: 'Availability must be Available, Busy, or On Hold' });
      }
    }

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName.trim();
    if (bio !== undefined) updates.bio = bio;
    if (profileImage !== undefined) updates.profileImage = profileImage;
    if (category !== undefined) updates.category = category;
    if (followers !== undefined) updates.followers = followers;
    if (rawFollowers !== undefined) updates.rawFollowers = rawFollowers;
    if (engagementRate !== undefined) updates.engagementRate = engagementRate;
    if (platforms !== undefined && Array.isArray(platforms)) updates.platforms = platforms;
    if (web3Interests !== undefined && Array.isArray(web3Interests)) updates.web3Interests = web3Interests;
    if (location !== undefined) updates.location = location;
    if (languages !== undefined && Array.isArray(languages)) updates.languages = languages;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
    if (socialLinks !== undefined && typeof socialLinks === 'object') updates.socialLinks = socialLinks;
    if (availability !== undefined) updates.availability = availability;

    if (getIsConnected()) {
      let profile = await CreatorProfile.findOne({ userId: req.user._id });
      if (!profile) {
        profile = new CreatorProfile({ userId: req.user._id, displayName: req.user.name || 'Web3 Creator', ...updates });
      } else {
        Object.assign(profile, updates);
      }
      await profile.save();

      // Sync name / profileImage on User if provided
      if (displayName || profileImage) {
        await User.findByIdAndUpdate(req.user._id, {
          ...(displayName ? { name: displayName.trim() } : {}),
          ...(profileImage ? { profileImage } : {}),
        });
      }

      const updatedProfile = await CreatorProfile.findById(profile._id).populate('userId', 'name email isVerified profileImage');
      return res.json({ success: true, message: 'Creator profile updated successfully', data: updatedProfile });
    } else {
      let profile = memoryStore.creatorProfiles.find(c => c.userId === req.user._id);
      if (!profile) {
        profile = { _id: `cr_${Date.now()}`, userId: req.user._id, displayName: req.user.name || 'Web3 Creator', ...updates };
        memoryStore.creatorProfiles.push(profile);
      } else {
        Object.assign(profile, updates);
      }
      return res.json({ success: true, message: 'Creator profile updated successfully', data: profile });
    }
  } catch (error) {
    next(error);
  }
};
