import mongoose from 'mongoose';

const campaignAnalyticsSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true,
    },
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },
    reach: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
    shares: {
      type: Number,
      default: 0,
      min: 0,
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    conversions: {
      type: Number,
      default: 0,
      min: 0,
    },
    postsPublished: {
      type: Number,
      default: 0,
      min: 0,
    },
    videosPublished: {
      type: Number,
      default: 0,
      min: 0,
    },
    storiesPublished: {
      type: Number,
      default: 0,
      min: 0,
    },
    livestreamsCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliverablesTotal: {
      type: Number,
      default: 1,
      min: 1,
    },
    deliverablesCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    engagementRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    budget: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPerClick: {
      type: Number,
      default: null,
    },
    costPerEngagement: {
      type: Number,
      default: null,
    },
    costPerThousandImpressions: {
      type: Number,
      default: null,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

campaignAnalyticsSchema.index({ campaignId: 1, collaborationId: 1 }, { unique: true });

const CampaignAnalytics = mongoose.models.CampaignAnalytics || mongoose.model('CampaignAnalytics', campaignAnalyticsSchema);

export default CampaignAnalytics;
