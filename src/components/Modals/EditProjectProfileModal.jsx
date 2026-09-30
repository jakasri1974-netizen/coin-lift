import React, { useState, useEffect } from 'react';
import { X, Briefcase, CheckCircle2, AlertCircle, Loader2, Globe, Shield } from 'lucide-react';
import { projectsService } from '../../services/api';

export default function EditProjectProfileModal({ onClose, onSuccess }) {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    category: 'Infrastructure',
    website: '',
    tokenSymbol: '',
    network: 'Ethereum',
    contractAddress: '',
    communitySize: '10K Members',
    projectStage: 'Mainnet',
    socialLinks: {
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
    },
  });

  const availableCategories = ['Infrastructure', 'DeFi', 'Gaming', 'NFT', 'DAO', 'AI & Data', 'Layer 2', 'Tooling'];
  const availableNetworks = ['Ethereum', 'Solana', 'Arbitrum', 'Polygon', 'Optimism', 'Base', 'Bitcoin', 'Avalanche'];
  const availableStages = ['Testnet', 'Mainnet', 'Alpha', 'Beta', 'Growth'];

  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      setErrorMsg('');
      try {
        const res = await projectsService.getMyProfile();
        if (res.success && res.data) {
          const p = res.data;
          setFormData({
            projectName: p.projectName || '',
            description: p.description || '',
            category: p.category || 'Infrastructure',
            website: p.website || p.socialLinks?.website || '',
            tokenSymbol: p.tokenSymbol || '',
            network: p.network || 'Ethereum',
            contractAddress: p.contractAddress || '',
            communitySize: p.communitySize || '10K Members',
            projectStage: p.projectStage || 'Mainnet',
            socialLinks: {
              website: p.socialLinks?.website || p.website || '',
              twitter: p.socialLinks?.twitter || '',
              telegram: p.socialLinks?.telegram || '',
              discord: p.socialLinks?.discord || '',
            },
          });
        }
      } catch (err) {
        console.error('Failed to load project profile for editing:', err);
        setErrorMsg('Failed to load project details. Please try again.');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    if (!formData.projectName.trim()) {
      setErrorMsg('Project name is required.');
      return;
    }

    if (!formData.description.trim()) {
      setErrorMsg('Project description is required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await projectsService.updateProfile(formData);
      if (res.success && res.data) {
        setSuccessMsg('Project profile updated successfully!');
        setTimeout(() => {
          onSuccess && onSuccess(res.data);
          onClose();
        }, 800);
      } else {
        throw new Error(res.message || 'Failed to update project profile');
      }
    } catch (err) {
      console.error('Save project profile error:', err);
      setErrorMsg(err.message || 'Failed to save project profile changes.');
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 font-sans">Edit Project Profile</h3>
            <p className="text-xs text-slate-500 font-medium">Update your Web3 organization information and token details</p>
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
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600 uppercase">Loading Project Profile Data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  placeholder="e.g. ApexChain L2"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Category
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

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                Project Description *
              </label>
              <textarea
                rows="3"
                required
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your protocol, product features, mainnet goals, and creator requirements..."
                className="w-full p-3 rounded-xl border border-purple-200 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Token Symbol
                </label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => handleChange('tokenSymbol', e.target.value)}
                  placeholder="e.g. APEX"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Blockchain Network
                </label>
                <select
                  value={formData.network}
                  onChange={(e) => handleChange('network', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {availableNetworks.map((net) => (
                    <option key={net} value={net}>
                      {net}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Project Stage
                </label>
                <select
                  value={formData.projectStage}
                  onChange={(e) => handleChange('projectStage', e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  {availableStages.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Official Website URL
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://yourproject.io"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Community Reach / Size
                </label>
                <input
                  type="text"
                  value={formData.communitySize}
                  onChange={(e) => handleChange('communitySize', e.target.value)}
                  placeholder="e.g. 50.0K Members"
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                Contract Address (Optional)
              </label>
              <input
                type="text"
                value={formData.contractAddress}
                onChange={(e) => handleChange('contractAddress', e.target.value)}
                placeholder="0x..."
                className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>

            {/* Social Links */}
            <div className="pt-2 border-t border-purple-100">
              <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-2">
                Social Links & Community Channels
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.socialLinks.twitter}
                  onChange={(e) => handleSocialChange('twitter', e.target.value)}
                  placeholder="X / Twitter Handle (e.g. @apexchain)"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  value={formData.socialLinks.discord}
                  onChange={(e) => handleSocialChange('discord', e.target.value)}
                  placeholder="Discord Invite Link"
                  className="p-2 rounded-lg border border-purple-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                />
                <input
                  type="text"
                  value={formData.socialLinks.telegram}
                  onChange={(e) => handleSocialChange('telegram', e.target.value)}
                  placeholder="Telegram Community Group Link"
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
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <span>Save Project Profile</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
