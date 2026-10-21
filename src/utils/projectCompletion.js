/**
 * Calculates dynamic Project Profile completion percentage & missing items checklist
 */
export function calculateProjectProfileCompletion(profile) {
  if (!profile) {
    return {
      percentage: 0,
      missingItems: [
        'Project Name & Category',
        'Tagline & Detailed Description',
        'Logo & Banner Images',
        'Project Type & Network Architecture',
        'Web3 Token & Whitepaper Information',
        'Website & Community Links',
        'Technology Overview & Key Features',
        'Roadmap & Milestones',
      ],
    };
  }

  const checks = [
    { name: 'Project Name & Category', valid: !!(profile.name && profile.category), weight: 15 },
    { name: 'Tagline & Detailed Description', valid: !!(profile.description && profile.description.length >= 20), weight: 15 },
    { name: 'Logo & Banner Images', valid: !!(profile.logo || profile.coverImage), weight: 10 },
    { name: 'Project Type & Network Architecture', valid: !!(profile.projectType || profile.network), weight: 10 },
    { name: 'Web3 Token & Whitepaper Information', valid: !!(profile.tokenSymbol || profile.documentationUrl || profile.whitepaperUrl), weight: 15 },
    { name: 'Website & Community Links', valid: !!(profile.website || profile.twitter || profile.discord || profile.telegram), weight: 15 },
    { name: 'Technology Overview & Key Features', valid: !!(profile.technology || (profile.keyFeatures && profile.keyFeatures.length > 0) || profile.vision), weight: 10 },
    { name: 'Roadmap & Milestones', valid: !!(profile.roadmap || (profile.achievements && Array.isArray(profile.achievements) && profile.achievements.length > 0)), weight: 10 },
  ];

  let percentage = 0;
  const missingItems = [];

  checks.forEach((item) => {
    if (item.valid) {
      percentage += item.weight;
    } else {
      missingItems.push(item.name);
    }
  });

  return {
    percentage: Math.min(100, percentage),
    missingItems,
  };
}
