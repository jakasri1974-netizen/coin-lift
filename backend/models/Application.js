import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
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
    message: {
      type: String,
      default: 'Excited to collaborate on this campaign!',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications from the same creator to the same campaign
applicationSchema.index({ campaignId: 1, creatorId: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
