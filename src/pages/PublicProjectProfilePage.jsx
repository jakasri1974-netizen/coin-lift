import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import {
  Building2,
  Globe,
  Twitter,
  MessageSquare,
  Send,
  Github,
  Linkedin,
  Youtube,
  FileText,
  Coins,
  Cpu,
  Layers,
  Award,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  ArrowLeft,
  Share2,
} from 'lucide-react';

export default function PublicProjectProfilePage({ projectId: propProjectId, onNavigate }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedContract, setCopiedContract] = useState(false);

  // Extract ID from URL if prop is missing
  const projectId = propProjectId || window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiRequest(`/projects/${projectId}`);
        if (res.success && res.data) {
          setProject(res.data);
        }
      } catch (err) {
        setError(err.message || 'Project profile not found or pending admin approval');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleCopyContract = () => {
    if (project?.contractAddress) {
      navigator.clipboard.writeText(project.contractAddress);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-xs font-mono text-slate-400">Loading Project Profile...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-md w-full bg-[#090e1a] border border-white/10 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Project Not Found</h2>
          <p className="text-xs text-slate-400">
            {error || 'This project profile does not exist or is currently pending admin moderation.'}
          </p>
          <button
            onClick={() => onNavigate ? onNavigate('/projects') : window.location.href = '/projects'}
            className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Discovery</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Back Link */}
        <button
          onClick={() => onNavigate ? onNavigate('/projects') : window.location.href = '/projects'}
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Approved Projects</span>
        </button>

        {/* Hero Header Card */}
        <div className="bg-[#090e1a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">

          {/* Cover Banner */}
          <div className="h-48 sm:h-64 bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 relative overflow-hidden">
            {project.coverImage ? (
              <img src={project.coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent opacity-60" />
            )}
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-8 pb-8 pt-0 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">

              <div className="flex items-end gap-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#090e1a] border-4 border-[#090e1a] shadow-2xl flex items-center justify-center font-bold text-3xl text-cyan-300 overflow-hidden bg-gradient-to-br from-cyan-500/20 to-blue-600/20 shrink-0">
                  {project.logo ? (
                    <img src={project.logo} alt={project.name} className="w-full h-full object-cover" />
                  ) : (
                    project.name?.charAt(0) || 'P'
                  )}
                </div>

                <div className="space-y-1 pb-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
                    {project.verified && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" title="Verified Web3 Project" />
                    )}
                  </div>
                  {project.tagline && <p className="text-xs sm:text-sm text-cyan-400 font-mono">{project.tagline}</p>}
                </div>
              </div>

              {/* Action Links */}
              <div className="flex items-center gap-2 shrink-0">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Website</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {project.documentationUrl && (
                  <a
                    href={project.documentationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Docs</span>
                  </a>
                )}
              </div>

            </div>

            {/* Meta Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
              <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                {project.category}
              </span>
              {project.projectType && (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {project.projectType}
                </span>
              )}
              {project.network && (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-400" />
                  <span>{project.network}</span>
                </span>
              )}
              {project.tokenSymbol && (
                <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-400" />
                  <span>${project.tokenSymbol} {project.tokenName ? `(${project.tokenName})` : ''}</span>
                </span>
              )}
              {project.location && (
                <span className="px-3 py-1 rounded-xl text-xs font-mono text-slate-400 bg-white/5 border border-white/10">
                  📍 {project.location}
                </span>
              )}
              {project.foundedYear && (
                <span className="px-3 py-1 rounded-xl text-xs font-mono text-slate-400 bg-white/5 border border-white/10">
                  Founded {project.foundedYear}
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Details & Vision */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
              <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Project Overview</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
              {project.vision && (
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 space-y-1 mt-4">
                  <h4 className="text-xs font-bold text-cyan-300">Mission & Vision</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{project.vision}</p>
                </div>
              )}
            </div>

            {/* Key Features */}
            {project.keyFeatures && project.keyFeatures.length > 0 && (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Key Features & Innovations</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {project.keyFeatures.map((feat, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-[#050811] border border-white/10 flex items-center gap-3 text-xs text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Architecture & Ecosystem */}
            {(project.technology || project.ecosystem || project.targetAudience) && (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Architecture & Ecosystem</span>
                </h2>
                {project.technology && (
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-300">Technology Architecture</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{project.technology}</p>
                  </div>
                )}
                {project.targetAudience && (
                  <div className="space-y-1 pt-2">
                    <h4 className="text-xs font-bold text-slate-300">Target Audience</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{project.targetAudience}</p>
                  </div>
                )}
              </div>
            )}

            {/* Roadmap */}
            {project.roadmap && (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Roadmap Summary</span>
                </h2>
                <div className="p-4 rounded-2xl bg-[#050811] border border-white/10 text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                  {project.roadmap}
                </div>
              </div>
            )}

            {/* Achievements */}
            {project.achievements && Array.isArray(project.achievements) && project.achievements.length > 0 && (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 sm:p-8 space-y-4">
                <h2 className="text-sm font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>Key Project Achievements</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.achievements.map((ach, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-[#050811] border border-white/10 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{ach.title}</span>
                        {ach.date && <span className="text-[10px] font-mono text-cyan-400">{ach.date}</span>}
                      </div>
                      {ach.description && <p className="text-xs text-slate-400">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Web3 Cards & Community Links */}
          <div className="space-y-6">

            {/* Smart Contract Card */}
            {project.contractAddress && (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 space-y-3 shadow-xl">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Coins className="w-4 h-4 text-cyan-400" />
                  <span>Contract Address</span>
                </h3>
                <div className="p-3 rounded-2xl bg-[#050811] border border-white/10 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-cyan-300 truncate">{project.contractAddress}</span>
                  <button
                    onClick={handleCopyContract}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
                    title="Copy Contract Address"
                  >
                    {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Social & Community Sidebar */}
            <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Community & Links
              </h3>
              <div className="space-y-2 text-xs">
                {project.website && (
                  <a
                    href={project.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold">Official Website</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.whitepaperUrl && (
                  <a
                    href={project.whitepaperUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold">Whitepaper</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.twitter && (
                  <a
                    href={project.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Twitter className="w-4 h-4 text-sky-400" />
                      <span className="font-semibold">X / Twitter</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.discord && (
                  <a
                    href={project.discord}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <MessageSquare className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold">Discord Server</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.telegram && (
                  <a
                    href={project.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Send className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold">Telegram Channel</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Github className="w-4 h-4 text-slate-300" />
                      <span className="font-semibold">GitHub Org</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}

                {project.linkedin && (
                  <a
                    href={project.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-[#050811] hover:bg-white/5 border border-white/5 flex items-center justify-between text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Linkedin className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold">LinkedIn</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </a>
                )}
              </div>
            </div>

            {/* Owner Info Sidebar */}
            <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 space-y-3 shadow-xl text-xs">
              <h3 className="font-mono font-bold text-slate-400 uppercase tracking-wider">Verification Info</h3>
              <div className="p-3 rounded-2xl bg-[#050811] border border-white/5 space-y-1">
                <p><span className="text-slate-400">Owner Contact:</span> <span className="text-white font-mono">{project.user?.email}</span></p>
                <p><span className="text-slate-400">Approval Status:</span> <span className="text-emerald-400 font-bold font-mono">APPROVED</span></p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
