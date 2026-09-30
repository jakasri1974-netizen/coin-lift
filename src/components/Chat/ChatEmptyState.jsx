import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function ChatEmptyState({ title, description, onNavigate }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#FAF9FF] h-full">
      <div className="w-16 h-16 rounded-3xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
        <MessageSquare className="w-8 h-8" />
      </div>
      <h3 className="text-base font-extrabold text-slate-900 font-sans mb-1">
        {title || 'Private Collaboration Chat'}
      </h3>
      <p className="text-xs text-slate-500 font-medium max-w-sm mb-6 leading-relaxed">
        {description || 'Select an active conversation to discuss deliverables, share updates, and coordinate campaign execution in real time.'}
      </p>

      {onNavigate && (
        <button
          onClick={() => onNavigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-white border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-50 transition-all shadow-2xs inline-flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          <span>View Active Collaborations</span>
        </button>
      )}
    </div>
  );
}
