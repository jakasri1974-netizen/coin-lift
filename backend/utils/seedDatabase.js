import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import CreatorProfile from '../models/CreatorProfile.js';
import ProjectProfile from '../models/ProjectProfile.js';
import Campaign from '../models/Campaign.js';
import Application from '../models/Application.js';
import Collaboration from '../models/Collaboration.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return;
    }
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('[Seed] Database already contains data. Skipping initial auto-seed.');
      return;
    }

    console.log('[Seed] Populating MongoDB with initial demo data...');

    // 1. Create Admin User
    const adminUser = await User.create({
      name: 'CrypLift Admin',
      email: 'admin@cryplift.io',
      password: 'Password123!',
      role: 'admin',
      isVerified: true,
    });

    // 2. Create 5 Demo Creators
    const creatorData = [
      {
        name: 'Alex Vance',
        email: 'vance@cryplift.demo',
        category: 'Web3',
        followers: '125.4K',
        rawFollowers: 125400,
        engagementRate: '6.8%',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        bio: 'Web3 researcher & video creator focusing on zero-knowledge technology, Layer-2 infrastructure, and DeFi.',
        web3Interests: ['Layer 2', 'DeFi', 'Zero Knowledge'],
        platforms: ['YouTube', 'X', 'Telegram'],
        rating: 4.9,
      },
      {
        name: 'Elena Rostova',
        email: 'elena@cryplift.demo',
        category: 'Technology',
        followers: '210.8K',
        rawFollowers: 210800,
        engagementRate: '8.2%',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
        bio: 'Tech streamer & developer building educational content around AI, decentralized systems, and Web3 tools.',
        web3Interests: ['AI Oracles', 'Developer Tools', 'Web3 UX'],
        platforms: ['YouTube', 'TikTok', 'X'],
        rating: 5.0,
      },
      {
        name: 'Marcus Chen',
        email: 'marcus@cryplift.demo',
        category: 'Gaming',
        followers: '89.2K',
        rawFollowers: 89200,
        engagementRate: '11.4%',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        bio: 'Competitive gamer and Web3 gaming analyst hosting live alpha sessions and tournaments.',
        web3Interests: ['Web3 Gaming', 'NFT Guilds', 'Esports'],
        platforms: ['Twitch', 'YouTube', 'Discord'],
        rating: 4.8,
      },
      {
        name: 'Sarah Jenkins',
        email: 'sarah@cryplift.demo',
        category: 'Finance',
        followers: '175.0K',
        rawFollowers: 175000,
        engagementRate: '5.4%',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
        bio: 'Financial educator breaking down complex tokenomics and sustainable yield mechanisms.',
        web3Interests: ['Tokenomics', 'Staking Pools', 'Asset Bridges'],
        platforms: ['YouTube', 'X', 'Substack'],
        rating: 4.9,
      },
      {
        name: 'Devon Knight',
        email: 'devon@cryplift.demo',
        category: 'Education',
        followers: '64.5K',
        rawFollowers: 64500,
        engagementRate: '9.1%',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        bio: 'Simplifying Web3 concepts for mainstream audiences with infographics and beginner guides.',
        web3Interests: ['Blockchain 101', 'Governance', 'DAOs'],
        platforms: ['X', 'YouTube', 'TikTok'],
        rating: 4.7,
      }
    ];

    const createdCreators = [];
    for (const c of creatorData) {
      const u = await User.create({
        name: c.name,
        email: c.email,
        password: 'Password123!',
        role: 'creator',
        profileImage: c.avatar,
        isVerified: true,
      });

      const p = await CreatorProfile.create({
        userId: u._id,
        displayName: c.name,
        bio: c.bio,
        profileImage: c.avatar,
        category: c.category,
        followers: c.followers,
        rawFollowers: c.rawFollowers,
        engagementRate: c.engagementRate,
        platforms: c.platforms,
        web3Interests: c.web3Interests,
        rating: c.rating,
        completedCampaigns: 12 + Math.floor(Math.random() * 20),
      });

      createdCreators.push({ user: u, profile: p });
    }

    // 3. Create 5 Demo Projects
    const projectData = [
      {
        name: 'NovaX Foundation',
        email: 'novax@cryplift.demo',
        projectName: 'NovaX',
        symbol: 'NVX',
        category: 'Layer 2 Infrastructure',
        description: 'Next-gen zero-knowledge rollup platform empowering ultra-fast Web3 dApps with sub-cent transactions.',
        communitySize: '45.2K Members',
        budget: '3,500 - 8,000 USDC',
        deliverables: ['1x In-Depth YouTube Video', '2x X Threads'],
        tags: ['Infrastructure', 'ZK-Rollup', 'DeFi'],
        logoColor: 'from-cyan-500 to-blue-600',
      },
      {
        name: 'OrbitLayer Labs',
        email: 'orbit@cryplift.demo',
        projectName: 'OrbitLayer',
        symbol: 'ORBT',
        category: 'Cross-Chain Protocol',
        description: 'Decentralized interoperability bridge allowing seamless asset transfers across 15+ major EVM chains.',
        communitySize: '32.8K Members',
        budget: '2,000 - 5,000 USDC',
        deliverables: ['3x Educational Threads', 'Infographic Banner'],
        tags: ['Cross-Chain', 'Interoperability', 'Bridges'],
        logoColor: 'from-purple-500 to-indigo-600',
      },
      {
        name: 'FluxMint Ecosystem',
        email: 'flux@cryplift.demo',
        projectName: 'FluxMint',
        symbol: 'FLUX',
        category: 'Creator Economy / NFT',
        description: 'Dynamic NFT minting and royalty redistribution infrastructure built for Web3 digital artists & streamers.',
        communitySize: '28.4K Members',
        budget: '1,500 - 4,000 USDC',
        deliverables: ['Live Twitch Showcase', 'Dedicated Mint Giveaway'],
        tags: ['NFT Tooling', 'Creators', 'Solana'],
        logoColor: 'from-emerald-400 to-teal-600',
      },
      {
        name: 'ChainNova DeAI',
        email: 'chainnova@cryplift.demo',
        projectName: 'ChainNova',
        symbol: 'CNVA',
        category: 'AI & Data Oracle',
        description: 'Verifiable AI data feed oracle powering decentralized prediction markets and autonomous Web3 agents.',
        communitySize: '58.1K Members',
        budget: '4,000 - 10,000 USDC',
        deliverables: ['Podcast Interview', 'Substack Article'],
        tags: ['DeAI', 'Oracles', 'Data'],
        logoColor: 'from-blue-600 to-violet-600',
      },
      {
        name: 'MetaPulse Gaming',
        email: 'metapulse@cryplift.demo',
        projectName: 'MetaPulse',
        symbol: 'PULSE',
        category: 'Web3 Gaming Ecosystem',
        description: 'Immersive open-world RPG powered by player-owned assets, skill tournaments, and community governance.',
        communitySize: '72.9K Members',
        budget: '3,000 - 7,500 USDC',
        deliverables: ['1-Hour Gameplay Stream', 'Shorts/Reels Spotlight'],
        tags: ['Gaming', 'P2E', 'Esports'],
        logoColor: 'from-fuchsia-500 to-pink-600',
      }
    ];

    const createdProjects = [];
    for (const p of projectData) {
      const u = await User.create({
        name: p.name,
        email: p.email,
        password: 'Password123!',
        role: 'project',
        isVerified: true,
      });

      const prof = await ProjectProfile.create({
        userId: u._id,
        projectName: p.projectName,
        description: p.description,
        category: p.category,
        tokenSymbol: p.symbol,
        communitySize: p.communitySize,
      });

      createdProjects.push({ user: u, profile: prof, meta: p });
    }

    // 4. Create Demo Campaigns
    const createdCampaigns = [];
    for (const proj of createdProjects) {
      const camp = await Campaign.create({
        projectId: proj.user._id,
        title: `${proj.meta.projectName} Creator Growth Campaign`,
        description: proj.meta.description,
        category: proj.meta.category,
        campaignType: 'Sponsored Content',
        budget: proj.meta.budget,
        compatibility: 95,
        deliverables: proj.meta.deliverables,
        tags: proj.meta.tags,
        logoColor: proj.meta.logoColor,
        status: 'active',
      });
      createdCampaigns.push(camp);
    }

    // 5. Create Sample Applications & Collaborations
    if (createdCampaigns.length > 0 && createdCreators.length > 0) {
      // Application 1 (Accepted -> Collaboration)
      const app1 = await Application.create({
        campaignId: createdCampaigns[0]._id,
        creatorId: createdCreators[0].user._id,
        projectId: createdProjects[0].user._id,
        message: 'I have 125K Web3 subscribers and would love to cover NovaX ZK-rollup tech.',
        status: 'accepted',
      });

      await Collaboration.create({
        applicationId: app1._id,
        campaignId: createdCampaigns[0]._id,
        creatorId: createdCreators[0].user._id,
        projectId: createdProjects[0].user._id,
        status: 'active',
        progress: 75,
        deliverables: createdCampaigns[0].deliverables,
        performance: {
          views: 42800,
          likes: 3120,
          comments: 480,
          shares: 290,
          clicks: 1450,
          reach: '42.8K',
          engagement: '7.4%',
        }
      });

      // Application 2 (Pending)
      await Application.create({
        campaignId: createdCampaigns[1]._id,
        creatorId: createdCreators[1].user._id,
        projectId: createdProjects[1].user._id,
        message: 'Looking forward to writing deep-dive threads on OrbitLayer cross-chain bridge.',
        status: 'pending',
      });
    }

    console.log('[Seed] Database seeded successfully!');
  } catch (error) {
    console.error('[Seed Error]', error);
  }
};

if (process.argv[2] === '--run') {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coinlift').then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}
