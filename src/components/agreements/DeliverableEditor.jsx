import React from 'react';
import { Plus, Trash2, Video, Share2, FileText, Tv, Sparkles } from 'lucide-react';

const DELIVERABLE_TYPES = [
  { value: 'youtube_video', label: 'YouTube Video Review' },
  { value: 'youtube_short', label: 'YouTube Short / Reel' },
  { value: 'instagram_post', label: 'Instagram Post' },
  { value: 'instagram_reel', label: 'Instagram Reel' },
  { value: 'x_post', label: 'X (Twitter) Thread / Post' },
  { value: 'article', label: 'Blog / Medium Article' },
  { value: 'livestream', label: 'Live Stream Coverage' },
  { value: 'custom', label: 'Custom Deliverable' },
];

export default function DeliverableEditor({ deliverables, onChange, readOnly = false }) {
  const handleAdd = () => {
    if (readOnly) return;
    const newItem = {
      type: 'custom',
      description: '',
      quantity: 1,
      dueDate: '',
      platform: 'YouTube',
    };
    onChange([...deliverables, newItem]);
  };

  const handleRemove = (index) => {
    if (readOnly || deliverables.length <= 1) return;
    const updated = deliverables.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleUpdate = (index, field, value) => {
    if (readOnly) return;
    const updated = deliverables.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
          Structured Deliverables & Content Commitments
        </label>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAdd}
            className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs transition-all flex items-center gap-1 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Deliverable</span>
          </button>
        )}
      </div>

      {deliverables.length === 0 && (
        <p className="text-xs text-slate-400 italic">No deliverables specified.</p>
      )}

      {deliverables.map((item, index) => (
        <div
          key={index}
          className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between transition-all"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 w-full flex-1">
            {/* Type */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Type</span>
              <select
                disabled={readOnly}
                value={item.type || 'custom'}
                onChange={(e) => handleUpdate(index, 'type', e.target.value)}
                className="w-full bg-white text-xs text-slate-800 px-2.5 py-1.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium disabled:bg-slate-100"
              >
                {DELIVERABLE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <span className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Description</span>
              <input
                type="text"
                disabled={readOnly}
                placeholder="e.g. 10-minute dedicated video review"
                value={item.description || ''}
                onChange={(e) => handleUpdate(index, 'description', e.target.value)}
                className="w-full bg-white text-xs text-slate-800 px-3 py-1.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-medium disabled:bg-slate-100"
              />
            </div>

            {/* Quantity */}
            <div>
              <span className="text-[10px] font-mono text-slate-500 font-bold block mb-1">Qty</span>
              <input
                type="number"
                min="1"
                disabled={readOnly}
                value={item.quantity || 1}
                onChange={(e) => handleUpdate(index, 'quantity', Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-white text-xs text-slate-800 px-3 py-1.5 rounded-xl border border-purple-200 focus:outline-none focus:border-purple-600 font-bold font-mono disabled:bg-slate-100"
              />
            </div>
          </div>

          {!readOnly && deliverables.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-100 transition-all self-end sm:self-center"
              title="Remove deliverable"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
