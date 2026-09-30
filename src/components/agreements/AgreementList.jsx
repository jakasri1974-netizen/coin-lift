import React, { useState } from 'react';
import { Search, FileText, Loader2, Filter } from 'lucide-react';
import AgreementCard from './AgreementCard';

const STATUS_TABS = [
  { id: 'all', label: 'All Agreements' },
  { id: 'pending_creator', label: 'Pending Creator' },
  { id: 'pending_project', label: 'Pending Project' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected / Cancelled' },
];

export default function AgreementList({
  agreements,
  loading,
  onSelectAgreement,
  selectedStatusFilter,
  onStatusFilterChange,
  searchTerm,
  onSearchChange,
  currentUserId,
}) {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search agreement title, campaign, or partner..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-white text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-2xl border border-purple-100 focus:outline-none focus:border-purple-600 font-medium shadow-2xs"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onStatusFilterChange(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'bg-white text-slate-600 border border-purple-100 hover:bg-purple-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Agreement Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-2">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading collaboration agreements...</p>
        </div>
      ) : agreements.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-purple-100 p-8 space-y-3">
          <FileText className="w-12 h-12 text-purple-200 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900 font-sans">No agreements found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
            {searchTerm || selectedStatusFilter !== 'all'
              ? 'Try clearing your search query or status filter.'
              : 'Agreements are automatically created when a campaign application is accepted, or created directly from active collaborations.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agreements.map((agreement) => (
            <AgreementCard
              key={agreement._id}
              agreement={agreement}
              onSelect={onSelectAgreement}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
