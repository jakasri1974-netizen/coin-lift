import mongoose from 'mongoose';

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    analyticsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CampaignAnalytics',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    impressions: {
      type: Number,
      default: 0,
    },
    reach: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
    engagementRate: {
      type: Number,
      default: 0,
    },
    progressPercentage: {
      type: Number,
      default: 0,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

analyticsSnapshotSchema.index({ campaignId: 1, capturedAt: 1 });
analyticsSnapshotSchema.index({ collaborationId: 1, capturedAt: 1 });
analyticsSnapshotSchema.index({ creatorId: 1, capturedAt: 1 });

const AnalyticsSnapshot = mongoose.models.AnalyticsSnapshot || mongoose.model('AnalyticsSnapshot', analyticsSnapshotSchema);

export default AnalyticsSnapshot;
