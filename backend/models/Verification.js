import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['creator', 'project'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    submittedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    documents: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, default: 'identity' },
      },
    ],
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

verificationSchema.index({ userId: 1, type: 1 });
verificationSchema.index({ status: 1, createdAt: -1 });

const Verification = mongoose.model('Verification', verificationSchema);
export default Verification;
