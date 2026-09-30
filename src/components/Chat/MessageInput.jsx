import React, { useState, useRef } from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { chatService } from '../../services/chat';

export default function MessageInput({ conversationId, onSendMessage, disabled, isReadOnly }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);

    if (conversationId && !disabled && !isReadOnly) {
      // Send typing indicator
      chatService.sendTyping(conversationId, true);

      // Debounce stop typing signal
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTyping(conversationId, false);
      }, 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending || disabled || isReadOnly) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    chatService.sendTyping(conversationId, false);

    setSending(true);
    try {
      await onSendMessage(trimmed);
      setMessage('');
    } catch (err) {
      console.warn('[Message Send Failed]', err);
    } finally {
      setSending(false);
    }
  };

  if (isReadOnly) {
    return (
      <div className="p-4 bg-purple-50/70 border-t border-purple-100 text-center">
        <p className="text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-purple-600" />
          <span>This collaboration is completed. Chat is read-only.</span>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-purple-100 flex items-center gap-3">
      <input
        type="text"
        value={message}
        onChange={handleInputChange}
        maxLength={2000}
        disabled={disabled || sending}
        placeholder="Type your message..."
        className="flex-1 bg-purple-50/50 text-xs text-slate-900 px-4 py-3 rounded-2xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!message.trim() || sending || disabled}
        className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 hover:shadow-purple-500/35 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 shrink-0"
      >
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <>
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
