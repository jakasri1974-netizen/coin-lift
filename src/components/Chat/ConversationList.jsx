import React, { useState } from 'react';
import { Search, MessageSquare, Loader2 } from 'lucide-react';
import ConversationItem from './ConversationItem';

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  loading,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter((conv) => {
    const nameMatch = (conv.otherParticipant?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const campMatch = (conv.campaignTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || campMatch;
  });

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-purple-100 flex flex-col h-full shrink-0">
      {/* Search Header */}
      <div className="p-4 border-b border-purple-100 bg-[#FAF9FF]">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search name or campaign..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white text-xs text-slate-900 pl-10 pr-4 py-2.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto divide-y divide-purple-50">
        {loading ? (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading chats...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="py-12 text-center p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-purple-200 mx-auto" />
            <p className="text-xs font-bold text-slate-800">You don't have any conversations yet.</p>
            <p className="text-[11px] text-slate-500 font-medium">
              {searchTerm ? 'Try clearing your search query.' : 'Chats automatically activate when a campaign application is accepted.'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isActive = conv.conversationId === activeConversationId || conv._id === activeConversationId;
            return (
              <ConversationItem
                key={conv.conversationId || conv._id}
                conv={conv}
                isActive={isActive}
                onSelect={onSelectConversation}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
