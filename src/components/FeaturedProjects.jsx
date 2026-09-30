import React, { useState } from 'react';
import { FEATURED_PROJECTS } from '../data/projectsData';
import { Users, Sparkles, ArrowUpRight, CheckCircle2, Filter, Layers, Zap, Flame } from 'lucide-react';

export default function FeaturedProjects({ onSelectProject, onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Infrastructure', 'Cross-Chain', 'NFT', 'AI & Data', 'Gaming', 'DeFi'];

  const filteredProjects = selectedCategory === 'All'
    ? FEATURED_PROJECTS
    : FEATURED_PROJECTS.filter(p => p.tags.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())));

  return (
    <section className="relative py-24 bg-[#F5F3FF] border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-3 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Project Marketplace Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-2 font-sans">
              Discover What's <span className="text-gradient-purple">Building</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl font-medium">
              Explore emerging projects looking for creator-led collaborations. <span className="text-purple-600 font-mono text-xs font-bold">(Demo Projects)</span>
            </p>
          </div>

          <button
            onClick={() => onNavigate('/campaigns')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-purple-200 hover:border-purple-400 text-xs font-extrabold text-purple-700 hover:text-purple-900 transition-all shadow-sm hover:shadow-md"
          >
            <span>View All Campaigns</span>
            <ArrowUpRight className="w-4 h-4 text-purple-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-white text-slate-600 border border-purple-100 hover:text-slate-900 hover:bg-purple-50'
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
              className="group relative rounded-3xl saas-card p-7 saas-card-hover flex flex-col justify-between border border-purple-100 hover:border-purple-400 transition-all duration-300"
            >
              <div>
                {/* Header: Logo + Name + Match Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${project.logoColor} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-lg font-extrabold text-slate-900 font-sans group-hover:text-purple-700 transition-colors">{project.name}</h3>
                        {project.verified && (
                          <span className="text-purple-600 text-xs font-bold" title="Verified Demo Project">✓</span>
                        )}
                      </div>
                      <span className="text-xs text-purple-600 font-mono font-semibold">{project.category}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-slate-400">Match</span>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                      {project.compatibility}%
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-6 line-clamp-2 font-medium">
                  {project.description}
                </p>

                {/* Campaign Info Pills */}
                <div className="space-y-2 mb-6 bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Community Size:</span>
                    <span className="font-extrabold text-slate-900 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-purple-600" />
                      {project.communitySize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium font-sans">Campaign Format:</span>
                    <span className="font-extrabold text-purple-700 truncate max-w-[170px]">
                      {project.campaignType}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-purple-100 shadow-2xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button & Budget */}
              <div className="pt-4 border-t border-purple-100 flex items-center justify-between gap-3">
                <span className="text-xs font-black text-emerald-700 font-mono">
                  {project.budget}
                </span>
                <button
                  onClick={() => onSelectProject(project)}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-extrabold text-xs transition-all flex items-center gap-1 border border-purple-200 group-hover:border-purple-600 shadow-xs"
                >
                  <span>View Campaign</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Demo Disclaimer */}
        <p className="text-center text-xs text-slate-400 mt-8 font-medium">
          * Example demo projects demonstrating platform layout & campaign matching.
        </p>

      </div>
    </section>
  );
}

