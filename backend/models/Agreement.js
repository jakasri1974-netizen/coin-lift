import mongoose from 'mongoose';

const deliverableSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'youtube_video',
        'youtube_short',
        'instagram_post',
        'instagram_reel',
        'x_post',
        'article',
        'livestream',
        'custom',
      ],
      default: 'custom',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    platform: {
      type: String,
      default: 'General',
      trim: true,
    },
  },
  { _id: true }
);

const agreementSchema = new mongoose.Schema(
  {
    collaborationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collaboration',
      required: true,
      index: true,
    },
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    deliverables: {
      type: [deliverableSchema],
      default: [],
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    deadline: {
      type: Date,
      default: null,
    },
    budget: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USDC',
      trim: true,
    },
    paymentTerms: {
      type: String,
      default: 'Payment released upon deliverable completion and approval.',
      trim: true,
    },
    contentRights: {
      type: String,
      default: 'Project is granted non-exclusive promotional distribution rights across official channels for 90 days.',
      trim: true,
    },
    revisionTerms: {
      type: String,
      default: 'Up to 2 revision rounds included for compliance and brand accuracy.',
      trim: true,
    },
    cancellationTerms: {
      type: String,
      default: 'Either party may request cancellation before content submission with written notice.',
      trim: true,
    },
    additionalTerms: {
      type: String,
      default: 'This agreement records the terms accepted by both parties. Users are responsible for ensuring terms suit their jurisdiction.',
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'draft',
        'pending_creator',
        'pending_project',
        'active',
        'rejected',
        'cancelled',
        'completed',
      ],
      default: 'pending_creator',
      index: true,
    },
    creatorAccepted: {
      type: Boolean,
      default: false,
    },
    projectAccepted: {
      type: Boolean,
      default: false,
    },
    creatorAcceptedAt: {
      type: Date,
      default: null,
    },
    projectAcceptedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
    },
    previousVersionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agreement',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

agreementSchema.index({ collaborationId: 1, status: 1 });
agreementSchema.index({ projectId: 1, status: 1 });
agreementSchema.index({ creatorId: 1, status: 1 });

const Agreement = mongoose.model('Agreement', agreementSchema);
export default Agreement;
