// In-memory database fallback store for offline development when MongoDB is not active
export const memoryStore = {
  users: [
    {
      _id: 'usr_admin_1',
      name: 'CrypLift Admin',
      email: 'admin@cryplift.io',
      password: '$2a$10$e7W5v...hash',
      role: 'admin',
      isVerified: true,
    }
  ],
  creatorProfiles: [
    {
      _id: 'cr_1',
      userId: 'usr_c1',
      displayName: 'Alex Vance',
      category: 'Web3',
      followers: '125.4K',
      rawFollowers: 125400,
      engagementRate: '6.8%',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Web3 researcher & video creator focusing on zero-knowledge technology, Layer-2 infrastructure, and DeFi.',
      web3Interests: ['Layer 2', 'DeFi', 'Zero Knowledge'],
      platforms: ['YouTube', 'X', 'Telegram'],
      rating: 4.9,
      completedCampaigns: 24,
    },
    {
      _id: 'cr_2',
      userId: 'usr_c2',
      displayName: 'Elena Rostova',
      category: 'Technology',
      followers: '210.8K',
      rawFollowers: 210800,
      engagementRate: '8.2%',
      profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
      bio: 'Tech streamer & developer building educational content around AI, decentralized systems, and Web3 tools.',
      web3Interests: ['AI Oracles', 'Developer Tools', 'Web3 UX'],
      platforms: ['YouTube', 'TikTok', 'X'],
      rating: 5.0,
      completedCampaigns: 38,
    }
  ],
  projectProfiles: [
    {
      _id: 'pr_1',
      userId: 'usr_p1',
      projectName: 'NovaX',
      tokenSymbol: 'NVX',
      category: 'Layer 2 Infrastructure',
      description: 'Next-gen zero-knowledge rollup platform empowering ultra-fast Web3 dApps with sub-cent transactions.',
      communitySize: '45.2K Members',
    }
  ],
  campaigns: [
    {
      _id: 'cmp_1',
      projectId: 'usr_p1',
      title: 'NovaX Layer-2 Growth Campaign',
      description: 'Next-gen zero-knowledge rollup platform empowering ultra-fast Web3 dApps.',
      category: 'Infrastructure',
      campaignType: 'Sponsored Content',
      budget: '3,500 - 8,000 USDC',
      status: 'active',
      compatibility: 98,
      deliverables: ['1x In-Depth YouTube Video', '2x X Threads'],
      tags: ['Infrastructure', 'ZK-Rollup', 'DeFi'],
      logoColor: 'from-cyan-500 to-blue-600',
    }
  ],
  applications: [],
  collaborations: [],
  notifications: [],
  conversations: [],
  messages: [],
  agreements: [],
  analytics: [],
  analyticsSnapshots: [],
};
