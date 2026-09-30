import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { dashboardService, applicationsService, collaborationsService } from '../services/api';
import CreateCampaignModal from '../components/Modals/CreateCampaignModal';
import EditCreatorProfileModal from '../components/Modals/EditCreatorProfileModal';
import EditProjectProfileModal from '../components/Modals/EditProjectProfileModal';
import {
  User,
  Layers,
  Flame,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  LogOut,
  Sparkles,
  Shield,
  ArrowUpRight,
  Plus,
  AlertCircle,
  FileText,
  Users,
  Briefcase,
  Loader2,
  Edit3,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  MousePointer,
  Check,
  X
} from 'lucide-react';

export default function DashboardPage({ onNavigate, targetRoleFilter }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [processingAppId, setProcessingAppId] = useState(null);

  // Edit Collaboration Modal State
  const [selectedCollabToEdit, setSelectedCollabToEdit] = useState(null);
  const [updateProgressVal, setUpdateProgressVal] = useState(0);
  const [updateStatusVal, setUpdateStatusVal] = useState('active');
  const [updatePerfViews, setUpdatePerfViews] = useState(0);
  const [updatePerfLikes, setUpdatePerfLikes] = useState(0);
  const [updatePerfComments, setUpdatePerfComments] = useState(0);
  const [updatePerfShares, setUpdatePerfShares] = useState(0);
  const [updatePerfClicks, setUpdatePerfClicks] = useState(0);
  const [updatePerfReach, setUpdatePerfReach] = useState('0');
  const [updatePerfEngagement, setUpdatePerfEngagement] = useState('0%');
  const [updatingCollab, setUpdatingCollab] = useState(false);
  const [collabModalError, setCollabModalError] = useState('');

  const isCreator = user?.role === 'creator';
  const isProject = user?.role === 'project';
  const isAdmin = user?.role === 'admin';

  // Role mismatch check if accessed specific dashboard route
  const roleMismatch = targetRoleFilter && targetRoleFilter !== user?.role && !isAdmin;

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isCreator || (isAdmin && targetRoleFilter === 'creator')) {
        const res = await dashboardService.getCreatorDashboard();
        if (res.success) setMetrics(res.data);
      } else if (isProject || (isAdmin && targetRoleFilter === 'project')) {
        const res = await dashboardService.getProjectDashboard();
        if (res.success) setMetrics(res.data);
      }

      // Fetch real applications from MongoDB
      try {
        const appsRes = await applicationsService.getMyApplications();
        if (appsRes.success && appsRes.data) {
          setApplications(appsRes.data);
        }
      } catch (appErr) {
        console.warn('Could not load applications:', appErr.message);
      }

      // Fetch real collaborations from MongoDB
      try {
        const collabsRes = await collaborationsService.getMyCollaborations();
        if (collabsRes.success && collabsRes.data) {
          setCollaborations(collabsRes.data);
        }
      } catch (collabErr) {
        console.warn('Could not load collaborations:', collabErr.message);
      }

    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || 'Failed to load dashboard data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('/login');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user?.role, targetRoleFilter]);

  const handleCampaignCreatedSuccess = (newCampaign) => {
    setSuccessNotice(`Campaign "${newCampaign.title}" was successfully created and published!`);
    fetchDashboardData();
    setTimeout(() => {
      setSuccessNotice('');
    }, 5000);
  };

  // Handle Accept Application
  const handleAcceptApplication = async (appId) => {
    if (processingAppId) return;
    setProcessingAppId(appId);
    setActionError('');

    try {
      const res = await applicationsService.updateStatus(appId, 'accepted');
      if (res.success) {
        setSuccessNotice('Application accepted! Active collaboration created in MongoDB.');
        // Update local application state immediately
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: 'accepted' } : app))
        );
        // Refresh metrics & collaborations list
        const [dashRes, collabsRes] = await Promise.all([
          isProject ? dashboardService.getProjectDashboard() : dashboardService.getCreatorDashboard(),
          collaborationsService.getMyCollaborations()
        ]);
        if (dashRes.success) setMetrics(dashRes.data);
        if (collabsRes.success && collabsRes.data) setCollaborations(collabsRes.data);

        setTimeout(() => setSuccessNotice(''), 5000);
      } else {
        throw new Error(res.message || 'Failed to accept application');
      }
    } catch (err) {
      console.error('Accept application error:', err);
      setActionError(err.message || 'Failed to accept application.');
    } finally {
      setProcessingAppId(null);
    }
  };

  // Handle Reject Application
  const handleRejectApplication = async (appId) => {
    if (processingAppId) return;
    setProcessingAppId(appId);
    setActionError('');

    try {
      const res = await applicationsService.updateStatus(appId, 'rejected');
      if (res.success) {
        setSuccessNotice('Application status updated to Rejected.');
        // Update local application state immediately
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: 'rejected' } : app))
        );
        // Refresh metrics
        const dashRes = isProject ? await dashboardService.getProjectDashboard() : await dashboardService.getCreatorDashboard();
        if (dashRes.success) setMetrics(dashRes.data);

        setTimeout(() => setSuccessNotice(''), 5000);
      } else {
        throw new Error(res.message || 'Failed to reject application');
      }
    } catch (err) {
      console.error('Reject application error:', err);
      setActionError(err.message || 'Failed to reject application.');
    } finally {
      setProcessingAppId(null);
    }
  };

  // Open Edit Collaboration Modal
  const handleOpenEditCollabModal = (collab) => {
    setSelectedCollabToEdit(collab);
    setUpdateProgressVal(collab.progress ?? 0);
    setUpdateStatusVal(collab.status || 'active');
    setUpdatePerfViews(collab.performance?.views ?? 0);
    setUpdatePerfLikes(collab.performance?.likes ?? 0);
    setUpdatePerfComments(collab.performance?.comments ?? 0);
    setUpdatePerfShares(collab.performance?.shares ?? 0);
    setUpdatePerfClicks(collab.performance?.clicks ?? 0);
    setUpdatePerfReach(collab.performance?.reach || '0');
    setUpdatePerfEngagement(collab.performance?.engagement || '0%');
    setCollabModalError('');
  };

  // Save Collaboration Progress & Performance Update
  const handleSaveCollabUpdate = async () => {
    if (!selectedCollabToEdit) return;
    const progressNum = Number(updateProgressVal);
    if (isNaN(progressNum) || progressNum < 0 || progressNum > 100) {
      setCollabModalError('Progress percentage must be between 0 and 100.');
      return;
    }

    setUpdatingCollab(true);
    setCollabModalError('');

    try {
      const payload = {
        progress: progressNum,
        status: updateStatusVal,
        performance: {
          views: Number(updatePerfViews),
          likes: Number(updatePerfLikes),
          comments: Number(updatePerfComments),
          shares: Number(updatePerfShares),
          clicks: Number(updatePerfClicks),
          reach: String(updatePerfReach),
          engagement: String(updatePerfEngagement),
        }
      };

      const res = await collaborationsService.update(selectedCollabToEdit._id, payload);
      if (res.success && res.data) {
        setSuccessNotice('Collaboration progress & performance metrics updated successfully!');
        // Update local state immediately
        setCollaborations((prev) =>
          prev.map((c) => (c._id === selectedCollabToEdit._id ? res.data : c))
        );
        setSelectedCollabToEdit(null);

        // Refresh dashboard metrics
        const dashRes = isProject ? await dashboardService.getProjectDashboard() : await dashboardService.getCreatorDashboard();
        if (dashRes.success) setMetrics(dashRes.data);

        setTimeout(() => setSuccessNotice(''), 5000);
      } else {
        throw new Error(res.message || 'Failed to update collaboration');
      }
    } catch (err) {
      console.error('Update collaboration error:', err);
      setCollabModalError(err.message || 'Failed to save collaboration changes.');
    } finally {
      setUpdatingCollab(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="pt-28 pb-20 bg-[#FAF8FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Role Mismatch Warning Banner */}
        {roleMismatch && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Access Restricted: You are logged in as a <strong>{user?.role?.toUpperCase()}</strong>. Showing your role-assigned workspace.
              </span>
            </div>
            <button
              onClick={() => onNavigate('/dashboard')}
              className="px-3 py-1 rounded-lg bg-amber-200 text-amber-900 font-bold hover:bg-amber-300"
            >
              Go to My Dashboard
            </button>
          </div>
        )}

        {/* Success Notice Banner */}
        {successNotice && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-bold shadow-md animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Action Error Banner */}
        {actionError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between font-medium shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError('')} className="text-red-700 font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* User Profile Header Card */}
        <div className="rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-xl shadow-purple-900/5 backdrop-blur-xl mb-8 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#5146E5] via-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white font-extrabold text-2xl shadow-lg shadow-purple-500/25">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
                    {user?.name || 'Authenticated User'}
                  </h1>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                    {user?.role || 'User'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {user?.email} • Account ID: <span className="font-mono">{user?._id || 'N/A'}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isProject && (
                <>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center gap-1.5 hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Campaign Brief</span>
                  </button>
                </>
              )}
              {isCreator && (
                <>
                  <button
                    onClick={() => onNavigate('/campaigns')}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-purple-200" />
                    <span>Discover Campaigns</span>
                  </button>
                  <button
                    onClick={() => onNavigate('/analytics/creator')}
                    className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    <span>My Analytics</span>
                  </button>
                </>
              )}
              <button
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-all flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-purple-900 uppercase tracking-wider">Fetching live workspace metrics from MongoDB...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium mb-8">
            <AlertCircle className="w-5 h-5 text-red-500 mb-2" />
            <p className="font-bold">Error loading workspace data:</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Real MongoDB Dashboard Counters */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
              {isCreator ? (
                <>
                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Total Applications</span>
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                        <FileText className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">
                      {metrics?.totalApplications ?? 0}
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Submitted Briefs</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Pending</span>
                      <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-amber-600 font-mono mb-0.5">
                      {metrics?.pendingApplications ?? 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Awaiting Project Review</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Accepted</span>
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mb-0.5">
                      {metrics?.acceptedApplications ?? 0}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Approved Applications</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Active Collaborations</span>
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-indigo-600 font-mono mb-0.5">
                      {metrics?.activeCollaborations ?? 0}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">In Production</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Completed</span>
                      <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-cyan-600 font-mono mb-0.5">
                      {metrics?.completedCollaborations ?? 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Delivered Briefs</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Active Campaigns</span>
                      <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
                        <Briefcase className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-slate-900 font-mono mb-0.5">
                      {metrics?.activeCampaigns ?? 0}
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold">Published Briefs</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Total Applications</span>
                      <div className="p-2 rounded-xl bg-pink-100 text-pink-600">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-pink-600 font-mono mb-0.5">
                      {metrics?.totalApplications ?? 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Received Applications</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Accepted Applications</span>
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 font-mono mb-0.5">
                      {metrics?.acceptedApplications ?? metrics?.acceptedCreators ?? 0}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">Approved Creators</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Active Collaborations</span>
                      <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
                        <Flame className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-indigo-600 font-mono mb-0.5">
                      {metrics?.activeCollaborations ?? 0}
                    </div>
                    <span className="text-[10px] text-indigo-600 font-bold">Live Production</span>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-purple-100 shadow-md col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Completed</span>
                      <div className="p-2 rounded-xl bg-cyan-100 text-cyan-600">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-black text-cyan-600 font-mono mb-0.5">
                      {metrics?.completedCollaborations ?? 0}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">Verified Deliverables</span>
                  </div>
                </>
              )}
            </div>

            {/* Application Review Section (Project) / My Applications Section (Creator) */}
            <div className="rounded-3xl bg-white border border-purple-100 p-6 shadow-xl shadow-purple-900/5 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-sans">
                    {isCreator ? 'My Campaign Applications' : 'Project Application Review'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isCreator
                      ? 'Track real-time application status and approved project opportunities'
                      : 'Review creator submissions, evaluate proposals, and accept or reject applications'}
                  </p>
                </div>
                <button
                  onClick={() => onNavigate(isCreator ? '/campaigns' : '/creators')}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-xs transition-colors flex items-center gap-1 border border-purple-200"
                >
                  <span>Explore Marketplace</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {applications.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-purple-100 rounded-2xl">
                  <FileText className="w-10 h-10 text-purple-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No applications found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                    {isCreator
                      ? 'Browse available campaign briefs and submit your first collaboration application.'
                      : 'Create your first campaign brief to start receiving applications from top Web3 creators.'}
                  </p>
                  {isProject ? (
                    <button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:-translate-y-0.5 transition-all"
                    >
                      Post Project Brief
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigate('/campaigns')}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20"
                    >
                      Browse Open Campaigns
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-purple-50/80 text-purple-900 font-mono text-[11px] uppercase border-b border-purple-100 font-extrabold">
                      <tr>
                        <th className="p-3.5">{isCreator ? 'Campaign & Project' : 'Creator Applicant'}</th>
                        <th className="p-3.5">Campaign Title</th>
                        <th className="p-3.5">Application Message</th>
                        <th className="p-3.5">Applied Date</th>
                        <th className="p-3.5">Status</th>
                        {isProject && <th className="p-3.5 text-right">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100/70 font-medium">
                      {applications.map((app) => {
                        const isProcessing = processingAppId === app._id;
                        const creatorName = app.creatorId?.name || 'Creator Applicant';
                        const creatorEmail = app.creatorId?.email || '';
                        const campaignTitle = app.campaignId?.title || 'Web3 Campaign';
                        const projectName = app.projectId?.name || 'Token Project';
                        const appliedDate = app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recent';

                        return (
                          <tr key={app._id} className="hover:bg-purple-50/40 transition-colors">
                            <td className="p-3.5 font-bold text-slate-900">
                              {isCreator ? (
                                <div>
                                  <div className="font-extrabold text-slate-900">{campaignTitle}</div>
                                  <div className="text-[11px] text-purple-600 font-mono font-medium">{projectName}</div>
                                </div>
                              ) : (
                                <div>
                                  <div className="font-extrabold text-slate-900">{creatorName}</div>
                                  <div className="text-[11px] text-slate-500 font-mono">{creatorEmail}</div>
                                </div>
                              )}
                            </td>
                            <td className="p-3.5 font-semibold text-slate-800 max-w-xs truncate">
                              {campaignTitle}
                            </td>
                            <td className="p-3.5 text-slate-600 max-w-xs truncate">
                              "{app.message || 'Excited to collaborate!'}"
                            </td>
                            <td className="p-3.5 font-mono text-[11px] text-slate-500">
                              {appliedDate}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase inline-flex items-center gap-1 ${
                                app.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : app.status === 'rejected'
                                  ? 'bg-red-100 text-red-800 border border-red-200'
                                  : 'bg-amber-100 text-amber-800 border border-amber-200'
                              }`}>
                                {app.status === 'accepted' && <Check className="w-3 h-3 text-emerald-600" />}
                                {app.status === 'rejected' && <X className="w-3 h-3 text-red-600" />}
                                {app.status === 'pending' && <Clock className="w-3 h-3 text-amber-600" />}
                                {app.status}
                              </span>
                            </td>
                            {isProject && (
                              <td className="p-3.5 text-right">
                                {app.status === 'pending' ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      disabled={isProcessing}
                                      onClick={() => handleAcceptApplication(app._id)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                      <span>Accept</span>
                                    </button>
                                    <button
                                      disabled={isProcessing}
                                      onClick={() => handleRejectApplication(app._id)}
                                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-[11px] border border-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                      {isProcessing ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                      ) : (
                                        <X className="w-3 h-3" />
                                      )}
                                      <span>Reject</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-mono font-semibold">
                                    Processed
                                  </span>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Collaborations Section (Real MongoDB Data) */}
            <div className="rounded-3xl bg-white border border-purple-100 p-6 shadow-xl shadow-purple-900/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-extrabold text-slate-900 font-sans">
                      Active Collaborations & Production Pipeline
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Live MongoDB collaboration records, progress tracking, and performance metrics
                  </p>
                </div>
              </div>

              {collaborations.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-purple-100 rounded-2xl">
                  <Flame className="w-10 h-10 text-indigo-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No active collaborations</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">
                    {isProject
                      ? 'Accept creator applications above to initiate active campaign collaborations.'
                      : 'Once a project accepts your application, your active collaboration will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collaborations.map((collab) => {
                    const campaignTitle = collab.campaignId?.title || 'Web3 Campaign';
                    const partnerName = isProject
                      ? collab.creatorId?.name || 'Creator Partner'
                      : collab.projectId?.name || 'Project Sponsor';
                    const partnerEmail = isProject
                      ? collab.creatorId?.email || ''
                      : collab.projectId?.email || '';
                    const startDate = collab.startDate || collab.createdAt
                      ? new Date(collab.startDate || collab.createdAt).toLocaleDateString()
                      : 'Recent';

                    const progressPercent = collab.progress ?? 0;
                    const perf = collab.performance || {};

                    return (
                      <div
                        key={collab._id}
                        className="p-5 rounded-2xl bg-gradient-to-r from-purple-50/50 via-white to-indigo-50/30 border border-purple-100 shadow-sm"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-purple-100">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-extrabold text-slate-900 font-sans">
                                {campaignTitle}
                              </h4>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase ${
                                collab.status === 'completed'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : collab.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}>
                                {collab.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1 font-medium">
                              Partner: <strong className="text-slate-800">{partnerName}</strong> ({partnerEmail}) • Started: <span className="font-mono">{startDate}</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                            <button
                              onClick={() => onNavigate(`/messages?conversation=${collab._id}`)}
                              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Open Chat</span>
                            </button>
                            <button
                              onClick={() => onNavigate(`/agreements?agreement=${collab._id}`)}
                              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Agreement</span>
                            </button>
                            <button
                              onClick={() => handleOpenEditCollabModal(collab)}
                              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Update Progress</span>
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-700">Milestone Production Progress</span>
                            <span className="text-purple-700 font-mono">{progressPercent}%</span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-purple-100 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Performance Metrics Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Eye className="w-3 h-3 text-purple-600" /> Views
                            </span>
                            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                              {perf.views ?? 0}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Heart className="w-3 h-3 text-pink-600" /> Likes
                            </span>
                            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                              {perf.likes ?? 0}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                              <Users className="w-3 h-3 text-indigo-600" /> Reach
                            </span>
                            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                              {perf.reach || '0'}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-white border border-purple-100">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                              <TrendingUp className="w-3 h-3 text-emerald-600" /> Engagement
                            </span>
                            <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                              {perf.engagement || '0%'}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

      </div>

      {/* Create Campaign Modal */}
      {isCreateModalOpen && (
        <CreateCampaignModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCampaignCreatedSuccess}
        />
      )}

      {/* Update Collaboration Progress & Performance Modal */}
      {selectedCollabToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-purple-100 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setSelectedCollabToEdit(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-2xl bg-purple-100 text-purple-700">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 font-sans">Update Collaboration Progress</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {selectedCollabToEdit.campaignId?.title || 'Campaign Update'}
                </p>
              </div>
            </div>

            {collabModalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {collabModalError}
              </div>
            )}

            <div className="space-y-4">
              {/* Progress Slider & Input */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-extrabold text-slate-700 uppercase font-mono">
                    Progress Percentage (0 - 100%)
                  </label>
                  <span className="text-xs font-black text-purple-700 font-mono">{updateProgressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateProgressVal}
                  onChange={(e) => setUpdateProgressVal(e.target.value)}
                  className="w-full accent-purple-600 h-2 bg-purple-100 rounded-lg cursor-pointer"
                />
              </div>

              {/* Status Selector */}
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase font-mono block mb-1">
                  Collaboration Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-purple-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-purple-500 outline-none"
                >
                  <option value="active">active (In Production)</option>
                  <option value="in_progress">in_progress (Content Under Review)</option>
                  <option value="completed">completed (Deliverables Finalized)</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>

              {/* Performance Metrics Input Fields */}
              <div className="pt-2 border-t border-purple-100">
                <h4 className="text-xs font-extrabold text-slate-700 uppercase font-mono mb-3">
                  Performance Metrics
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Views Count</label>
                    <input
                      type="number"
                      min="0"
                      value={updatePerfViews}
                      onChange={(e) => setUpdatePerfViews(e.target.value)}
                      className="w-full p-2 rounded-lg border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Likes Count</label>
                    <input
                      type="number"
                      min="0"
                      value={updatePerfLikes}
                      onChange={(e) => setUpdatePerfLikes(e.target.value)}
                      className="w-full p-2 rounded-lg border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Total Reach</label>
                    <input
                      type="text"
                      value={updatePerfReach}
                      onChange={(e) => setUpdatePerfReach(e.target.value)}
                      placeholder="e.g. 25.4K"
                      className="w-full p-2 rounded-lg border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Engagement Rate</label>
                    <input
                      type="text"
                      value={updatePerfEngagement}
                      onChange={(e) => setUpdatePerfEngagement(e.target.value)}
                      placeholder="e.g. 8.2%"
                      className="w-full p-2 rounded-lg border border-purple-200 text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-purple-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedCollabToEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingCollab}
                  onClick={handleSaveCollabUpdate}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {updatingCollab ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save Update</span>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
