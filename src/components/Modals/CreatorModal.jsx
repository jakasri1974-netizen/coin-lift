import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle2, ArrowRight, ShieldCheck, Users, Youtube, Twitter, MessageSquare, Send, Loader2, AlertCircle, Building2, Briefcase } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiRequest } from '../../utils/api';

export default function CreatorModal({ creator, onClose, onInvite, onNavigate }) {
  const { user, isAuthenticated } = useAuth();
  const [showInviteSection, setShowInviteSection] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [proposedRate, setProposedRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    async function loadProjectCampaigns() {
      if (isAuthenticated && user?.role === 'PROJECT_OWNER') {
        setLoadingCampaigns(true);
        try {
          const res = await apiRequest('/campaigns/me');
          if (res.success && res.data) {
            const published = res.data.filter((c) => c.status === 'PUBLISHED');
            setCampaigns(published);
            if (published.length > 0) {
              setSelectedCampaignId(published[0].id);
              if (published[0].budget) {
                setProposedRate(published[0].budget.toString());
              }
            }
          }
        } catch (err) {
          console.error('Failed to load campaigns for invitation:', err);
        } finally {
          setLoadingCampaigns(false);
        }
      }
    }

    loadProjectCampaigns();
  }, [isAuthenticated, user]);

  if (!creator) return null;

  // Safe Creator field fallbacks
  const avatar = creator.profileImage || creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const name = creator.displayName || creator.name || 'Web3 Creator';
  const handle = creator.handle || (creator.user?.email ? `@${creator.user.email.split('@')[0]}` : (creator.twitter ? `@${creator.twitter}` : ''));
  const bio = creator.bio || creator.headline || 'Web3 researcher, content producer, and crypto community educator.';
  const followers = creator.followersCount
    ? `${(creator.followersCount / 1000).toFixed(1)}k`
    : (creator.followers || '120k+');
  const engagement = creator.engagementRate ? `${creator.engagementRate}%` : '7.5%';
  const rating = creator.rating || '4.9';
  const completedCampaigns = creator.completedCampaigns || 18;

  // Web3 Interests / Skills
  const specializations = Array.isArray(creator.skills) && creator.skills.length > 0
    ? creator.skills
    : Array.isArray(creator.web3Interests) && creator.web3Interests.length > 0
    ? creator.web3Interests
    : creator.category
    ? [creator.category]
    : ['Web3 Creator', 'Blockchain'];

  // Platforms
  let platforms = [];
  if (Array.isArray(creator.platforms) && creator.platforms.length > 0) {
    platforms = creator.platforms;
  } else {
    if (creator.youtube) platforms.push('YouTube');
    if (creator.twitter) platforms.push('X / Twitter');
    if (creator.discord) platforms.push('Discord');
    if (creator.linkedin) platforms.push('LinkedIn');
    if (creator.instagram) platforms.push('Instagram');
    if (platforms.length === 0) platforms.push('Web3 Ecosystem');
  }

  const handleCampaignChange = (e) => {
    const campId = e.target.value;
    setSelectedCampaignId(campId);
    const chosen = campaigns.find((c) => c.id === campId);
    if (chosen?.budget) {
      setProposedRate(chosen.budget.toString());
    }
  };

  const handleSendInvitation = async (e) => {
    e?.preventDefault();
    if (!selectedCampaignId) {
      setErrorMessage('Please select a campaign to invite this creator to.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payload = {
        creatorId: creator.id,
        campaignId: selectedCampaignId,
        message: inviteMessage.trim() || undefined,
        proposedRate: proposedRate ? parseFloat(proposedRate) : undefined,
      };

      const res = await apiRequest(`/campaigns/${selectedCampaignId}/invite`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.success) {
        setSuccessMessage(res.message || 'Invitation successfully sent! The creator will receive your campaign offer.');
        onInvite && onInvite({ creator, campaignId: selectedCampaignId, application: res.data });
      } else {
        throw new Error(res.message || 'Failed to send campaign invitation');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred while sending the campaign invitation.');
    } finally {
      setSubmitting(false);
    }
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
          <img
            src={avatar}
            alt={name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-extrabold text-white font-sans">{name}</h3>
              {creator.verified && (
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  Verified Creator
                </span>
              )}
            </div>
            {handle && <p className="text-xs text-slate-400 font-mono mt-0.5">{handle}</p>}
          </div>
        </div>

        {/* Bio & Details */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Creator Biography</h4>
            <p className="text-sm text-slate-200 leading-relaxed bg-[#05070e] p-4 rounded-xl border border-white/5">
              {bio}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Followers</span>
              <span className="text-base font-extrabold text-white font-mono mt-1 block">{followers}</span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Avg Engagement</span>
              <span className="text-base font-extrabold text-emerald-400 font-mono mt-1 block">{engagement}</span>
            </div>

            <div className="bg-[#0e1424] p-3.5 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-slate-400 uppercase block">Rating</span>
              <span className="text-base font-extrabold text-amber-400 font-mono mt-1 flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-400" /> {rating}
              </span>
            </div>
          </div>

          {/* Web3 Niche Interests */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Web3 Specializations</h4>
            <div className="flex flex-wrap gap-2">
              {specializations.map((interest) => (
                <span key={interest} className="text-xs font-semibold px-3 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Channels */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">Platform Distribution</h4>
            <div className="flex items-center gap-2 flex-wrap">
              {platforms.map((p) => (
                <span key={p} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-white/5 text-slate-200 border border-white/10">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Success or Error Banners */}
          {successMessage && (
            <div id="invitation-success-banner" className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">{successMessage}</p>
                <p className="text-emerald-400/80 mt-1">
                  The invitation is now available for the creator on their profile dashboard.
                </p>
              </div>
            </div>
          )}

          {errorMessage && (
            <div id="invitation-error-banner" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">Invitation Failed</p>
                <p className="text-red-400/90 mt-1">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Interactive Invitation Form / Panel */}
          {showInviteSection && !successMessage && (
            <div className="p-5 rounded-2xl bg-[#05070e] border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Invite {name} to Campaign</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setShowInviteSection(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {loadingCampaigns ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Loading your published campaigns...</span>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="py-4 space-y-2 text-center">
                  <p className="text-xs text-amber-300">
                    You do not have any published campaigns available to invite creators to.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Draft campaigns must be submitted and approved or set to published status first.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigate && onNavigate('/project/profile');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                  >
                    Go to Campaign Manager
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Select Target Campaign <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="invite-campaign-select"
                      value={selectedCampaignId}
                      onChange={handleCampaignChange}
                      className="w-full bg-[#090e1a] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                    >
                      {campaigns.map((camp) => (
                        <option key={camp.id} value={camp.id}>
                          {camp.title} — ${camp.budget?.toLocaleString()} {camp.currency || 'USDC'} ({camp.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                        Proposed Budget / Rate (USDC)
                      </label>
                      <input
                        id="invite-rate-input"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="e.g. 1500"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        className="w-full bg-[#090e1a] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Personalized Invitation Message
                    </label>
                    <textarea
                      id="invite-message-input"
                      rows={3}
                      placeholder="Hi! We love your Web3 content and would like to invite you to collaborate on our upcoming campaign..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full bg-[#090e1a] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-purple-500 placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteSection(false)}
                      className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      id="send-invite-button"
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Invitation...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send Invitation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Action Button Section */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">{completedCampaigns} Completed Collaborations</span>
            
            {successMessage ? (
              <div className="px-5 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span>Invitation Sent</span>
              </div>
            ) : !isAuthenticated ? (
              <button
                id="login-to-invite-button"
                onClick={() => {
                  onClose();
                  onNavigate && onNavigate('/login');
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
              >
                <span>Log In to Invite Creator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : user?.role !== 'PROJECT_OWNER' ? (
              <span className="text-xs text-slate-400 italic">
                Signed in as {user?.role}. Only Project Owners can invite creators.
              </span>
            ) : !showInviteSection ? (
              <button
                id="open-invite-form-button"
                onClick={() => {
                  setShowInviteSection(true);
                  setErrorMessage(null);
                }}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-bold text-xs shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transition-all flex items-center gap-2"
              >
                <span>Invite to Campaign</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
}
