import { z } from 'zod';

// Public Registration Validation Schema (STRICT: Public users CANNOT register as ADMIN)
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['CREATOR', 'PROJECT_OWNER'], {
    errorMap: () => ({ message: 'Public registration only permits CREATOR or PROJECT_OWNER role' }),
  }).default('CREATOR'),
});

// Login Validation Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

// Legacy User Creation Schema
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role: z.enum(['CREATOR', 'PROJECT_OWNER', 'ADMIN']).default('CREATOR'),
});

// Portfolio Item Schema
const portfolioItemSchema = z.object({
  title: z.string().min(2, 'Project title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  url: z.string().url('Invalid URL format').optional().or(z.literal('')),
  platform: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL format').optional().or(z.literal('')),
});

// Creator Profile Validation Schemas
export const createCreatorProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name is required'),
  headline: z.string().optional(),
  bio: z.string().optional(),
  profileImage: z.string().url('Invalid profile image URL').optional().or(z.literal('')),
  coverImage: z.string().url('Invalid cover image URL').optional().or(z.literal('')),
  location: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  availability: z.string().optional().default('Available'),
  youtube: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  discord: z.string().optional(),
  website: z.string().optional(),
  services: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  portfolio: z.array(portfolioItemSchema).optional(),
  followersCount: z.number().int().nonnegative().optional().default(0),
  engagementRate: z.number().nonnegative().optional().default(0.0),
});

export const updateCreatorProfileSchema = createCreatorProfileSchema.partial();

// Project Profile Validation Schemas
export const createProjectProfileSchema = z.object({
  name: z.string().min(2, 'Project name is required'),
  tagline: z.string().optional(),
  logo: z.string().optional().or(z.literal('')),
  coverImage: z.string().optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  category: z.string().min(1, 'Category is required'),
  projectType: z.string().optional(),
  location: z.string().optional(),
  foundedYear: z.string().optional(),
  network: z.string().optional(),
  contractAddress: z.string().optional(),
  tokenName: z.string().optional(),
  tokenSymbol: z.string().optional(),
  tokenWebsite: z.string().optional().or(z.literal('')),
  documentationUrl: z.string().optional().or(z.literal('')),
  whitepaperUrl: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  discord: z.string().optional().or(z.literal('')),
  telegram: z.string().optional().or(z.literal('')),
  github: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
  medium: z.string().optional().or(z.literal('')),
  vision: z.string().optional(),
  keyFeatures: z.array(z.string()).optional().default([]),
  technology: z.string().optional(),
  ecosystem: z.string().optional(),
  targetAudience: z.string().optional(),
  roadmap: z.string().optional(),
  teamInfo: z.string().optional(),
  achievements: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string().optional(),
  })).optional(),
});

export const updateProjectProfileSchema = createProjectProfileSchema.partial();

// Campaign Validation Schemas
export const createCampaignSchema = z.object({
  projectId: z.string().uuid('Invalid Project Profile ID format').optional(),
  title: z.string().min(3, 'Campaign title is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  budget: z.number().positive('Budget must be a positive number'),
  currency: z.string().default('USDC'),
  deliverables: z.preprocess(
    (val) => {
      if (typeof val === 'string') {
        return val.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      }
      return val;
    },
    z.array(z.string().min(1, 'Deliverable cannot be empty')).min(1, 'At least one deliverable is required')
  ),
  requirements: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const updateCampaignSchema = createCampaignSchema.partial();

// Application Validation Schemas
export const createApplicationSchema = z.object({
  campaignId: z.string().uuid('Invalid Campaign ID format'),
  proposal: z.string().min(10, 'Proposal message must be at least 10 characters long'),
  proposedDeliverables: z.array(z.string()).optional().default([]),
  proposedRate: z.number().positive('Proposed rate must be positive').optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be ACCEPTED or REJECTED' }),
  }),
});

// Campaign Invitation Validation Schema (Project Owner inviting Creator)
export const inviteCreatorSchema = z.object({
  creatorId: z.string({ required_error: 'Creator ID is required' }).min(1, 'Creator ID cannot be empty'),
  campaignId: z.string().min(1, 'Campaign ID cannot be empty').optional(),
  message: z.string().max(1000, 'Invitation message cannot exceed 1000 characters').optional(),
  proposedRate: z.number().positive('Proposed rate must be positive').optional(),
  proposedDeliverables: z.array(z.string()).optional(),
});

// Collaboration & Messaging Validation Schemas
export const sendMessageSchema = z.object({
  content: z.string({ required_error: 'Content is required' })
    .trim()
    .min(1, 'Message content cannot be empty')
    .max(3000, 'Message content cannot exceed 3000 characters'),
});

export const updateCollaborationStatusSchema = z.object({
  status: z.enum(['COMPLETED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Collaboration status must be COMPLETED or CANCELLED' }),
  }),
});

// Phase 10: Digital Agreement Validation Schemas
export const createAgreementSchema = z.object({
  title: z.string({ required_error: 'Agreement title is required' })
    .trim()
    .min(3, 'Agreement title must be at least 3 characters long')
    .max(150, 'Agreement title cannot exceed 150 characters'),
  scope: z.string({ required_error: 'Scope and terms are required' })
    .trim()
    .min(10, 'Scope must be at least 10 characters long'),
  deliverables: z.array(z.string().trim().min(1, 'Deliverable cannot be empty'))
    .min(1, 'At least one deliverable is required'),
  rate: z.number({ required_error: 'Agreed rate is required' })
    .positive('Rate must be a positive number'),
  currency: z.string().trim().default('USDC'),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
});

export const updateAgreementSchema = createAgreementSchema.partial();

export const rejectAgreementSchema = z.object({
  rejectionReason: z.string({ required_error: 'Rejection reason is required' })
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters long')
    .max(1000, 'Rejection reason cannot exceed 1000 characters'),
});
