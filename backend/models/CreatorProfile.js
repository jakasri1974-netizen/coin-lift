import mongoose from 'mongoose';

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle', 'DeFi', 'Infrastructure'],
      default: 'Web3',
    },
    followers: {
      type: String,
      default: '0',
    },
    rawFollowers: {
      type: Number,
      default: 0,
    },
    engagementRate: {
      type: String,
      default: '0%',
    },
    platforms: {
      type: [String],
      enum: ['YouTube', 'Instagram', 'X', 'TikTok', 'LinkedIn', 'Telegram', 'Discord', 'Twitch', 'Substack'],
      default: ['YouTube', 'X'],
    },
    web3Interests: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: 'Global',
    },
    languages: {
      type: [String],
      default: ['English'],
    },
    portfolioUrl: {
      type: String,
      default: '',
    },
    socialLinks: {
      youtube: { type: String, default: '' },
      twitter: { type: String, default: '' },
      telegram: { type: String, default: '' },
      discord: { type: String, default: '' },
      github: { type: String, default: '' },
    },
    availability: {
      type: String,
      enum: ['Available', 'Busy', 'On Hold'],
      default: 'Available',
    },
    rating: {
      type: Number,
      default: 5.0,
    },
    completedCampaigns: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Database indexes for discovery queries and filters
creatorProfileSchema.index({ category: 1 });
creatorProfileSchema.index({ location: 1 });
creatorProfileSchema.index({ availability: 1 });
creatorProfileSchema.index({ rawFollowers: -1 });

const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema);
export default CreatorProfile;
