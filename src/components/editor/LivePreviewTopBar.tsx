import React from 'react';
import { Eye, Pencil, Sparkles } from 'lucide-react';
import { useVisualEditor } from './VisualEditorContext';

interface LivePreviewTopBarProps {
  onBackToDashboard: () => void;
  onCloseAdmin: () => void;
}

export const LivePreviewTopBar: React.FC<LivePreviewTopBarProps> = ({
  onBackToDashboard,
  onCloseAdmin,
}) => {
  const { showEditIcons, setShowEditIcons } = useVisualEditor();

  return (
    <div className="sticky top-0 z-[100] bg-neutral-900/95 backdrop-blur-md text-white px-3 sm:px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between border-b border-amber-500/40 gap-2 select-none">
      <div className="flex items-center gap-3">
        <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <div className="flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-amber-400" />
          <span className="text-xs sm:text-sm font-bold tracking-wide">লাইভ প্রিভিউ ও ভিজ্যুয়াল এডিটর</span>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-neutral-300 border-l border-neutral-700 pl-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>যেকোনো লেখা, ছবি বা পণ্যের পাশের <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">✏️ এডিট</span> আইকনে ক্লিক করে সরাসরি পরিবর্তন করুন</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Toggle Edit Icons Button */}
        <button
          type="button"
          onClick={() => setShowEditIcons(!showEditIcons)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
            showEditIcons
              ? 'bg-amber-400 text-neutral-950 border-amber-500 shadow-sm'
              : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
          }`}
          title="এডিট আইকন দেখানো বা লুকানোর বাটন"
        >
          <Pencil className="w-3 h-3" />
          <span>এডিট আইকন: {showEditIcons ? 'সক্রিয় (ON)' : 'লুকানো (OFF)'}</span>
        </button>

        {/* Back to Dashboard */}
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>← এডমিন ড্যাশবোর্ড</span>
        </button>

        {/* Exit Admin */}
        <button
          type="button"
          onClick={onCloseAdmin}
          className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 text-xs font-semibold transition-all cursor-pointer hidden sm:flex items-center gap-1 active:scale-95"
        >
          <span>এডমিন বন্ধ</span>
        </button>
      </div>
    </div>
  );
};
