import React from 'react';

export default function TypingIndicator({ isTyping, typingUser = 'User' }) {
  if (!isTyping) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-bold text-purple-600 italic py-2 pl-2 animate-pulse">
      <span className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{typingUser} is typing...</span>
    </div>
  );
}
