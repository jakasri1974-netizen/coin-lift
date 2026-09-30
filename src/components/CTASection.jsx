import React from 'react';
import { Rocket, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection({ onNavigate }) {
  return (
    <section className="relative py-24 bg-white overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#2E1065] via-[#5B21B6] via-[#7C3AED] to-[#C026D3] p-10 sm:p-20 border border-purple-300/30 shadow-2xl shadow-purple-900/20 text-center">
          
          {/* Floating Abstract Shapes in Background */}
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-pink-500/30 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-violet-400/30 rounded-full blur-[100px] pointer-events-none animate-pulse-glow" />
          <div className="absolute inset-0 bg-grid-white opacity-15 pointer-events-none" />

          {/* Floating Geometric Orbs */}
          <div className="absolute top-10 right-10 w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 animate-float-slow hidden md:block" />
          <div className="absolute bottom-10 left-10 w-20 h-20 rounded-full bg-pink-400/20 backdrop-blur-md border border-pink-300/30 animate-float-delayed hidden md:block" />

          <div className="relative z-10 max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-pill-dark text-purple-100 text-xs font-extrabold mb-6 shadow-lg border border-purple-200/30">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>Join the CrypLift Marketplace Today</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-white tracking-tight mb-6 font-sans">
              Ready to Lift Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-100 to-indigo-200 drop-shadow-sm">
                Web3 Collaboration?
              </span>
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-purple-100/90 leading-relaxed mb-10 max-w-2xl mx-auto font-medium">
              Connect with creators, discover emerging projects and build meaningful community-driven campaigns.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white text-purple-900 font-extrabold text-sm shadow-xl hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group hover:-translate-y-0.5"
              >
                <Rocket className="w-4 h-4 text-purple-700" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-purple-700" />
              </button>

              <button
                onClick={() => onNavigate('/creators')}
                className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md hover:-translate-y-0.5 shadow-lg"
              >
                <Users className="w-4 h-4 text-pink-300" />
                <span>Explore Creators</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}

