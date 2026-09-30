import React, { useState, useEffect } from 'react';
import ConversationList from '../components/Chat/ConversationList';
import ChatPanel from '../components/Chat/ChatPanel';
import ChatEmptyState from '../components/Chat/ChatEmptyState';
import { chatService } from '../services/chat';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export default function MessagesPage({ onNavigate }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await chatService.getConversations();
      if (res.success && Array.isArray(res.data)) {
        setConversations(res.data);

        // Check URL parameters ?conversation=<id> or ?collaboration=<id>
        const searchParams = new URLSearchParams(window.location.search);
        const urlConvId = searchParams.get('conversation') || searchParams.get('collaboration');

        if (urlConvId) {
          const found = res.data.find(
            (c) =>
              c.conversationId === urlConvId ||
              c._id === urlConvId ||
              c.collaborationId === urlConvId ||
              (c.collaborationId?._id && c.collaborationId._id === urlConvId)
          );

          if (found) {
            setActiveConversation(found);
            setMobileShowChat(true);
          } else {
            // Attempt to retrieve or create conversation for the given ID
            try {
              const fetchConvRes = await chatService.createOrGetConversation(urlConvId);
              if (fetchConvRes.success && fetchConvRes.data) {
                const newConv = fetchConvRes.data;
                const formatted = {
                  _id: newConv._id,
                  conversationId: newConv._id,
                  collaborationId: newConv.collaborationId?._id || newConv.collaborationId,
                  campaignId: newConv.campaignId?._id || newConv.campaignId,
                  campaignTitle: newConv.campaignId?.title || 'Web3 Campaign',
                  otherParticipant:
                    newConv.participants?.find((p) => p._id?.toString() !== user?._id?.toString()) ||
                    newConv.participants?.[0] ||
                    {},
                  lastMessage: newConv.lastMessage || null,
                  lastMessageAt: newConv.lastMessageAt || newConv.updatedAt,
                  unreadCount: 0,
                };
                setConversations((prev) => [formatted, ...prev]);
                setActiveConversation(formatted);
                setMobileShowChat(true);
              }
            } catch (err) {
              console.warn('[Get Conversation from URL failed]', err.message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Fetch Conversations Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const cleanupMessage = chatService.onMessage((msg) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.conversationId === msg.conversationId || c._id === msg.conversationId) {
            const isActive =
              activeConversation?.conversationId === msg.conversationId || activeConversation?._id === msg.conversationId;
            return {
              ...c,
              lastMessage: msg.message || msg.text,
              lastMessageAt: msg.createdAt,
              unreadCount: isActive ? 0 : (c.unreadCount || 0) + 1,
            };
          }
          return c;
        })
      );
    });

    return () => {
      cleanupMessage();
    };
  }, [activeConversation]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setMobileShowChat(true);

    setConversations((prev) =>
      prev.map((c) => (c._id === conv._id || c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleSendMessage = async (messageText) => {
    if (!activeConversation) return;

    const convId = activeConversation.conversationId || activeConversation._id;
    const res = await chatService.sendMessage(convId, messageText);

    setConversations((prev) =>
      prev.map((c) =>
        c._id === convId || c.conversationId === convId
          ? { ...c, lastMessage: messageText, lastMessageAt: new Date().toISOString() }
          : c
      )
    );

    return res;
  };

  return (
    <div className="pt-24 pb-12 bg-[#FAF8FF] min-h-screen flex flex-col">
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        {/* Page Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Real-Time Collaboration Messaging</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              Private <span className="text-gradient-purple">Messages</span>
            </h1>
          </div>
        </div>

        {/* Chat Container Window */}
        <div className="flex-1 bg-white rounded-3xl border border-purple-100 shadow-xl overflow-hidden flex min-h-[600px] max-h-[80vh]">
          {/* Left Conversation List Sidebar */}
          <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full`}>
            <ConversationList
              conversations={conversations}
              activeConversationId={activeConversation?.conversationId || activeConversation?._id}
              onSelectConversation={handleSelectConversation}
              loading={loading}
            />
          </div>

          {/* Right Active Chat Panel */}
          <div className={`${!mobileShowChat ? 'hidden md:flex' : 'flex'} flex-1 h-full`}>
            {activeConversation ? (
              <ChatPanel
                conversation={activeConversation}
                onBackMobile={() => setMobileShowChat(false)}
                onSendMessage={handleSendMessage}
              />
            ) : (
              <ChatEmptyState onNavigate={onNavigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
