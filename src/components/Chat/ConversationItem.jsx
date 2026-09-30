import React from 'react';

export default function ConversationItem({ conv, isActive, onSelect }) {
  const other = conv.otherParticipant || {};
  const isProject = other.role === 'project';
  const initial = (other.name || 'U').charAt(0).toUpperCase();

  return (
    <div
      onClick={() => onSelect(conv)}
      className={`p-4 cursor-pointer transition-all flex items-start gap-3 border-l-4 ${
        isActive
          ? 'bg-purple-50/80 border-purple-600'
          : 'bg-white border-transparent hover:bg-purple-50/40'
      }`}
    >
      <div className="relative shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
          {initial}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <h4 className="text-xs font-extrabold text-slate-900 truncate font-sans">{other.name || 'User'}</h4>
          <span className="text-[10px] font-mono text-slate-400 shrink-0">
            {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
            {isProject ? 'Project' : 'Creator'}
          </span>
          <span className="text-[11px] text-purple-700 font-semibold truncate">
            {conv.campaignTitle}
          </span>
        </div>

        <p className="text-xs text-slate-500 truncate font-medium">
          {conv.lastMessage || 'No messages yet'}
        </p>
      </div>

      {conv.unreadCount > 0 && (
        <span className="px-2 py-0.5 text-[10px] font-black text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shrink-0 shadow-xs">
          {conv.unreadCount}
        </span>
      )}
    </div>
  );
}
