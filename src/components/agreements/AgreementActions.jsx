import React, { useState } from 'react';
import { CheckCircle2, XCircle, Edit3, AlertTriangle, Loader2 } from 'lucide-react';
import { agreementsService } from '../../services/api';

export default function AgreementActions({ agreement, currentUserId, currentUserRole, onRefresh, onEdit }) {
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  if (!agreement) return null;

  const creatorIdStr = (agreement.creatorId?._id || agreement.creatorId)?.toString();
  const projectIdStr = (agreement.projectId?._id || agreement.projectId)?.toString();
  const isCreator = currentUserId === creatorIdStr || currentUserRole === 'creator';
  const isProject = currentUserId === projectIdStr || currentUserRole === 'project';

  const userHasAccepted = isCreator ? agreement.creatorAccepted : isProject ? agreement.projectAccepted : false;
  const isTerminal = ['rejected', 'cancelled', 'completed'].includes(agreement.status);

  const handleAccept = async () => {
    if (loading || userHasAccepted || isTerminal) return;
    setLoading(true);
    setActionError('');
    try {
      const res = await agreementsService.acceptAgreement(agreement._id);
      if (res.success) {
        onRefresh();
      } else {
        throw new Error(res.message || 'Failed to accept agreement');
      }
    } catch (err) {
      console.error('Accept agreement error:', err);
      setActionError(err.message || 'Failed to accept agreement.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (loading || isTerminal) return;
    if (!window.confirm('Are you sure you want to reject this collaboration agreement?')) return;
    setLoading(true);
    setActionError('');
    try {
      const res = await agreementsService.rejectAgreement(agreement._id);
      if (res.success) {
        onRefresh();
      } else {
        throw new Error(res.message || 'Failed to reject agreement');
      }
    } catch (err) {
      console.error('Reject agreement error:', err);
      setActionError(err.message || 'Failed to reject agreement.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (loading || agreement.status === 'cancelled') return;
    if (!window.confirm('Are you sure you want to cancel this agreement?')) return;
    setLoading(true);
    setActionError('');
    try {
      const res = await agreementsService.cancelAgreement(agreement._id);
      if (res.success) {
        onRefresh();
      } else {
        throw new Error(res.message || 'Failed to cancel agreement');
      }
    } catch (err) {
      console.error('Cancel agreement error:', err);
      setActionError(err.message || 'Failed to cancel agreement.');
    } finally {
      setLoading(false);
    }
  };

  if (isTerminal) {
    return (
      <div className="p-3 bg-slate-100 rounded-xl text-center text-xs text-slate-500 font-bold font-mono">
        Agreement status is '{agreement.status.toUpperCase()}'. No further actions available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
          {actionError}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {/* Accept Button */}
        <button
          disabled={loading || userHasAccepted}
          onClick={handleAccept}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          <span>{userHasAccepted ? 'You Have Signed Off' : 'Accept & Sign Agreement'}</span>
        </button>

        {/* Edit Button */}
        {onEdit && (
          <button
            disabled={loading}
            onClick={onEdit}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Terms</span>
          </button>
        )}

        {/* Reject Button */}
        <button
          disabled={loading}
          onClick={handleReject}
          className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-extrabold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4 text-red-600" />
          <span>Reject Terms</span>
        </button>

        {/* Cancel Button */}
        <button
          disabled={loading}
          onClick={handleCancel}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <AlertTriangle className="w-4 h-4 text-slate-500" />
          <span>Cancel Agreement</span>
        </button>
      </div>
    </div>
  );
}
