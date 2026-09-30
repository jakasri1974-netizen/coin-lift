import React from 'react';
import { Check, CheckCheck, ExternalLink } from 'lucide-react';

export default function MessageBubble({ message, isOwn }) {
  if (!message) return null;

  const content = message.message || '';
  const isLink = message.messageType === 'link' || /^https?:\/\/[^\s]+$/i.test(content);
  const formattedTime = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // Safe URL link renderer
  const renderMessageContent = () => {
    if (isLink) {
      const url = content.startsWith('http') ? content : `https://${content}`;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline inline-flex items-center gap-1 font-mono hover:opacity-80 break-all"
        >
          <span>{content}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }

    // Render plain text with URL replacement
    const parts = content.split(/(https?:\/\/[^\s]+)/g);
    return parts.map((part, index) => {
      if (/^https?:\/\/[^\s]+$/i.test(part)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline inline-flex items-center gap-1 font-mono hover:opacity-80 break-all"
          >
            <span>{part}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className={`flex flex-col mb-3 ${isOwn ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[82%] sm:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm text-xs leading-relaxed ${
          isOwn
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none'
            : 'bg-white text-slate-800 border border-purple-100 rounded-bl-none shadow-xs'
        }`}
      >
        <p className="font-medium break-words">{renderMessageContent()}</p>

        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-mono ${isOwn ? 'text-purple-200' : 'text-slate-400'}`}>
          <span>{formattedTime}</span>
          {isOwn && (
            message.isRead ? (
              <CheckCheck className="w-3 h-3 text-cyan-300" />
            ) : (
              <Check className="w-3 h-3 opacity-70" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
