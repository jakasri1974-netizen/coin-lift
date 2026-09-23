import React from 'react';
import { Rocket, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection({ onNavigate }) {
  return (
    <section className="relative py-24 bg-[#05070e] overflow-hidden">
      
      {/* Dynamic Gradient Frame Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0d172e] via-[#091124] to-[#13112b] p-10 sm:p-16 border border-cyan-500/30 shadow-2xl text-center">
          
          {/* Ambient Glows */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Join the COINLIFT Marketplace Today</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 font-sans">
              Ready to Build Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
                Web3 Collaboration?
              </span>
            </h2>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-10">
              Connect with creators, discover emerging projects, and turn community reach into meaningful, structured collaborations.
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2 group"
              >
                <Rocket className="w-4 h-4 text-cyan-200" />
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/creators')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4 text-purple-400" />
                <span>Explore Creators</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
