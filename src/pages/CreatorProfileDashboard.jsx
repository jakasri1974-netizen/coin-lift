import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { calculateProfileCompletion } from '../utils/profileCompletion';
import {
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  Save,
  Globe,
  Youtube,
  Twitter,
  Linkedin,
  Instagram,
  MessageSquare,
  Award,
  Briefcase,
} from 'lucide-react';

export default function CreatorProfileDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Form State
  const [displayName, setDisplayName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [category, setCategory] = useState('Web3 Creator');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('Available');
  const [profileImage, setProfileImage] = useState('');
  const [coverImage, setCoverImage] = useState('');

  // Social Links
  const [youtube, setYoutube] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [instagram, setInstagram] = useState('');
  const [discord, setDiscord] = useState('');
  const [website, setWebsite] = useState('');

  // Tags & Portfolio
  const [skillsInput, setSkillsInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [servicesInput, setServicesInput] = useState('');
  const [services, setServices] = useState([]);
  const [portfolio, setPortfolio] = useState([]);

  // New Portfolio Item Form State
  const [newPortTitle, setNewPortTitle] = useState('');
  const [newPortCategory, setNewPortCategory] = useState('Video Review');
  const [newPortUrl, setNewPortUrl] = useState('');
  const [newPortDesc, setNewPortDesc] = useState('');
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  const categories = [
    'Web3 Creator',
    'Crypto Researcher',
    'Blockchain Educator',
    'YouTube Creator',
    'X/Twitter Creator',
    'Streamer',
    'Developer',
    'Analyst',
    'Influencer',
    'Community Builder',
  ];

  // Applications State
  const [myApplications, setMyApplications] = useState([]);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await apiRequest('/applications/me');
      if (res.success && res.data) {
        setMyApplications(res.data);
      }
    } catch (err) {
      // Ignore app fetch errors if creator profile not created yet
    }
  };

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/creators/me');
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setDisplayName(p.displayName || '');
        setHeadline(p.headline || '');
        setBio(p.bio || '');
        setCategory(p.category || 'Web3 Creator');
        setLocation(p.location || '');
        setAvailability(p.availability || 'Available');
        setProfileImage(p.profileImage || '');
        setCoverImage(p.coverImage || '');

        setYoutube(p.youtube || '');
        setTwitter(p.twitter || '');
        setLinkedin(p.linkedin || '');
        setInstagram(p.instagram || '');
        setDiscord(p.discord || '');
        setWebsite(p.website || '');

        setSkills(p.skills || []);
        setServices(p.services || []);
        setPortfolio(Array.isArray(p.portfolio) ? p.portfolio : []);
      }
      fetchApplications();
    } catch (err) {
      if (err.status !== 404) {
        setError(err.message || 'Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawApp = async (appId) => {
    setWithdrawingId(appId);
    try {
      const res = await apiRequest(`/applications/${appId}/withdraw`, {
        method: 'POST',
      });
      if (res.success) {
        setMyApplications((prev) =>
          prev.map((app) => (app.id === appId ? { ...app, status: 'WITHDRAWN' } : app))
        );
      }
    } catch (err) {
      alert(`Failed to withdraw application: ${err.message}`);
    } finally {
      setWithdrawingId(null);
    }
  };

  const [myCollaborations, setMyCollaborations] = useState([]);

  const fetchCollaborations = async () => {
    try {
      const res = await apiRequest('/collaborations/me');
      if (res.success && res.data) {
        setMyCollaborations(res.data);
      }
    } catch (err) {
      // Ignore collab fetch errors
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchApplications();
    fetchCollaborations();
  }, []);

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = {
      displayName: displayName || 'Creator',
      headline,
      bio,
      category,
      location,
      availability,
      profileImage,
      coverImage,
      youtube,
      twitter,
      linkedin,
      instagram,
      discord,
      website,
      skills,
      services,
      portfolio,
    };

    try {
      const endpoint = profile ? '/creators/me' : '/creators/me';
      const method = profile ? 'PUT' : 'POST';
      const res = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(payload),
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setMessage('Profile changes saved successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    setSubmitting(true);
    setMessage(null);
    setError(null);
    try {
      // Save changes first if modified
      await handleSaveProfile();

      const res = await apiRequest('/creators/me/submit', { method: 'POST' });
      if (res.success && res.data) {
        setProfile(res.data);
        setMessage('Profile submitted for Admin review and approval!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit profile for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSkill = () => {
    if (skillsInput.trim() && !skills.includes(skillsInput.trim())) {
      setSkills([...skills, skillsInput.trim()]);
      setSkillsInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddService = () => {
    if (servicesInput.trim() && !services.includes(servicesInput.trim())) {
      setServices([...services, servicesInput.trim()]);
      setServicesInput('');
    }
  };

  const handleRemoveService = (serviceToRemove) => {
    setServices(services.filter((s) => s !== serviceToRemove));
  };

  const handleAddPortfolioItem = (e) => {
    e.preventDefault();
    if (!newPortTitle.trim()) return;

    const newItem = {
      title: newPortTitle.trim(),
      category: newPortCategory,
      url: newPortUrl.trim(),
      description: newPortDesc.trim(),
    };

    setPortfolio([...portfolio, newItem]);
    setNewPortTitle('');
    setNewPortUrl('');
    setNewPortDesc('');
    setShowPortfolioModal(false);
  };

  const handleRemovePortfolioItem = (index) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="pt-32 pb-20 bg-[#05070e] min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  const { percentage, missingItems } = calculateProfileCompletion(profile);

  return (
    <div className="pt-28 pb-20 bg-[#05070e] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Creator Profile Management</span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
              Professional Creator <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">Dashboard</span>
            </h1>
          </div>

          {profile && (
            <button
              onClick={() => onNavigate(`/creators/${profile.id}`)}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-purple-300 flex items-center gap-2 self-start sm:self-auto"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Approval Status Banner */}
        {profile ? (
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl ${
              profile.approvalStatus === 'APPROVED'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                : profile.approvalStatus === 'REJECTED'
                ? 'bg-red-500/10 border-red-500/30 text-red-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {profile.approvalStatus === 'APPROVED' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : profile.approvalStatus === 'REJECTED' ? (
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              )}

              <div>
                <h3 className="text-base font-bold font-sans">
                  Approval Status:{' '}
                  <span className="uppercase font-mono tracking-wider">{profile.approvalStatus}</span>
                </h3>
                <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                  {profile.approvalStatus === 'APPROVED'
                    ? 'Your profile is verified and publicly discoverable on the CrypLift marketplace.'
                    : profile.approvalStatus === 'REJECTED'
                    ? profile.rejectionReason
                      ? `Rejection Reason: ${profile.rejectionReason}`
                      : 'Your profile requires changes before approval. Update your profile information and submit for re-review.'
                    : 'Your profile has been submitted and is currently waiting for Admin approval.'}
                </p>
              </div>
            </div>

            {profile.approvalStatus !== 'APPROVED' && (
              <button
                onClick={handleSubmitForApproval}
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Submit for Approval</span>
              </button>
            )}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-sans">Initialize Your Creator Profile</h3>
              <p className="text-xs text-slate-300 mt-0.5">Complete your details below to activate your creator portfolio on CrypLift.</p>
            </div>
          </div>
        )}

        {/* Dynamic Profile Completion Card */}
        <div className="p-6 rounded-2xl bg-[#090e1a] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Profile Completion</span>
            </h3>
            <span className="text-sm font-extrabold text-purple-300 font-mono">{percentage}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
            <div
              className="bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {missingItems.length > 0 && (
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                Recommended Additions:
              </span>
              <div className="flex flex-wrap gap-2">
                {missingItems.map((item) => (
                  <span key={item} className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white/5 text-slate-300 border border-white/5">
                    + {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* My Active Collaborations (Phase 9) */}
        {myCollaborations.length > 0 && (
          <div className="p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/30 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>My Active Collaborations & Workspaces ({myCollaborations.length})</span>
              </h3>
            </div>

            <div className="space-y-3">
              {myCollaborations.map((collab) => (
                <div key={collab.id} className="p-4 rounded-xl bg-[#050811] border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm">{collab.campaign?.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                        {collab.project?.name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                          collab.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : collab.status === 'COMPLETED'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}
                      >
                        {collab.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 font-mono">
                      Agreed Rate: ${collab.application?.proposedRate?.toLocaleString() || collab.campaign?.budget?.toLocaleString()} {collab.campaign?.currency || 'USDC'}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate ? onNavigate(`/collaborations/${collab.id}`) : (window.location.href = `/collaborations/${collab.id}`)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Workspace</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Submitted Applications */}
        <div className="p-6 rounded-2xl bg-[#090e1a] border border-white/10 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>My Submitted Campaign Applications ({myApplications.length})</span>
            </h3>
            <button
              onClick={() => onNavigate('/campaigns')}
              className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold hover:bg-purple-500/30 flex items-center gap-1"
            >
              <span>Explore Marketplace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          {myApplications.length > 0 ? (
            <div className="space-y-3">
              {myApplications.map((app) => (
                <div key={app.id} className="p-4 rounded-xl bg-[#050811] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-sm">{app.campaign?.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-300">
                        {app.campaign?.project?.name}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : app.status === 'REJECTED'
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : app.status === 'WITHDRAWN'
                            ? 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{app.proposal}</p>

                    {app.proposedRate && (
                      <p className="text-[11px] font-mono text-emerald-400">
                        Proposed Rate: {app.proposedRate} {app.campaign?.currency || 'USDC'}
                      </p>
                    )}
                  </div>

                  {app.status === 'PENDING' && (
                    <button
                      onClick={() => handleWithdrawApp(app.id)}
                      disabled={withdrawingId === app.id}
                      className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-300 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold shrink-0"
                    >
                      {withdrawingId === app.id ? 'Withdrawing...' : 'Withdraw Application'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic py-4 text-center">
              You haven't submitted any campaign applications yet. Explore the marketplace to find open opportunities!
            </p>
          )}
        </div>

        {/* Feedback Banners */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Editor Form */}
        <form onSubmit={handleSaveProfile} className="space-y-8">

          {/* Section 1: Basic Profile Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <span>1. Basic Profile Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Display Name / Channel Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Primary Category / Niche</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Professional Headline</label>
              <input
                type="text"
                placeholder="e.g. Web3 Video Producer & Layer-2 DeFi Researcher"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Biography & Overview</label>
              <textarea
                rows={4}
                placeholder="Explain your content focus, channel reach, background, and collaboration experience..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Location / Region</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA / Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Collaboration Availability</label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                >
                  <option value="Available">Available for Campaigns</option>
                  <option value="Limited">Limited Availability</option>
                  <option value="Booked">Fully Booked</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Avatar & Cover Media */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span>2. Profile Media & Branding</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Profile Avatar URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Cover Banner URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3.5 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social Links */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-cyan-400" />
              <span>3. Social Platforms & Channels</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">YouTube Channel URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/@vance_crypto"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">X / Twitter Profile URL</label>
                <input
                  type="url"
                  placeholder="https://x.com/vance_crypto"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/alexvance"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Personal Website URL</label>
                <input
                  type="url"
                  placeholder="https://vancecrypto.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Skills & Services */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white font-sans border-b border-white/10 pb-3 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-purple-400" />
              <span>4. Services & Specialization Tags</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Services Offered</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Dedicated YouTube Video Review, X Thread, Discord AMA..."
                  value={servicesInput}
                  onChange={(e) => setServicesInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(); } }}
                  className="flex-1 bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold flex items-center gap-1.5">
                    <span>{s}</span>
                    <button type="button" onClick={() => handleRemoveService(s)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Skills & Specializations</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Layer-2 Infrastructure, Zero Knowledge, DeFi Yields..."
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill(); } }}
                  className="flex-1 bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-3 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((sk) => (
                  <span key={sk} className="px-3 py-1 rounded-xl bg-white/5 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5">
                    <span>{sk}</span>
                    <button type="button" onClick={() => handleRemoveSkill(sk)} className="hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5: Portfolio Projects */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1a] border border-white/10 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>5. Portfolio & Previous Collaborations</span>
              </h3>

              <button
                type="button"
                onClick={() => setShowPortfolioModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs border border-purple-500/30 flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Portfolio Item</span>
              </button>
            </div>

            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#05070e] border border-white/5 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => handleRemovePortfolioItem(idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noreferrer" className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1">
                        <span>View Project</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-white/10 rounded-2xl">
                No portfolio items added yet. Click "Add Portfolio Item" to feature your top campaigns.
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Draft Changes</span>
            </button>

            <button
              type="button"
              onClick={handleSubmitForApproval}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit for Admin Approval</span>
            </button>
          </div>

        </form>

      </div>

      {/* Add Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#090e1a] border border-white/10 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white font-sans">Add Portfolio Item</h3>

            <form onSubmit={handleAddPortfolioItem} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NovaX ZK Rollup Video Review"
                  value={newPortTitle}
                  onChange={(e) => setNewPortTitle(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Format / Category</label>
                <select
                  value={newPortCategory}
                  onChange={(e) => setNewPortCategory(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                >
                  <option>Video Review</option>
                  <option>Educational Thread</option>
                  <option>Live Stream</option>
                  <option>Research Article</option>
                  <option>AMA Host</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Content URL</label>
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={newPortUrl}
                  onChange={(e) => setNewPortUrl(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1">Brief Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize campaign metrics or deliverable results..."
                  value={newPortDesc}
                  onChange={(e) => setNewPortDesc(e.target.value)}
                  className="w-full bg-[#05070e] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowPortfolioModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
