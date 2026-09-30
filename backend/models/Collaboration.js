import mongoose from 'mongoose';

const collaborationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'in_progress', 'completed', 'cancelled'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    deliverables: {
      type: [String],
      default: ['1x YouTube Review Video', '2x Educational X Threads'],
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    performance: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      reach: { type: String, default: '0' },
      engagement: { type: String, default: '0%' },
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for fast querying
collaborationSchema.index({ applicationId: 1 });
collaborationSchema.index({ creatorId: 1 });
collaborationSchema.index({ projectId: 1 });
collaborationSchema.index({ status: 1 });

const Collaboration = mongoose.model('Collaboration', collaborationSchema);
export default Collaboration;
