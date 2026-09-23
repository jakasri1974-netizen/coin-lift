import React, { useState } from 'react';
import { FEATURED_PROJECTS } from '../data/projectsData';
import { Search, Filter, Layers, Sparkles, ArrowUpRight, Plus, CheckCircle2 } from 'lucide-react';

export default function ProjectsPage({ onSelectProject, onNavigate }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tags = ['All', 'Infrastructure', 'Cross-Chain', 'NFT', 'DeAI', 'Gaming', 'DeFi'];

  const filteredProjects = FEATURED_PROJECTS.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || project.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()));
    return matchesSearch && matchesTag;
  });

  const handleSubmitCampaign = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowSubmissionModal(false);
      setSubmitted(false);
    }, 1500);
  };

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-4">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Token Projects Directory</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2 font-sans">
              Emerging Web3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Ecosystems</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl">
              Discover token projects actively looking for creator-led content, community reach, and marketing campaigns.
            </p>
          </div>

          <button
            onClick={() => setShowSubmissionModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>List Your Project</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-[#0b0f19] p-6 rounded-2xl border border-white/10 mb-10 space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search projects by name, category, or technology..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#05070e] text-sm text-white pl-11 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none">
              {tags.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTag(t)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedTag === t
                      ? 'bg-cyan-500 text-black font-bold shadow-md'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group relative rounded-2xl bg-[#090d18] p-6 border border-white/10 hover:border-cyan-500/40 transition-all duration-300 shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${project.logoColor} flex items-center justify-center text-white font-extrabold text-lg shadow-md`}>
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white font-sans">{project.name}</h3>
                      <span className="text-xs text-slate-400 font-mono">{project.category}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    {project.compatibility}% Match
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {project.description}
                </p>

                <div className="space-y-2 mb-6 bg-[#05070e] p-3 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Community Reach:</span>
                    <span className="font-bold text-white">{project.communitySize}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Budget Pool:</span>
                    <span className="font-bold text-emerald-400 font-mono">{project.budget}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-[11px] text-cyan-300 font-semibold">{project.campaignType}</span>
                <button
                  onClick={() => onSelectProject(project)}
                  className="px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <span>View Details</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* List Project Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#090e1a] border border-white/10 p-6 sm:p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 font-sans">List Your Token Project</h3>
            <p className="text-xs text-slate-400 mb-6">Create a campaign brief to connect with vetted Web3 content creators.</p>

            {submitted ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-white">Campaign Submitted!</h4>
                <p className="text-xs text-slate-400">Our team is reviewing your project details. You will receive creator match alerts shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitCampaign} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Project Name</label>
                  <input type="text" required placeholder="e.g. ApexChain" className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500" />
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Category</label>
                  <select className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500">
                    <option>Layer 1 / Layer 2</option>
                    <option>DeFi Infrastructure</option>
                    <option>Web3 Gaming & Metaverse</option>
                    <option>AI & Data Oracles</option>
                    <option>NFT & Creator Economy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300 font-semibold block mb-1">Campaign Budget (USDC)</label>
                  <input type="text" required placeholder="e.g. 5,000 USDC" className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500" />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowSubmissionModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20"
                  >
                    Submit Campaign
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
