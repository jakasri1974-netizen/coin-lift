import React, { useState, useEffect } from 'react';
import { X, User, Sparkles, CheckCircle2, AlertCircle, Loader2, Globe, Link, Twitter, Youtube, MessageSquare } from 'lucide-react';
import { creatorsService } from '../../services/api';

export default function EditCreatorProfileModal({ onClose, onSuccess }) {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    displayName: '',
    category: 'Web3',
    location: 'Global',
    bio: '',
    followers: '10K',
    engagementRate: '5.0%',
    availability: 'Available',
    portfolioUrl: '',
    platforms: ['YouTube', 'X'],
    socialLinks: {
      twitter: '',
      youtube: '',
      telegram: '',
      discord: '',
      github: '',
    },
  });

  const availableCategories = ['Web3', 'Technology', 'Gaming', 'Finance', 'Education', 'Lifestyle'];
  const availablePlatforms = ['YouTube', 'Instagram', 'X', 'TikTok', 'LinkedIn', 'Telegram', 'Discord', 'Twitch', 'Substack'];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorMsg('');
      try {
        const res = await creatorsService.getMyProfile();
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            displayName: p.displayName || '',
            category: p.category || 'Web3',
            location: p.location || 'Global',
            bio: p.bio || '',
            followers: p.followers || '0',
            engagementRate: p.engagementRate || '0%',
            availability: p.availability || 'Available',
            portfolioUrl: p.portfolioUrl || '',
            platforms: Array.isArray(p.platforms) && p.platforms.length > 0 ? p.platforms : ['YouTube', 'X'],
            socialLinks: {
              twitter: p.socialLinks?.twitter || '',
              youtube: p.socialLinks?.youtube || '',
              telegram: p.socialLinks?.telegram || '',
              discord: p.socialLinks?.discord || '',
              github: p.socialLinks?.github || '',
            },
          });
        }
      } catch (err) {
        console.error('Failed to load profile for editing:', err);
        setErrorMsg('Failed to load profile details. Please try again.');
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const togglePlatform = (platform) => {
    setFormData((prev) => {
      const current = prev.platforms || [];
      const updated = current.includes(platform)
        ? current.filter((p) => p !== platform)
        : [...current, platform];
      return { ...prev, platforms: updated.length > 0 ? updated : ['X'] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.displayName.trim()) {
      setErrorMsg('Display name is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await creatorsService.updateProfile(formData);
      if (res.success && res.data) {
        setSuccessMsg('Creator profile updated successfully!');
        setTimeout(() => {
          onSuccess && onSuccess(res.data);
          onClose();
        }, 800);
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save creator profile error:', err);
      setErrorMsg(err.message || 'Failed to save creator profile changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-sans">Edit Creator Profile</h3>
            <p className="text-xs text-slate-500 font-medium">Update your public Web3 creator identity and preferences</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {loadingProfile ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600 uppercase">Loading Creator Profile Data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Display Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="e.g. Vance Tech"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Primary Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Verified Followers
                </label>
                <input
                  type="text"
                  value={formData.followers}
                  onChange={(e) => handleChange('followers', e.target.value)}
                  placeholder="e.g. 25.4K"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Engagement Rate
                </label>
                <input
                  type="text"
                  value={formData.engagementRate}
                  onChange={(e) => handleChange('engagementRate', e.target.value)}
                  placeholder="e.g. 7.8%"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Availability Status
                </label>
                <select
                  value={formData.availability}
                  onChange={(e) => handleChange('availability', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                Bio & Creator Experience
              </label>
              <textarea
                rows="3"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Describe your content format, audience demographics, and past Web3 review experience..."
                className="w-full p-3 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Location / Region
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="e.g. Global / North America"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Portfolio / Website URL
                </label>
                <input
                  type="text"
                  value={formData.portfolioUrl}
                  onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                  placeholder="https://yourportfolio.io"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Platform Checkboxes */}
            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-2">
                Active Content Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {availablePlatforms.map((plat) => {
                  const selected = formData.platforms?.includes(plat);
                  return (
                    <button
                      type="button"
                      key={plat}
                      onClick={() => togglePlatform(plat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all border ${
                        selected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {plat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Social Handles */}
            <div className="pt-2 border-t border-purple-100">
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-2">
                Social Links & Handles
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="X / Twitter Handle (e.g. @vancetech)"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  value={formData.socialLinks.youtube}
                  onChange={(e) => handleSocialChange('youtube', e.target.value)}
                  placeholder="YouTube Channel URL"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  value={formData.socialLinks.telegram}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="Telegram Username (e.g. @vance_t)"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  value={formData.socialLinks.discord}
                  onChange={(e) => handleSocialChange('discord', e.target.value)}
                  placeholder="Discord Username / Handle"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-purple-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <span>Save Creator Profile</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
