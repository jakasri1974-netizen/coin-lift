import React from 'react';
import Hero from '../components/Hero';
import Stats from '../components/Stats';
import HowItWorks from '../components/HowItWorks';
import PlatformRoles from '../components/PlatformRoles';
import FeaturedProjects from '../components/FeaturedProjects';
import CreatorDiscovery from '../components/CreatorDiscovery';
import DashboardPreview from '../components/DashboardPreview';
import TrustSection from '../components/TrustSection';
import WhyCrypLift from '../components/WhyCrypLift';
import CollaborationFlow from '../components/CollaborationFlow';
import CTASection from '../components/CTASection';

export default function Home({ onNavigate, onSelectProject, onSelectCreator }) {
  return (
    <main className="w-full min-h-screen">
      {/* 2. Hero Section */}
      <Hero onNavigate={onNavigate} />

      {/* 3. Trust / Platform Stats */}
      <Stats />

      {/* 4. How CrypLift Works */}
      <HowItWorks />

      {/* 5. Two-Sided Platform Section */}
      <PlatformRoles onNavigate={onNavigate} />

      {/* 6. Featured Collaborations Marketplace Preview */}
      <FeaturedProjects onSelectProject={onSelectProject} onNavigate={onNavigate} />

      {/* 7. Creator Discovery Section */}
      <CreatorDiscovery onSelectCreator={onSelectCreator} onNavigate={onNavigate} />

      {/* 8. Campaign Dashboard Preview */}
      <DashboardPreview />

      {/* 9. Transparency / Trust Section */}
      <TrustSection />

      {/* 10. Why CrypLift Section */}
      <WhyCrypLift />

      {/* 11. Collaboration Flow Visual */}
      <CollaborationFlow />

      {/* 12. CTA Section */}
      <CTASection onNavigate={onNavigate} />
    </main>
  );
}
