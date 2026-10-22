/**
 * Calculates dynamic Creator Profile completion percentage & missing items checklist
 */
export function calculateProfileCompletion(profile) {
  if (!profile) {
    return {
      percentage: 0,
      missingItems: [
        'Display Name & Headline',
        'Bio & Overview',
        'Category & Location',
        'Profile Avatar',
        'Cover Banner Image',
        'Social Platform Links',
        'Services & Skills',
        'Portfolio Projects',
      ],
    };
  }

  const checks = [
    { name: 'Display Name & Headline', valid: !!(profile.displayName && profile.headline), weight: 15 },
    { name: 'Bio & Overview', valid: !!(profile.bio && profile.bio.length >= 20), weight: 15 },
    { name: 'Category & Location', valid: !!(profile.category && profile.location), weight: 10 },
    { name: 'Profile Avatar', valid: !!profile.profileImage, weight: 10 },
    { name: 'Cover Banner Image', valid: !!profile.coverImage, weight: 10 },
    { name: 'Social Platform Links', valid: !!(profile.youtube || profile.twitter || profile.linkedin || profile.website), weight: 15 },
    { name: 'Services & Skills', valid: !!((profile.services && profile.services.length > 0) || (profile.skills && profile.skills.length > 0)), weight: 15 },
    { name: 'Portfolio Projects', valid: !!(profile.portfolio && Array.isArray(profile.portfolio) && profile.portfolio.length > 0), weight: 10 },
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
