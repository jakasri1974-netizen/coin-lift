import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';
import { calculateProjectProfileCompletion } from '../utils/projectCompletion';
import {
  Building2,
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
  Twitter,
  Github,
  Linkedin,
  Youtube,
  MessageSquare,
  FileText,
  Coins,
  Cpu,
  Layers,
  Award,
  Calendar,
  X,
  Eye,
  Megaphone,
  Edit,
  DollarSign,
  User,
  Check,
} from 'lucide-react';

export default function ProjectProfileDashboard({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Form Fields - Basic & Branding
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logo, setLogo] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('DeFi');
  const [projectType, setProjectType] = useState('Protocol');
  const [location, setLocation] = useState('');
  const [foundedYear, setFoundedYear] = useState('');

  // Web3 & Token Information
  const [network, setNetwork] = useState('Ethereum');
  const [contractAddress, setContractAddress] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenWebsite, setTokenWebsite] = useState('');
  const [documentationUrl, setDocumentationUrl] = useState('');
  const [whitepaperUrl, setWhitepaperUrl] = useState('');

  // Social & Community Links
  const [website, setWebsite] = useState('');
  const [twitter, setTwitter] = useState('');
  const [discord, setDiscord] = useState('');
  const [telegram, setTelegram] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [youtube, setYoutube] = useState('');
  const [medium, setMedium] = useState('');

  // Technical & Roadmap Information
  const [vision, setVision] = useState('');
  const [keyFeaturesInput, setKeyFeaturesInput] = useState('');
  const [keyFeatures, setKeyFeatures] = useState([]);
  const [technology, setTechnology] = useState('');
  const [ecosystem, setEcosystem] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [roadmap, setRoadmap] = useState('');
  const [teamInfo, setTeamInfo] = useState('');

  // Achievements
  const [achievements, setAchievements] = useState([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  const [achTitle, setAchTitle] = useState('');
  const [achDesc, setAchDesc] = useState('');
  const [achDate, setAchDate] = useState('');

  const categories = [
    'DeFi',
    'GameFi',
    'Layer 1',
    'Layer 2',
    'AI',
    'Infrastructure',
    'Wallet',
    'NFT',
    'DAO',
    'Web3 SaaS',
    'Developer Tools',
    'SocialFi',
    'Other',
  ];

  const projectTypes = [
    'Protocol',
    'dApp',
    'Infrastructure',
    'Layer 1 Blockchain',
    'Layer 2 Scaling',
    'Utility Token',
    'DAO Governance',
    'SaaS Tooling',
    'Mobile Wallet',
    'NFT Platform',
    'Other',
  ];

  const networks = [
    'Ethereum',
    'Solana',
    'Arbitrum',
    'Polygon',
    'Multi-chain',
    'BNB Chain',
    'Avalanche',
    'Base',
    'Sui',
    'Near',
    'Aptos',
    'Bitcoin / Ordinals',
    'Cosmos',
    'Other',
  ];

  // Active Tab: 'profile' or 'campaigns'
  const [activeTab, setActiveTab] = useState('profile');

  // Campaign State
  const [campaigns, setCampaigns] = useState([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [submittingCampaignId, setSubmittingCampaignId] = useState(null);

  // Campaign Form State
  const [campTitle, setCampTitle] = useState('');
  const [campDescription, setCampDescription] = useState('');
  const [campCategory, setCampCategory] = useState('DeFi');
  const [campBudget, setCampBudget] = useState('');
  const [campCurrency, setCampCurrency] = useState('USD');
  const [campDeliverables, setCampDeliverables] = useState('');
  const [campRequirements, setCampRequirements] = useState('');
  const [campDeadline, setCampDeadline] = useState('');

  // Application State
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedCampaignForApps, setSelectedCampaignForApps] = useState(null);
  const [campaignApplications, setCampaignApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/projects/me');
      if (res.success && res.data) {
        const p = res.data;
        setProfile(p);
        setName(p.name || '');
        setTagline(p.tagline || '');
        setLogo(p.logo || '');
        setCoverImage(p.coverImage || '');
        setDescription(p.description || '');
        setCategory(p.category || 'DeFi');
        setProjectType(p.projectType || 'Protocol');
        setLocation(p.location || '');
        setFoundedYear(p.foundedYear || '');

        setNetwork(p.network || 'Ethereum');
        setContractAddress(p.contractAddress || '');
        setTokenName(p.tokenName || '');
        setTokenSymbol(p.tokenSymbol || '');
        setTokenWebsite(p.tokenWebsite || '');
        setDocumentationUrl(p.documentationUrl || '');
        setWhitepaperUrl(p.whitepaperUrl || '');

        setWebsite(p.website || '');
        setTwitter(p.twitter || '');
        setDiscord(p.discord || '');
        setTelegram(p.telegram || '');
        setGithub(p.github || '');
        setLinkedin(p.linkedin || '');
        setYoutube(p.youtube || '');
        setMedium(p.medium || '');

        setVision(p.vision || '');
        setKeyFeatures(p.keyFeatures || []);
        setTechnology(p.technology || '');
        setEcosystem(p.ecosystem || '');
        setTargetAudience(p.targetAudience || '');
        setRoadmap(p.roadmap || '');
        setTeamInfo(p.teamInfo || '');
        setAchievements(Array.isArray(p.achievements) ? p.achievements : []);
      }
    } catch (err) {
      if (err.message && err.message.includes('No project profile found')) {
        setProfile(null);
      } else {
        setError(err.message || 'Failed to load project profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const res = await apiRequest('/campaigns/me');
      if (res.success) {
        setCampaigns(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setCampaignsLoading(false);
    }
  };

  // Collaborations State
  const [myCollaborations, setMyCollaborations] = useState([]);
  const [collaborationsLoading, setCollaborationsLoading] = useState(false);

  const fetchMyCollaborations = async () => {
    setCollaborationsLoading(true);
    try {
      const res = await apiRequest('/collaborations/me');
      if (res.success) {
        setMyCollaborations(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch collaborations:', err);
    } finally {
      setCollaborationsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMyCampaigns();
    fetchMyCollaborations();
  }, []);

  const handleOpenCreateCampaignModal = () => {
    setEditingCampaignId(null);
    setCampTitle('');
    setCampDescription('');
    setCampCategory(category || 'DeFi');
    setCampBudget('');
    setCampCurrency('USD');
    setCampDeliverables('');
    setCampRequirements('');
    setCampDeadline('');
    setShowCampaignModal(true);
  };

  const handleOpenEditCampaignModal = (camp) => {
    setEditingCampaignId(camp.id);
    setCampTitle(camp.title || '');
    setCampDescription(camp.description || '');
    setCampCategory(camp.category || 'DeFi');
    setCampBudget(camp.budget !== undefined ? String(camp.budget) : '');
    setCampCurrency(camp.currency || 'USD');
    setCampDeliverables(camp.deliverables || '');
    setCampRequirements(camp.requirements || '');
    setCampDeadline(camp.deadline ? new Date(camp.deadline).toISOString().split('T')[0] : '');
    setShowCampaignModal(true);
  };

  const handleSaveCampaign = async (e) => {
    if (e) e.preventDefault();
    if (!campTitle.trim() || !campDescription.trim()) {
      setError('Campaign Title and Description are required');
      return;
    }

    setSavingCampaign(true);
    setMessage(null);
    setError(null);

    const payload = {
      title: campTitle.trim(),
      description: campDescription.trim(),
      category: campCategory,
      budget: parseFloat(campBudget) || 0,
      currency: campCurrency,
      deliverables: campDeliverables,
      requirements: campRequirements,
      deadline: campDeadline ? new Date(campDeadline).toISOString() : null,
    };

    try {
      let res;
      if (editingCampaignId) {
        res = await apiRequest(`/campaigns/${editingCampaignId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest('/campaigns', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        setMessage(editingCampaignId ? 'Campaign draft updated!' : 'Campaign draft created!');
        setShowCampaignModal(false);
        fetchMyCampaigns();
      }
    } catch (err) {
      setError(err.message || 'Failed to save campaign');
    } finally {
      setSavingCampaign(false);
    }
  };

  const handleSubmitCampaignForApproval = async (campaignId) => {
    setSubmittingCampaignId(campaignId);
    setMessage(null);
    setError(null);

    try {
      const res = await apiRequest(`/campaigns/${campaignId}/submit`, {
        method: 'POST',
      });
      if (res.success) {
        setMessage('Campaign submitted for Admin approval!');
        fetchMyCampaigns();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit campaign for approval');
    } finally {
      setSubmittingCampaignId(null);
    }
  };

  const handleViewApplications = async (campaign) => {
    setSelectedCampaignForApps(campaign);
    setShowApplicationsModal(true);
    setApplicationsLoading(true);
    try {
      const res = await apiRequest(`/campaigns/${campaign.id}/applications`);
      if (res.success) {
        setCampaignApplications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId, status) => {
    setUpdatingAppId(appId);
    try {
      const res = await apiRequest(`/applications/${appId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (res.success) {
        setMessage(`Application status updated to ${status}`);
        // Refresh application list
        if (selectedCampaignForApps) {
          const appRes = await apiRequest(`/campaigns/${selectedCampaignForApps.id}/applications`);
          if (appRes.success) setCampaignApplications(appRes.data || []);
        }
        fetchMyCampaigns();
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status');
    } finally {
      setUpdatingAppId(null);
    }
  };

  const getFormData = () => ({
    name,
    tagline,
    logo,
    coverImage,
    description,
    category,
    projectType,
    location,
    foundedYear,
    network,
    contractAddress,
    tokenName,
    tokenSymbol,
    tokenWebsite,
    documentationUrl,
    whitepaperUrl,
    website,
    twitter,
    discord,
    telegram,
    github,
    linkedin,
    youtube,
    medium,
    vision,
    keyFeatures,
    technology,
    ecosystem,
    targetAudience,
    roadmap,
    teamInfo,
    achievements,
  });

  const handleSaveDraft = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    const payload = getFormData();

    try {
      let res;
      if (profile) {
        res = await apiRequest('/projects/me', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiRequest('/projects/me', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success && res.data) {
        setProfile(res.data);
        setMessage('Draft saved successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitApproval = async () => {
    setSubmitting(true);
    setMessage(null);
    setError(null);

    const payload = getFormData();

    try {
      if (profile) {
        await apiRequest('/projects/me', {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        const createRes = await apiRequest('/projects/me', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setProfile(createRes.data);
      }

      const submitRes = await apiRequest('/projects/me/submit', {
        method: 'POST',
      });

      if (submitRes.success && submitRes.data) {
        setProfile(submitRes.data);
        setMessage('Project profile submitted successfully for Admin approval!');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit project profile for approval');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddKeyFeature = (e) => {
    e.preventDefault();
    if (!keyFeaturesInput.trim()) return;
    setKeyFeatures([...keyFeatures, keyFeaturesInput.trim()]);
    setKeyFeaturesInput('');
  };

  const handleRemoveKeyFeature = (index) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  const handleAddAchievement = (e) => {
    e.preventDefault();
    if (!achTitle.trim()) return;
    const item = {
      title: achTitle.trim(),
      description: achDesc.trim(),
      date: achDate.trim() || new Date().getFullYear().toString(),
    };
    setAchievements([...achievements, item]);
    setAchTitle('');
    setAchDesc('');
    setAchDate('');
    setShowAchievementModal(false);
  };

  const handleRemoveAchievement = (index) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">Loading Project Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  const completion = calculateProjectProfileCompletion(getFormData());

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-8 h-8 text-cyan-400" />
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Project Owner Dashboard</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manage your Web3 project profile, branding, smart contracts, social channels, and moderation state.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {profile && profile.approvalStatus === 'APPROVED' && (
              <button
                onClick={() => onNavigate ? onNavigate(`/projects/${profile.id}`) : window.location.href = `/projects/${profile.id}`}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Eye className="w-4 h-4 text-cyan-400" />
                <span>View Public Profile</span>
              </button>
            )}
            <button
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 font-semibold text-xs flex items-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Preview</span>
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-slate-300" />}
              <span>Save Draft</span>
            </button>
            <button
              onClick={handleSubmitApproval}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit for Approval</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Project Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'campaigns'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Campaigns & Applications</span>
            {campaigns.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {campaigns.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('collaborations')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'collaborations'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>My Collaborations</span>
            {myCollaborations.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
                {myCollaborations.length}
              </span>
            )}
          </button>
        </div>

        {/* Notifications */}
        {message && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{message}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-emerald-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <>
            {/* Status Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#090e1a] p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Approval Status</span>
              {profile ? (
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                    profile.approvalStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : profile.approvalStatus === 'REJECTED'
                      ? 'bg-red-500/10 text-red-400 border-red-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {profile.approvalStatus === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {profile.approvalStatus === 'REJECTED' && <AlertCircle className="w-3.5 h-3.5" />}
                  {profile.approvalStatus === 'PENDING' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                  {profile.approvalStatus}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                  DRAFT / UNCREATED
                </span>
              )}
            </div>

            {profile?.approvalStatus === 'PENDING' && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  Your project profile is waiting for Admin approval.
                </p>
                <p className="text-[11px] text-amber-400/80">
                  Once verified by the moderation team, your project will be listed on public discovery. You can update details at any time.
                </p>
              </div>
            )}

            {profile?.approvalStatus === 'APPROVED' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Your project is publicly visible!
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  Your project profile is verified and active on the CrypLift platform ecosystem.
                </p>
              </div>
            )}

            {profile?.approvalStatus === 'REJECTED' && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 space-y-1">
                <p className="font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  Your project profile requires changes before approval.
                </p>
                {profile.rejectionReason && (
                  <p className="font-mono text-[11px] text-red-300 p-2 rounded bg-red-500/10 border border-red-500/20">
                    <strong>Admin Feedback:</strong> {profile.rejectionReason}
                  </p>
                )}
                <p className="text-[11px] text-red-400/80">
                  Please update missing details or accurate Web3 links below and click "Submit for Approval" to resubmit your profile.
                </p>
              </div>
            )}

            {/* Profile Completion Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Profile Completion: {completion.percentage}%
                </span>
                <span className="font-mono text-slate-400">{completion.percentage}/100</span>
              </div>
              <div className="w-full bg-[#050811] h-3 rounded-full overflow-hidden border border-white/5 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${completion.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Missing Checklist */}
          <div className="bg-[#090e1a] p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Missing Information</h3>
            {completion.missingItems.length > 0 ? (
              <ul className="space-y-2 text-xs">
                {completion.missingItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-xs text-emerald-400 flex items-center gap-2 py-4">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-bold">Your profile is 100% complete!</span>
              </div>
            )}
          </div>
        </div>

        {/* Editor Form */}
        <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 md:p-8 space-y-8">

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">1. Basic Information & Branding</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Uniswap Protocol"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tagline / Short Pitch</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Decentralized Trading Protocol on Ethereum"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project Type</label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {projectTypes.map((pt) => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Headquarters / Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Zug, Switzerland / Remote"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Founded Year</label>
                <input
                  type="text"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g. 2023"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Logo URL</label>
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cover / Banner Image URL</label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Project Overview & Vision */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">2. Detailed Overview & Ecosystem Vision</h2>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Description * (Min 10 characters)</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive description of the protocol, tokenomics, target use cases, and ecosystem value proposition..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Vision Statement</label>
                <textarea
                  rows={3}
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  placeholder="What long-term mission is the project solving in Web3?"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Target Audience / User Base</label>
                <textarea
                  rows={3}
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g. Liquidity Providers, Web3 Developers, Retail Traders, DAO Voters"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Web3 & Token Information */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <Coins className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">3. Web3, Token & Documentation Links</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Blockchain / Network</label>
                <select
                  value={network}
                  onChange={(e) => setNetwork(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {networks.map((net) => (
                    <option key={net} value={net}>{net}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Token Name</label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  placeholder="e.g. Uniswap"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Token Symbol</label>
                <input
                  type="text"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  placeholder="e.g. UNI"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Smart Contract Address</label>
                <input
                  type="text"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Documentation URL</label>
                <input
                  type="text"
                  value={documentationUrl}
                  onChange={(e) => setDocumentationUrl(e.target.value)}
                  placeholder="https://docs.project.io"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Whitepaper URL</label>
                <input
                  type="text"
                  value={whitepaperUrl}
                  onChange={(e) => setWhitepaperUrl(e.target.value)}
                  placeholder="https://project.io/whitepaper.pdf"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Social & Community Links */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">4. Website & Social Channels</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" /> Official Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://project.io"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-400" /> X / Twitter Handle or URL
                </label>
                <input
                  type="text"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="https://x.com/project"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Discord Invite URL
                </label>
                <input
                  type="text"
                  value={discord}
                  onChange={(e) => setDiscord(e.target.value)}
                  placeholder="https://discord.gg/project"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-400" /> Telegram Group / Channel
                </label>
                <input
                  type="text"
                  value={telegram}
                  onChange={(e) => setTelegram(e.target.value)}
                  placeholder="https://t.me/project"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-slate-300" /> GitHub Repository / Org
                </label>
                <input
                  type="text"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/project"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn Organization
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/project"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Technical Details & Roadmap */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">5. Technology Stack & Roadmap Summary</h2>
            </div>

            {/* Key Features */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Key Features & Value Highlights</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keyFeaturesInput}
                  onChange={(e) => setKeyFeaturesInput(e.target.value)}
                  placeholder="Add a feature (e.g. Zero-Knowledge Proof Privacy, Automated Yield Vaults)..."
                  className="flex-1 bg-[#050811] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddKeyFeature}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {keyFeatures.map((feat, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xs flex items-center gap-2">
                    <span>{feat}</span>
                    <button onClick={() => handleRemoveKeyFeature(idx)} className="text-slate-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Technology Architecture</label>
              <textarea
                rows={3}
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="Details about smart contract language (Solidity/Rust), security audits, infrastructure stack..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Roadmap Summary</label>
              <textarea
                rows={3}
                value={roadmap}
                onChange={(e) => setRoadmap(e.target.value)}
                placeholder="Q1 Mainnet Launch, Q2 Staking Program, Q3 Cross-Chain Expansion..."
                className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 6: Achievements */}
          <div className="space-y-4">
            <div className="border-b border-white/10 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">6. Genuine Project Achievements & Milestones</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAchievementModal(true)}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Achievement
              </button>
            </div>

            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="bg-[#050811] p-4 rounded-2xl border border-white/10 flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{ach.title}</span>
                        {ach.date && <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">{ach.date}</span>}
                      </div>
                      {ach.description && <p className="text-[11px] text-slate-400">{ach.description}</p>}
                    </div>
                    <button onClick={() => handleRemoveAchievement(idx)} className="text-slate-500 hover:text-red-400 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No achievements added yet (e.g. Funding rounds, audit completions, partnership announcements).</p>
            )}
          </div>

          {/* Bottom Actions */}
          <div className="pt-6 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-slate-300" />}
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              onClick={handleSubmitApproval}
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Submit for Admin Approval</span>
            </button>
          </div>
        </div>
        </>
        )}

        {/* Campaigns & Applications Tab Content */}
        {activeTab === 'campaigns' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#090e1a] p-6 rounded-3xl border border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  <span>Campaign Management</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Create marketing & collaboration campaigns for your project, submit for approval, and review creator applications.
                </p>
              </div>
              <button
                onClick={handleOpenCreateCampaignModal}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Campaign</span>
              </button>
            </div>

            {campaignsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading your campaigns...</p>
              </div>
            ) : campaigns.length === 0 ? (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <Megaphone className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Campaigns Created Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Launch your first campaign to invite Web3 content creators, KOLs, and ambassadors to amplify your project.
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateCampaignModal}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 font-bold text-xs inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create First Campaign</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{camp.title}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                              camp.status === 'PUBLISHED'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : camp.status === 'PENDING_APPROVAL'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : camp.status === 'DRAFT'
                                ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{camp.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {(camp.status === 'DRAFT' || camp.status === 'REJECTED' || camp.status === 'CANCELLED') && (
                          <>
                            <button
                              onClick={() => handleOpenEditCampaignModal(camp)}
                              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs flex items-center gap-1.5"
                            >
                              <Edit className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Edit Campaign</span>
                            </button>
                            <button
                              onClick={() => handleSubmitCampaignForApproval(camp.id)}
                              disabled={submittingCampaignId === camp.id}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-1.5"
                            >
                              {submittingCampaignId === camp.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              <span>Submit for Approval</span>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleViewApplications(camp)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/30 font-bold text-xs flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          <span>Applications ({camp.applications?.length || 0})</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Category</span>
                        <span className="text-slate-200 font-bold">{camp.category}</span>
                      </div>
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Budget</span>
                        <span className="text-cyan-400 font-bold">${camp.budget?.toLocaleString()} {camp.currency}</span>
                      </div>
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Deadline</span>
                        <span className="text-slate-200 font-bold">{camp.deadline ? new Date(camp.deadline).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Applications</span>
                        <span className="text-emerald-400 font-bold">{camp.applications?.length || 0}</span>
                      </div>
                    </div>

                    {camp.rejectionReason && (camp.status === 'REJECTED' || camp.status === 'CANCELLED') && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 font-mono">
                        <strong>Rejection Reason:</strong> {camp.rejectionReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Collaborations Tab Content (Phase 9) */}
        {activeTab === 'collaborations' && (
          <div className="space-y-6">
            <div className="bg-[#090e1a] p-6 rounded-3xl border border-white/10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <span>My Active Collaborations</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Collaborate directly with accepted Web3 content creators in secure 1-on-1 workspaces.
              </p>
            </div>

            {collaborationsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading active collaborations...</p>
              </div>
            ) : myCollaborations.length === 0 ? (
              <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-12 text-center space-y-4">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">No Active Collaborations Yet</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Once you accept a creator's application for your campaign, an active collaboration workspace will automatically open here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {myCollaborations.map((collab) => (
                  <div key={collab.id} className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">{collab.campaign?.title}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
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
                        <p className="text-xs text-cyan-400 font-mono mt-1">
                          Creator: <span className="text-white font-bold">{collab.creator?.displayName}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onNavigate ? onNavigate(`/collaborations/${collab.id}`) : (window.location.href = `/collaborations/${collab.id}`)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 shrink-0"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Open Workspace</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Agreed Rate</span>
                        <span className="text-emerald-400 font-bold">${collab.application?.proposedRate?.toLocaleString() || collab.campaign?.budget?.toLocaleString()} {collab.campaign?.currency || 'USDC'}</span>
                      </div>
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Started Date</span>
                        <span className="text-slate-200 font-bold">{new Date(collab.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-[#050811] p-3 rounded-2xl border border-white/5">
                        <span className="text-slate-500 text-[10px] block uppercase">Category</span>
                        <span className="text-purple-300 font-bold">{collab.campaign?.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Create/Edit Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-2xl bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-bold text-white">
                {editingCampaignId ? 'Edit Campaign Draft' : 'Create New Campaign'}
              </h3>
              <button onClick={() => setShowCampaignModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={campTitle}
                  onChange={(e) => setCampTitle(e.target.value)}
                  placeholder="e.g. DeFi Mainnet Launch Campaign"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={campCategory}
                    onChange={(e) => setCampCategory(e.target.value)}
                    className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Budget ($ USD)</label>
                  <input
                    type="number"
                    value={campBudget}
                    onChange={(e) => setCampBudget(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Campaign Description *</label>
                <textarea
                  rows={4}
                  required
                  value={campDescription}
                  onChange={(e) => setCampDescription(e.target.value)}
                  placeholder="Detailed description of the campaign goals, scope, and expected outreach..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Deliverables</label>
                  <textarea
                    rows={3}
                    value={campDeliverables}
                    onChange={(e) => setCampDeliverables(e.target.value)}
                    placeholder="e.g. 1 Video Review, 3 Tweets, 1 Discord AMA"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Requirements</label>
                  <textarea
                    rows={3}
                    value={campRequirements}
                    onChange={(e) => setCampRequirements(e.target.value)}
                    placeholder="e.g. Min 5k Twitter Followers, Web3/DeFi focus"
                    className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={campDeadline}
                  onChange={(e) => setCampDeadline(e.target.value)}
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowCampaignModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 font-semibold text-xs hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCampaign}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2"
                >
                  {savingCampaign ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Draft</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Applications Review Modal */}
      {showApplicationsModal && selectedCampaignForApps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">
                  Creator Applications
                </span>
                <h3 className="text-xl font-bold text-white mt-1">{selectedCampaignForApps.title}</h3>
              </div>
              <button onClick={() => setShowApplicationsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {applicationsLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading creator applications...</p>
              </div>
            ) : campaignApplications.length === 0 ? (
              <div className="text-center py-12 space-y-2">
                <User className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-bold text-white">No Applications Received Yet</p>
                <p className="text-xs text-slate-400">
                  Once creators discover your published campaign, their proposals will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaignApplications.map((app) => (
                  <div key={app.id} className="bg-[#050811] rounded-2xl border border-white/10 p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm border border-cyan-500/30 overflow-hidden">
                          {app.creator?.avatarUrl ? (
                            <img src={app.creator.avatarUrl} alt={app.creator.displayName} className="w-full h-full object-cover" />
                          ) : (
                            app.creator?.displayName?.charAt(0) || 'C'
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{app.creator?.displayName || 'Creator'}</h4>
                          <p className="text-xs text-cyan-400 font-mono">
                            {app.creator?.handle ? `@${app.creator.handle}` : app.creator?.title || 'Web3 Creator'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                          Rate: ${app.proposedRate?.toLocaleString()}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border ${
                            app.status === 'ACCEPTED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : app.status === 'REJECTED'
                              ? 'bg-red-500/10 text-red-400 border-red-500/30'
                              : app.status === 'WITHDRAWN'
                              ? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-mono uppercase text-[10px] block">Proposal</span>
                        <p className="text-slate-200 leading-relaxed bg-[#090e1a] p-3 rounded-xl border border-white/5 whitespace-pre-line">
                          {app.proposal}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-mono uppercase text-[10px] block">Proposed Deliverables</span>
                        <p className="text-slate-200 leading-relaxed bg-[#090e1a] p-3 rounded-xl border border-white/5 whitespace-pre-line">
                          {app.deliverables || 'As required by campaign specifications.'}
                        </p>
                      </div>
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                        <button
                          onClick={() => handleUpdateApplicationStatus(app.id, 'REJECTED')}
                          disabled={updatingAppId === app.id}
                          className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5"
                        >
                          {updatingAppId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          <span>Reject Application</span>
                        </button>
                        <button
                          onClick={() => handleUpdateApplicationStatus(app.id, 'ACCEPTED')}
                          disabled={updatingAppId === app.id}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          {updatingAppId === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          <span>Accept Application</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setShowApplicationsModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Modal */}
      {showAchievementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white">Add Genuine Project Achievement</h3>
              <button onClick={() => setShowAchievementModal(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Milestone Title *</label>
                <input
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="e.g. Raised $3M Seed Round"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Year / Date</label>
                <input
                  type="text"
                  value={achDate}
                  onChange={(e) => setAchDate(e.target.value)}
                  placeholder="e.g. Q4 2024"
                  className="w-full bg-[#050811] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Short Details</label>
                <textarea
                  rows={2}
                  value={achDesc}
                  onChange={(e) => setAchDesc(e.target.value)}
                  placeholder="e.g. Co-led by top crypto VCs with mainnet integration..."
                  className="w-full bg-[#050811] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAchievementModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-semibold hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddAchievement}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400"
              >
                Add Milestone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-[#090e1a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase">Public Preview</span>
                <h3 className="text-xl font-bold text-white mt-1">{name || 'Project Name'}</h3>
              </div>
              <button onClick={() => setShowPreviewModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {coverImage && (
                <div className="h-40 rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-xl shrink-0 border border-cyan-500/30 overflow-hidden">
                  {logo ? <img src={logo} alt={name} className="w-full h-full object-cover" /> : (name?.charAt(0) || 'P')}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">{name || 'Project Name'}</h4>
                  <p className="text-xs text-cyan-400 font-mono">{tagline}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-slate-300">{category}</span>
                    {network && <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/20">{network}</span>}
                    {tokenSymbol && <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">${tokenSymbol}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2">
                <h5 className="text-xs font-bold text-slate-400 uppercase font-mono">Overview</h5>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{description || 'No description provided.'}</p>
              </div>

              {keyFeatures.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase font-mono">Key Features</h5>
                  <div className="flex flex-wrap gap-2">
                    {keyFeatures.map((f, i) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
