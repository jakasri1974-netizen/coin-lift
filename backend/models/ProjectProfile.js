import mongoose from 'mongoose';

const projectProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Layer 2 Infrastructure',
    },
    website: {
      type: String,
      default: '',
    },
    tokenSymbol: {
      type: String,
      default: '',
    },
    network: {
      type: String,
      default: 'Ethereum',
    },
    contractAddress: {
      type: String,
      default: '',
    },
    communitySize: {
      type: String,
      default: '10K Members',
    },
    socialLinks: {
      website: { type: String, default: '' },
      twitter: { type: String, default: '' },
      telegram: { type: String, default: '' },
      discord: { type: String, default: '' },
    },
    projectStage: {
      type: String,
      enum: ['Testnet', 'Mainnet', 'Alpha', 'Beta', 'Growth'],
      default: 'Mainnet',
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for discovery queries and filters
projectProfileSchema.index({ category: 1 });
projectProfileSchema.index({ network: 1 });
projectProfileSchema.index({ projectStage: 1 });

const ProjectProfile = mongoose.model('ProjectProfile', projectProfileSchema);
export default ProjectProfile;
