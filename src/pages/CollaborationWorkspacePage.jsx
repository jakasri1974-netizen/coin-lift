import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Building2,
  User,
  DollarSign,
  FileText,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Calendar,
  Pencil,
  FileCheck,
  Plus,
  Trash2,
  Check,
  X,
  History,
} from 'lucide-react';

export default function CollaborationWorkspacePage({ collaborationId: propCollaborationId, onNavigate }) {
  const pathId = window.location.pathname.split('/').pop();
  const collaborationId = propCollaborationId || pathId;
  const { user } = useAuth();

  const handleGoBack = () => {
    if (onNavigate) {
      if (user?.role === 'CREATOR') onNavigate('/creator/profile');
      else if (user?.role === 'PROJECT_OWNER') onNavigate('/project/profile');
      else onNavigate('/');
    } else {
      window.history.back();
    }
  };

  // Main Workspace States
  const [collaboration, setCollaboration] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'agreement'

  const [newMessageContent, setNewMessageContent] = useState('');
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Digital Agreement States (Phase 10)
  const [agreement, setAgreement] = useState(null);
  const [agreementLoading, setAgreementLoading] = useState(true);
  const [agreementSubmitting, setAgreementSubmitting] = useState(false);
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);

  // Draft / Edit Form State
  const [formTitle, setFormTitle] = useState('');
  const [formScope, setFormScope] = useState('');
  const [formDeliverables, setFormDeliverables] = useState([]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [formRate, setFormRate] = useState('');
  const [formCurrency, setFormCurrency] = useState('USDC');
  const [formStartDate, setFormStartDate] = useState('');
  const [formDeadline, setFormDeadline] = useState('');

  // Rejection Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch collaboration details
  const fetchCollaborationDetails = async () => {
    try {
      const res = await apiRequest(`/collaborations/${collaborationId}`);
      if (res.success) {
        setCollaboration(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load collaboration workspace');
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages with polling
  const fetchMessages = async (isInitial = false) => {
    if (isInitial) setMessagesLoading(true);
    try {
      const res = await apiRequest(`/collaborations/${collaborationId}/messages`);
      if (res.success) {
        setMessages(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      if (isInitial) setMessagesLoading(false);
    }
  };

  // Fetch agreements for this collaboration
  const fetchAgreement = async () => {
    setAgreementLoading(true);
    try {
      const res = await apiRequest(`/collaborations/${collaborationId}/agreements`);
      if (res.success && res.data && res.data.length > 0) {
        const currentAgr = res.data[0];
        setAgreement(currentAgr);
        populateFormData(currentAgr);
      } else {
        setAgreement(null);
      }
    } catch (err) {
      console.error('Failed to load agreements:', err);
    } finally {
      setAgreementLoading(false);
    }
  };

  const populateFormData = (agr) => {
    if (agr) {
      setFormTitle(agr.title || '');
      setFormScope(agr.scope || '');
      setFormDeliverables(agr.deliverables || []);
      setFormRate(agr.rate?.toString() || '');
      setFormCurrency(agr.currency || 'USDC');
      setFormStartDate(agr.startDate ? new Date(agr.startDate).toISOString().split('T')[0] : '');
      setFormDeadline(agr.deadline ? new Date(agr.deadline).toISOString().split('T')[0] : '');
    }
  };

  const initNewDraftFromCollaboration = () => {
    setFormTitle(`${collaboration?.campaign?.title || 'Collaboration'} Agreement`);
    setFormScope(
      collaboration?.application?.proposal ||
      `Terms for collaboration on campaign: ${collaboration?.campaign?.title || ''}. Both parties agree to deliver required milestones on schedule.`
    );
    const initialDeliverables =
      collaboration?.application?.proposedDeliverables?.length > 0
        ? collaboration.application.proposedDeliverables
        : collaboration?.campaign?.deliverables?.length > 0
        ? collaboration.campaign.deliverables
        : ['1x Sponsored Video / Review'];
    setFormDeliverables(initialDeliverables);
    const initialRate =
      collaboration?.application?.proposedRate || collaboration?.campaign?.budget || 1000;
    setFormRate(initialRate.toString());
    setFormCurrency(collaboration?.campaign?.currency || 'USDC');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormDeadline(
      collaboration?.campaign?.endDate
        ? new Date(collaboration.campaign.endDate).toISOString().split('T')[0]
        : ''
    );
    setIsEditingAgreement(true);
  };

  useEffect(() => {
    fetchCollaborationDetails();
    fetchMessages(true);
    fetchAgreement();

    // Polling for live messages every 4 seconds
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [collaborationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageContent.trim()) return;

    setSending(true);
    setError(null);
    const contentToSend = newMessageContent.trim();
    setNewMessageContent('');

    try {
      const res = await apiRequest(`/collaborations/${collaborationId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: contentToSend }),
      });

      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data]);
        scrollToBottom();
      }
    } catch (err) {
      setError(err.message || 'Failed to send message');
      setNewMessageContent(contentToSend);
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this collaboration as ${newStatus}?`)) return;

    setStatusUpdating(true);
    setError(null);

    try {
      const res = await apiRequest(`/collaborations/${collaborationId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.success) {
        setCollaboration((prev) => (prev ? { ...prev, status: newStatus } : null));
        setSuccessMsg(`Collaboration marked as ${newStatus}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update collaboration status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Save or Create Agreement Draft
  const handleSaveDraft = async () => {
    setAgreementSubmitting(true);
    setError(null);

    const payload = {
      title: formTitle.trim(),
      scope: formScope.trim(),
      deliverables: formDeliverables.filter((d) => d.trim()),
      rate: parseFloat(formRate) || 0,
      currency: formCurrency.trim() || 'USDC',
      startDate: formStartDate || null,
      deadline: formDeadline || null,
    };

    if (!payload.title || !payload.scope || payload.deliverables.length === 0 || payload.rate <= 0) {
      setError('Please provide a title, scope, at least 1 deliverable, and a valid rate.');
      setAgreementSubmitting(false);
      return;
    }

    try {
      let res;
      if (agreement) {
        // Update existing agreement
        res = await apiRequest(`/agreements/${agreement.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Create new draft agreement
        res = await apiRequest(`/collaborations/${collaborationId}/agreements`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (res.success) {
        setAgreement(res.data);
        setIsEditingAgreement(false);
        setSuccessMsg('Agreement saved successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to save agreement draft');
    } finally {
      setAgreementSubmitting(false);
    }
  };

  // Submit Agreement for Creator Acceptance
  const handleSubmitAgreement = async () => {
    setAgreementSubmitting(true);
    setError(null);

    try {
      let targetId = agreement?.id;

      // First ensure latest edits are saved if currently editing
      if (isEditingAgreement) {
        const payload = {
          title: formTitle.trim(),
          scope: formScope.trim(),
          deliverables: formDeliverables.filter((d) => d.trim()),
          rate: parseFloat(formRate) || 0,
          currency: formCurrency.trim() || 'USDC',
          startDate: formStartDate || null,
          deadline: formDeadline || null,
        };

        if (targetId) {
          await apiRequest(`/agreements/${targetId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
          });
        } else {
          const createRes = await apiRequest(`/collaborations/${collaborationId}/agreements`, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          targetId = createRes.data?.id;
          setAgreement(createRes.data);
        }
      }

      if (!targetId) throw new Error('No agreement to submit');

      const submitRes = await apiRequest(`/agreements/${targetId}/submit`, {
        method: 'POST',
      });

      if (submitRes.success) {
        setAgreement(submitRes.data);
        setIsEditingAgreement(false);
        setSuccessMsg('Agreement officially submitted to Creator for review and acceptance.');
      }

    } catch (err) {
      setError(err.message || 'Failed to submit agreement');
    } finally {
      setAgreementSubmitting(false);
    }
  };

  // Creator Accepts Agreement
  const handleAcceptAgreement = async () => {
    if (!window.confirm('Do you agree to all deliverables, timelines, and legal scope specified in this agreement?')) {
      return;
    }

    setAgreementSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest(`/agreements/${agreement.id}/accept`, {
        method: 'POST',
      });

      if (res.success) {
        setAgreement(res.data);
        setSuccessMsg('You have accepted and digitally signed this agreement.');
      }
    } catch (err) {
      setError(err.message || 'Failed to accept agreement');
    } finally {
      setAgreementSubmitting(false);
    }
  };

  // Creator Rejects Agreement
  const handleRejectAgreement = async () => {
    if (!rejectionReasonInput.trim()) {
      alert('Please specify the reason for rejecting the agreement terms.');
      return;
    }

    setAgreementSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest(`/agreements/${agreement.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ rejectionReason: rejectionReasonInput.trim() }),
      });

      if (res.success) {
        setAgreement(res.data);
        setShowRejectModal(false);
        setRejectionReasonInput('');
        setSuccessMsg('Agreement returned to Project Owner with your feedback.');
      }
    } catch (err) {
      setError(err.message || 'Failed to reject agreement');
    } finally {
      setAgreementSubmitting(false);
    }
  };

  const handleAddDeliverable = () => {
    if (newDeliverableInput.trim()) {
      setFormDeliverables([...formDeliverables, newDeliverableInput.trim()]);
      setNewDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index) => {
    setFormDeliverables(formDeliverables.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050811] flex items-center justify-center p-6 font-sans">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">Loading Collaboration Workspace...</p>
        </div>
      </div>
    );
  }

  if (error && !collaboration) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md bg-[#090e1a] border border-white/10 p-8 rounded-3xl text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-white">Access Denied or Not Found</h2>
          <p className="text-xs text-slate-400">{error}</p>
          <button
            onClick={handleGoBack}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user?.role === 'CREATOR';
  const isProjectOwner = user?.role === 'PROJECT_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const getAgreementStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            AGREEMENT ACCEPTED & SIGNED
          </span>
        );
      case 'PENDING_ACCEPTANCE':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            PENDING CREATOR ACCEPTANCE
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            AGREEMENT REJECTED
          </span>
        );
      case 'DRAFT':
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            AGREEMENT DRAFT
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Navigation Topbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleGoBack}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs flex items-center gap-2 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Secure Participant Workspace
            </span>
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Phase 10 Action Callout Banner */}
        {isCreator && agreement?.status === 'PENDING_ACCEPTANCE' && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-purple-950/60 border border-cyan-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0">
                <FileCheck className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Action Required: Digital Agreement Pending Acceptance</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  The Project Owner submitted agreement terms for <span className="font-mono text-cyan-300">${agreement.rate} {agreement.currency}</span>. Review and accept or reject.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('agreement')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shrink-0 shadow-lg shadow-cyan-500/20"
            >
              Review Agreement Now
            </button>
          </div>
        )}

        {isProjectOwner && agreement?.status === 'REJECTED' && (
          <div className="p-5 rounded-3xl bg-red-950/40 border border-red-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-300 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Agreement Terms Rejected by Creator</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Feedback: <span className="italic text-red-300">"{agreement.rejectionReason}"</span>. Please revise and resubmit.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                populateFormData(agreement);
                setIsEditingAgreement(true);
                setActiveTab('agreement');
              }}
              className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 font-bold text-xs shrink-0"
            >
              Revise & Resubmit Agreement
            </button>
          </div>
        )}

        {/* Workspace Header Card */}
        <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                  {collaboration?.campaign?.category || 'Campaign'}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${
                    collaboration?.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : collaboration?.status === 'COMPLETED'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}
                >
                  {collaboration?.status === 'ACTIVE' && <Clock className="w-3.5 h-3.5 animate-pulse" />}
                  {collaboration?.status === 'COMPLETED' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
                  {collaboration?.status === 'CANCELLED' && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  {collaboration?.status}
                </span>

                {agreement && getAgreementStatusBadge(agreement.status)}
              </div>

              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {collaboration?.campaign?.title}
              </h1>

              <div className="flex items-center gap-6 text-xs text-slate-400 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 font-bold">{collaboration?.project?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-slate-200 font-bold">{collaboration?.creator?.displayName}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Started: {new Date(collaboration?.startedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Collaboration Status Controls */}
            {collaboration?.status === 'ACTIVE' && (
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  disabled={statusUpdating}
                  className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancel Workspace</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={statusUpdating}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Completed</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-slate-400 font-mono uppercase text-[10px] block flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Agreed Rate & Budget
              </span>
              <p className="text-lg font-bold text-cyan-400 font-mono">
                ${agreement ? agreement.rate?.toLocaleString() : (collaboration?.application?.proposedRate?.toLocaleString() || collaboration?.campaign?.budget?.toLocaleString())} {agreement ? agreement.currency : (collaboration?.campaign?.currency || 'USDC')}
              </p>
            </div>

            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-slate-400 font-mono uppercase text-[10px] block flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Contract Status
              </span>
              <p className="text-slate-200 font-bold text-sm">
                {agreement ? (
                  <span className="text-cyan-300 font-mono uppercase">{agreement.status.replace('_', ' ')} (v{agreement.version})</span>
                ) : (
                  <span className="text-slate-400 italic">No formal contract created yet</span>
                )}
              </p>
            </div>

            <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-2">
              <span className="text-slate-400 font-mono uppercase text-[10px] block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Proposal Pitch
              </span>
              <p className="text-slate-200 line-clamp-2 leading-relaxed">
                {collaboration?.application?.proposal}
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Collaboration Discussion ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('agreement')}
            className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2.5 transition-all ${
              activeTab === 'agreement'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Digital Agreement {agreement ? `(${agreement.status})` : ''}</span>
            {agreement?.status === 'PENDING_ACCEPTANCE' && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            )}
          </button>
        </div>

        {/* TAB 1: Chat Discussion */}
        {activeTab === 'chat' && (
          <div className="bg-[#090e1a] rounded-3xl border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[600px]">

            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-[#050811] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Collaboration Discussion</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Auto-refreshing messaging</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 bg-[#050811]/40">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                  <MessageSquare className="w-12 h-12 text-slate-600" />
                  <p className="text-sm font-bold text-white">No messages exchanged yet</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Send a message to discuss timeline, content drafts, and deliverables with your project partner.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {isMine ? 'You' : msg.sender?.name || 'Partner'} ({msg.sender?.role})
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div
                        className={`max-w-md md:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-md ${
                          isMine
                            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-none font-sans'
                            : 'bg-[#090e1a] text-slate-200 border border-white/10 rounded-bl-none font-sans'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Bar */}
            <div className="p-4 border-t border-white/10 bg-[#090e1a]">
              {collaboration?.status === 'COMPLETED' || collaboration?.status === 'CANCELLED' ? (
                <div className="p-3 text-center text-xs font-mono text-slate-400 bg-white/5 rounded-xl border border-white/10">
                  This collaboration is {collaboration?.status.toLowerCase()}. Message sending is closed.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    placeholder="Type your message to collaborate..."
                    disabled={sending}
                    className="flex-1 bg-[#050811] text-xs text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessageContent.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: Digital Agreement & Contract (Phase 10) */}
        {activeTab === 'agreement' && (
          <div className="bg-[#090e1a] rounded-3xl border border-white/10 p-6 md:p-8 space-y-6 shadow-2xl">

            {agreementLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                <p className="text-xs font-mono text-slate-400">Loading agreement records...</p>
              </div>
            ) : isEditingAgreement ? (
              /* Agreement Drafting / Editing Form (Project Owner only) */
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">
                      {agreement ? 'Revise Digital Agreement' : 'Draft Digital Agreement'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Formalize the bilateral scope of work, deliverables checklist, agreed payment, and deadlines.
                    </p>
                  </div>
                  {agreement && (
                    <button
                      onClick={() => setIsEditingAgreement(false)}
                      className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Agreement Title *</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., Q4 Token Launch YouTube Deep-Dive Agreement"
                      className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Agreed Rate */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Agreed Compensation Rate *</label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={formRate}
                        onChange={(e) => setFormRate(e.target.value)}
                        placeholder="1500"
                        className="w-full bg-[#050811] text-xs text-white pl-9 pr-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Currency */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Currency</label>
                    <select
                      value={formCurrency}
                      onChange={(e) => setFormCurrency(e.target.value)}
                      className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="USDC">USDC</option>
                      <option value="USDT">USDT</option>
                      <option value="SOL">SOL</option>
                      <option value="ETH">ETH</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Start Date</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Deadline */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Completion Deadline</label>
                    <input
                      type="date"
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  {/* Scope of Work */}
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-slate-200">Scope of Work & Legal Terms *</label>
                    <textarea
                      rows={4}
                      value={formScope}
                      onChange={(e) => setFormScope(e.target.value)}
                      placeholder="Specify deliverables guidelines, compliance statements, content approval terms, and publishing schedule..."
                      className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500 leading-relaxed"
                    />
                  </div>

                  {/* Deliverables Checklist */}
                  <div className="md:col-span-2 space-y-3">
                    <label className="text-xs font-bold text-slate-200">Required Deliverables List *</label>
                    <div className="space-y-2">
                      {formDeliverables.map((deliv, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#050811] border border-white/5">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span className="text-xs text-slate-200 flex-1">{deliv}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDeliverable(idx)}
                            className="p-1 text-slate-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newDeliverableInput}
                          onChange={(e) => setNewDeliverableInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddDeliverable();
                            }
                          }}
                          placeholder="Add a deliverable item (e.g., '1x YouTube Video at least 8 mins long')..."
                          className="flex-1 bg-[#050811] text-xs text-white px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddDeliverable}
                          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={agreementSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {agreementSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    <span>Save Draft</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitAgreement}
                    disabled={agreementSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {agreementSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Submit for Creator Review</span>
                  </button>
                </div>
              </div>
            ) : !agreement ? (
              /* No Agreement Exists Yet */
              <div className="p-12 text-center space-y-4">
                <FileText className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No Digital Agreement Created Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  A digital agreement formalizes the collaboration scope, deliverables, compensation, and schedule between both parties.
                </p>

                {isProjectOwner ? (
                  <button
                    onClick={initNewDraftFromCollaboration}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Draft Agreement Terms</span>
                  </button>
                ) : (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 max-w-sm mx-auto">
                    Awaiting Project Owner to draft and submit the digital contract.
                  </div>
                )}
              </div>
            ) : (
              /* Agreement View Mode */
              <div className="space-y-6">

                {/* Header & Status */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-2">
                      {getAgreementStatusBadge(agreement.status)}
                      <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
                        Revision v{agreement.version || 1}
                      </span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight">
                      {agreement.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Referenced Campaign: <span className="text-slate-200 font-semibold">{agreement.campaign?.title}</span>
                    </p>
                  </div>

                  {/* Actions for Project Owner on Draft/Rejected */}
                  {isProjectOwner && (agreement.status === 'DRAFT' || agreement.status === 'REJECTED') && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => {
                          populateFormData(agreement);
                          setIsEditingAgreement(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Edit Terms</span>
                      </button>

                      <button
                        onClick={handleSubmitAgreement}
                        disabled={agreementSubmitting}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition-all"
                      >
                        {agreementSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        <span>Submit to Creator</span>
                      </button>
                    </div>
                  )}

                  {/* Actions for Creator on PENDING_ACCEPTANCE */}
                  {isCreator && agreement.status === 'PENDING_ACCEPTANCE' && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={agreementSubmitting}
                        className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject Terms</span>
                      </button>

                      <button
                        onClick={handleAcceptAgreement}
                        disabled={agreementSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                      >
                        {agreementSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        <span>Accept & Sign Agreement</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Rejection Alert if REJECTED */}
                {agreement.status === 'REJECTED' && agreement.rejectionReason && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-1">
                    <div className="flex items-center gap-2 font-bold text-red-400">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Creator Rejection Reason:</span>
                    </div>
                    <p className="text-slate-300 italic pl-6">{agreement.rejectionReason}</p>
                  </div>
                )}

                {/* Acceptance Certified Banner if ACCEPTED */}
                {agreement.status === 'ACCEPTED' && (
                  <div className="p-5 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-4 text-xs text-emerald-300 shadow-xl">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-white text-sm">Digitally Accepted & Executed Contract</h4>
                      <p className="text-emerald-400/90 font-mono text-[11px] mt-0.5">
                        Accepted by Creator on {new Date(agreement.creatorAcceptedAt).toLocaleString()} • Immutable Record
                      </p>
                    </div>
                  </div>
                )}

                {/* Parties Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-1.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Contracting Project Owner</span>
                    <p className="font-bold text-white text-sm">{agreement.project?.name}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{agreement.projectOwner?.email}</p>
                  </div>

                  <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-1.5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase block">Contracted Creator</span>
                    <p className="font-bold text-white text-sm">{agreement.creator?.displayName}</p>
                    <p className="text-slate-400 font-mono text-[11px]">{agreement.creator?.category}</p>
                  </div>
                </div>

                {/* Financials & Timeline Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-cyan-400" /> Agreed Compensation
                    </span>
                    <p className="text-xl font-bold font-mono text-cyan-400">
                      ${agreement.rate?.toLocaleString()} {agreement.currency}
                    </p>
                  </div>

                  <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Start Date
                    </span>
                    <p className="text-slate-200 font-mono">
                      {agreement.startDate ? new Date(agreement.startDate).toLocaleDateString() : 'Immediate'}
                    </p>
                  </div>

                  <div className="bg-[#050811] p-4 rounded-2xl border border-white/5 space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" /> Delivery Deadline
                    </span>
                    <p className="text-slate-200 font-mono">
                      {agreement.deadline ? new Date(agreement.deadline).toLocaleDateString() : 'Open Timeline'}
                    </p>
                  </div>
                </div>

                {/* Scope of Work Block */}
                <div className="space-y-2 text-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Scope of Work & Conditions</span>
                  <div className="p-5 rounded-2xl bg-[#050811] border border-white/5 text-slate-200 leading-relaxed whitespace-pre-line text-xs font-sans">
                    {agreement.scope}
                  </div>
                </div>

                {/* Deliverables Checklist */}
                <div className="space-y-3 text-xs">
                  <span className="text-slate-400 font-mono text-[10px] uppercase block">Mandatory Deliverables Checklist</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {agreement.deliverables?.map((deliv, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-3.5 rounded-xl bg-[#050811] border border-white/5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-slate-200 text-xs font-medium">{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audit & Security Footer */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
                  <span>Agreement Reference ID: {agreement.id}</span>
                  <span>Created: {new Date(agreement.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(agreement.updatedAt).toLocaleDateString()}</span>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Creator Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#090e1a] border border-white/10 w-full max-w-md rounded-3xl p-6 md:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Reject Agreement Terms
              </h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Please specify why you are declining these agreement terms so the Project Owner can revise and adjust:
            </p>

            <textarea
              rows={4}
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g., The timeline is too tight for the required 2 video reviews, or the agreed rate doesn't reflect the requested revisions..."
              className="w-full bg-[#050811] text-xs text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-red-500 leading-relaxed"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectAgreement}
                disabled={agreementSubmitting || !rejectionReasonInput.trim()}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-50 transition-colors"
              >
                {agreementSubmitting ? 'Submitting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
