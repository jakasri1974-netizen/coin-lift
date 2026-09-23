import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Users, Layers, Zap, ExternalLink, MessageSquare } from 'lucide-react';

export default function ProjectModal({ project, onClose, onApply }) {
  const [applied, setApplied] = useState(false);

  if (!project) return null;

  const handleApplyClick = () => {
    setApplied(true);
    setTimeout(() => {
      onApply && onApply(project);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#090e1a] border border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${project.logoColor} flex items-center justify-center text-white font-extrabold text-2xl shadow-lg`}>
            {project.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-extrabold text-white font-sans">{project.name}</h3>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {project.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{project.category}</p>
          </div>
        </div>

        {/* Overview section */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Project Description</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-[#05070e] p-4 rounded-xl border border-white/5">
              {project.description}
            </p>
          </div>

          {/* Key Campaign Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Community Reach</span>
              <span className="text-sm font-bold text-white font-mono flex items-center gap-1 mt-1">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                {project.communitySize}
              </span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Campaign Pool</span>
              <span className="text-sm font-bold text-emerald-400 font-mono mt-1 block">
                {project.budget}
              </span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase block">Creator Match</span>
              <span className="text-sm font-bold text-cyan-300 font-mono mt-1 block">
                {project.compatibility}% Compatibility
              </span>
            </div>
          </div>

          {/* Deliverables Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 font-mono">Required Deliverables</h4>
            <div className="space-y-2">
              {project.deliverables?.map((item) => (
                <div key={item} className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-xs font-medium px-3 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                #{tag}
              </span>
            ))}
          </div>

          {/* CTA Action */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-mono">Escrow Protected Campaign</span>
            
            {applied ? (
              <div className="px-6 py-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Application Submitted!</span>
              </div>
            ) : (
              <button
                onClick={handleApplyClick}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center gap-2"
              >
                <span>Apply as Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
