import mongoose from 'mongoose';

const campaignSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a campaign title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a campaign description'],
    },
    category: {
      type: String,
      required: true,
      default: 'Infrastructure',
    },
    campaignType: {
      type: String,
      required: true,
      default: 'Sponsored Content',
    },
    requirements: {
      type: String,
      default: '',
    },
    targetAudience: {
      type: String,
      default: 'Web3 Enthusiasts & Developers',
    },
    preferredPlatforms: {
      type: [String],
      default: ['YouTube', 'X'],
    },
    creatorCategory: {
      type: String,
      default: 'Web3',
    },
    minimumFollowers: {
      type: Number,
      default: 10000,
    },
    budget: {
      type: String,
      required: [true, 'Please specify budget pool'],
      default: '3,000 USDC',
    },
    duration: {
      type: String,
      default: '14 Days',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      default: 'active',
    },
    applicationDeadline: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    compatibility: {
      type: Number,
      default: 95,
    },
    deliverables: {
      type: [String],
      default: ['1x Detailed Video Review', '2x X Threads'],
    },
    tags: {
      type: [String],
      default: ['Web3', 'DeFi'],
    },
    logoColor: {
      type: String,
      default: 'from-cyan-500 to-blue-600',
    }
  },
  {
    timestamps: true,
  }
);

// Database indexes for discovery queries and filters
campaignSchema.index({ projectId: 1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ campaignType: 1 });

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
