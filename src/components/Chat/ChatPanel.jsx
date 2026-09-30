import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import OnlineStatus from './OnlineStatus';
import { chatService } from '../../services/chat';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel({ conversation, onBackMobile, onSendMessage }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [isOnline, setIsOnline] = useState(false);

  const messagesEndRef = useRef(null);
  const conversationId = conversation?.conversationId || conversation?._id;
  const currentUserId = user?._id?.toString();

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (!conversationId) return;

    const fetchInitialMessages = async () => {
      setLoading(true);
      try {
        const res = await chatService.getMessages(conversationId, 1, 30);
        if (res.success && Array.isArray(res.data)) {
          setMessages(res.data);
          setPage(1);
          setTotalPages(res.pagination?.totalPages || res.totalPages || 1);

          chatService.markConversationReadAll(conversationId);
        }
      } catch (err) {
        console.warn('[Fetch Messages Error]', err.message);
      } finally {
        setLoading(false);
        setTimeout(() => scrollToBottom(false), 100);
      }
    };

    fetchInitialMessages();

    chatService.joinConversation(conversationId);

    return () => {
      chatService.leaveConversation(conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const cleanupMessage = chatService.onMessage((msg) => {
      if (msg.conversationId?.toString() === conversationId.toString()) {
        setMessages((prev) => {
          if (prev.some((m) => (m._id || m.messageId) === (msg._id || msg.messageId))) {
            return prev;
          }
          return [...prev, msg];
        });

        if (msg.senderId?.toString() !== currentUserId) {
          chatService.markConversationReadAll(conversationId);
        }

        setTimeout(() => scrollToBottom(true), 50);
      }
    });

    const cleanupTyping = chatService.onTyping((data) => {
      if (data.conversationId?.toString() === conversationId.toString()) {
        setIsTyping(data.isTyping);
        setTypingUser(data.userName || 'Other user');
      }
    });

    const cleanupOnline = chatService.onOnline((data) => {
      if (data.conversationId?.toString() === conversationId.toString()) {
        setIsOnline(true);
      }
    });

    const cleanupOffline = chatService.onOffline((data) => {
      if (data.conversationId?.toString() === conversationId.toString()) {
        setIsOnline(false);
      }
    });

    const cleanupRead = chatService.onRead((data) => {
      if (data.conversationId?.toString() === conversationId.toString()) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
    });

    return () => {
      cleanupMessage();
      cleanupTyping();
      cleanupOnline();
      cleanupOffline();
      cleanupRead();
    };
  }, [conversationId, currentUserId]);

  const handleLoadOlderMessages = async () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res = await chatService.getMessages(conversationId, nextPage, 30);
      if (res.success && Array.isArray(res.data)) {
        setMessages((prev) => [...res.data, ...prev]);
        setPage(nextPage);
      }
    } catch (err) {
      console.warn('[Load Older Error]', err.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const other = conversation?.otherParticipant || {};
  const isReadOnly = ['completed', 'cancelled'].includes(conversation?.collaborationStatus);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9FF] relative overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-white border-b border-purple-100 flex items-center justify-between shrink-0 shadow-2xs">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              className="md:hidden p-2 rounded-xl bg-purple-50 text-slate-700 hover:bg-purple-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
            {(other.name || 'U').charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 font-sans">{other.name || 'User'}</h3>
              <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                {other.role === 'project' ? 'Project' : 'Creator'}
              </span>
            </div>
            <p className="text-[11px] text-purple-700 font-medium">{conversation?.campaignTitle}</p>
          </div>
        </div>

        <OnlineStatus isOnline={isOnline} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {page < totalPages && (
          <div className="text-center my-3">
            <button
              disabled={loadingMore}
              onClick={handleLoadOlderMessages}
              className="px-4 py-1.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-50 transition-all inline-flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {loadingMore ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Load older messages</span>
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-2">
            <Loader2 className="w-7 h-7 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">Loading conversation history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs font-medium">
            Start the conversation.
          </div>
        ) : (
          messages.map((msg, index) => {
            const senderIdStr = (msg.senderId?._id || msg.senderId)?.toString();
            const isOwn = senderIdStr === currentUserId;
            return <MessageBubble key={msg._id || index} message={msg} isOwn={isOwn} />;
          })
        )}

        <TypingIndicator isTyping={isTyping} typingUser={typingUser} />
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        conversationId={conversationId}
        onSendMessage={onSendMessage}
        disabled={loading}
        isReadOnly={isReadOnly}
      />
    </div>
  );
}
