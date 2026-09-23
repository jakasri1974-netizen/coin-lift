import React, { useState } from 'react';
import { FEATURED_PROJECTS } from '../data/projectsData';
import { Users, Sparkles, ArrowUpRight, CheckCircle2, Filter, Layers, Zap } from 'lucide-react';

export default function FeaturedProjects({ onSelectProject, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Infrastructure', 'Cross-Chain', 'NFT', 'AI & Data', 'Gaming', 'DeFi'];

  const filteredProjects = selectedCategory === 'All'
    ? FEATURED_PROJECTS
    : FEATURED_PROJECTS.filter(p => p.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())));

  return (
    <section className="relative py-24 bg-[#05070e]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 font-sans">
              Discover What's <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Building</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl">
              Explore emerging Web3 projects looking for creator-led collaborations. <span className="text-slate-300 font-mono text-xs">(Demo Projects)</span>
            </p>
          </div>

          <button
            onClick={() => onNavigate('/campaigns')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/40 text-xs font-bold text-slate-200 hover:text-white transition-all backdrop-blur-md"
          >
            <span>View All Campaigns</span>
            <ArrowUpRight className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-md'
                  : 'bg-[#0a0e19] text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 6 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl bg-[#0a0e19] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                {/* Header: Logo + Name + Match Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.logoColor} flex items-center justify-center text-white font-extrabold text-lg shadow-md`}>
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-bold text-white font-sans">{project.name}</h3>
                        {project.verified && (
                          <span className="text-cyan-400 text-xs" title="Verified Demo Project">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-mono">{project.category}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-slate-400">Match</span>
                    <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {project.compatibility}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed mb-6 line-clamp-2">
                  {project.description}
                </p>

                {/* Campaign Info Pills */}
                <div className="space-y-2 mb-6 bg-[#070b14] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Community Size:</span>
                    <span className="font-semibold text-white flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      {project.communitySize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Campaign Format:</span>
                    <span className="font-semibold text-cyan-300 truncate max-w-[170px]">
                      {project.campaignType}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium px-2.5 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-emerald-400 font-mono">
                  {project.budget}
                </span>
                <button
                  onClick={() => onSelectProject(project)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors flex items-center gap-1 group-hover:border-cyan-400"
                >
                  <span>View Campaign</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Demo Disclaimer */}
        <p className="text-center text-[11px] text-slate-500 mt-8">
          * Example projects shown above demonstrate platform layout & campaign matching data.
        </p>

      </div>
    </section>
  );
}
