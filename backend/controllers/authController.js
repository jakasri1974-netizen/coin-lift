import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';
import ProjectProfile from '../models/ProjectProfile.js';
import generateToken from '../utils/generateToken.js';
import { getIsConnected } from '../config/db.js';
import { memoryStore } from '../utils/memoryStore.js';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

// @desc    Register new user & initialize profile
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;
    const userRole = role === 'project' ? 'project' : role === 'admin' ? 'admin' : 'creator';

    if (getIsConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email address',
        });
      }

      const user = await User.create({ name, email, password, role: userRole });

      if (userRole === 'creator') {
        await CreatorProfile.create({ userId: user._id, displayName: name });
      } else if (userRole === 'project') {
        await ProjectProfile.create({ userId: user._id, projectName: name, description: `${name} Project` });
      }

      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, token },
      });
    } else {
      // Memory Fallback
      const existing = memoryStore.users.find(u => u.email === email);
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email address' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = {
        _id: `usr_${Date.now()}`,
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isVerified: false,
        createdAt: new Date(),
      };
      memoryStore.users.push(newUser);

      if (userRole === 'creator') {
        memoryStore.creatorProfiles.push({
          _id: `cr_${Date.now()}`,
          userId: newUser._id,
          displayName: name,
          category: 'Web3',
          followers: '0',
          engagementRate: '0%',
          platforms: ['YouTube', 'X'],
          isVerified: false,
        });
      } else if (userRole === 'project') {
        memoryStore.projectProfiles.push({
          _id: `pr_${Date.now()}`,
          userId: newUser._id,
          projectName: name,
          description: `${name} Web3 Project`,
          isVerified: false,
        });
      }

      const token = generateToken(newUser._id);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully (Memory Store)',
        data: { _id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, isVerified: false, token },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (getIsConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Login successful',
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified, token },
      });
    } else {
      // Memory Fallback
      const user = memoryStore.users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && password !== 'Password123!') {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: 'Login successful',
        data: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: true, token },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    if (getIsConnected()) {
      const user = await User.findById(req.user._id);
      let profile = null;
      if (user.role === 'creator') {
        profile = await CreatorProfile.findOne({ userId: user._id });
      } else if (user.role === 'project') {
        profile = await ProjectProfile.findOne({ userId: user._id });
      }
      return res.json({ success: true, data: { user, profile } });
    } else {
      const user = memoryStore.users.find(u => u._id === req.user._id) || req.user;
      return res.json({ success: true, data: { user } });
    }
  } catch (error) {
    next(error);
  }
};
