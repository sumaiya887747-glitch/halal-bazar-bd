import React from 'react';
import { Pencil, Image as ImageIcon } from 'lucide-react';
import { useVisualEditor } from './VisualEditorContext';
import { QuickEditTarget } from '../../types/admin';

interface EditTriggerProps {
  target: QuickEditTarget;
  variant?: 'inline' | 'image' | 'button' | 'icon-only';
  className?: string;
  label?: string;
  title?: string;
}

export const EditTrigger: React.FC<EditTriggerProps> = ({
  target,
  variant = 'inline',
  className = '',
  label,
  title,
}) => {
  const { isLivePreview, showEditIcons, openQuickEdit } = useVisualEditor();

  if (!isLivePreview || !showEditIcons) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openQuickEdit(target);
  };

  const tooltipText = title || target.title || 'এডিট করুন';

  if (variant === 'image') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={tooltipText}
        className={`absolute top-2 right-2 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/90 hover:bg-neutral-900 text-amber-300 hover:text-amber-200 text-xs font-black shadow-2xl border-2 border-amber-400/80 backdrop-blur-md cursor-pointer transition-all hover:scale-105 active:scale-95 group ring-2 ring-amber-400/20 ${className}`}
      >
        <ImageIcon className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-bold">{label || 'ছবি পরিবর্তন'}</span>
        <Pencil className="w-3 h-3 text-amber-300 opacity-80" />
      </button>
    );
  }

  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={tooltipText}
        className={`inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 shadow-md border border-amber-500/60 cursor-pointer transition-all hover:scale-115 active:scale-90 align-middle ml-1.5 shrink-0 ring-1 ring-amber-400/40 ${className}`}
      >
        <Pencil className="w-3 h-3 text-neutral-950 stroke-[2.5]" />
      </button>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleClick}
        title={tooltipText}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 text-xs font-black shadow-md border border-amber-500/60 cursor-pointer transition-all hover:scale-105 active:scale-95 ring-1 ring-amber-400/40 ${className}`}
      >
        <Pencil className="w-3.5 h-3.5 text-neutral-950 stroke-[2.5]" />
        <span>{label || 'এডিট করুন'}</span>
      </button>
    );
  }

  // Default: inline badge
  return (
    <button
      type="button"
      onClick={handleClick}
      title={tooltipText}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-400 hover:bg-amber-300 text-neutral-950 text-[10.5px] font-black shadow-sm border border-amber-500/60 cursor-pointer transition-all hover:scale-105 active:scale-95 ml-1.5 align-middle select-none shrink-0 group ring-1 ring-amber-400/30 ${className}`}
    >
      <Pencil className="w-2.5 h-2.5 text-neutral-950 group-hover:rotate-12 transition-transform stroke-[2.5]" />
      <span>{label || 'এডিট'}</span>
    </button>
  );
};
