import React from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  SlidersHorizontal,
  Download,
  Languages,
  Eye,
  Inbox,
  Sparkles
} from 'lucide-react';
import { DeviceMode, Language, TemplateId } from '../../types/website';

interface TopBarProps {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  activeTemplateId: TemplateId;
  setActiveTemplateId: (id: TemplateId) => void;
  onOpenCustomizer: () => void;
  onOpenExport: () => void;
  onOpenInbox: () => void;
  inquiryCount: number;
  isPreviewOnly: boolean;
  setIsPreviewOnly: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  deviceMode,
  setDeviceMode,
  language,
  setLanguage,
  activeTemplateId,
  setActiveTemplateId,
  onOpenCustomizer,
  onOpenExport,
  onOpenInbox,
  inquiryCount,
  isPreviewOnly,
  setIsPreviewOnly,
}) => {
  const isBn = language === 'bn';

  return (
    <header className="sticky top-0 z-40 bg-neutral-900 text-white border-b border-neutral-800 px-4 lg:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center font-bold text-amber-400">
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
              WebCraft Studio
            </span>
          </div>

          {/* Quick template selector switch */}
          <div className="hidden md:flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60 text-xs">
            <button
              onClick={() => setActiveTemplateId('spices')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTemplateId === 'spices' ? 'bg-amber-500 text-neutral-950 font-bold shadow-sm' : 'text-amber-400 hover:text-white'
              }`}
            >
              🥜 {isBn ? 'ড্রাই ফ্রুটস ও বাদাম' : 'Dry Fruits & Nuts'}
            </button>
            <button
              onClick={() => setActiveTemplateId('agency')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTemplateId === 'agency' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isBn ? 'এজেন্সি' : 'Agency'}
            </button>
            <button
              onClick={() => setActiveTemplateId('tech')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTemplateId === 'tech' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isBn ? 'টেক' : 'Tech'}
            </button>
            <button
              onClick={() => setActiveTemplateId('restaurant')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTemplateId === 'restaurant' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isBn ? 'রেস্টুরেন্ট' : 'Dining'}
            </button>
            <button
              onClick={() => setActiveTemplateId('portfolio')}
              className={`px-2.5 py-1 rounded font-medium transition-colors whitespace-nowrap ${
                activeTemplateId === 'portfolio' ? 'bg-neutral-700 text-white shadow-sm' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {isBn ? 'পোর্টফোলিও' : 'Portfolio'}
            </button>
          </div>
        </div>

        {/* Zone 2: Device & View Mode Switcher */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-700/60">
            <button
              onClick={() => setDeviceMode('desktop')}
              title={isBn ? 'ডেস্কটপ ভিউ' : 'Desktop View'}
              className={`p-1.5 rounded transition-colors ${
                deviceMode === 'desktop' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              title={isBn ? 'ট্যাবলেট ভিউ' : 'Tablet View'}
              className={`p-1.5 rounded transition-colors ${
                deviceMode === 'tablet' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title={isBn ? 'মোবাইল ভিউ' : 'Mobile View'}
              className={`p-1.5 rounded transition-colors ${
                deviceMode === 'mobile' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setIsPreviewOnly(prev => !prev)}
            title={isPreviewOnly ? (isBn ? 'এডিটর চালু করুন' : 'Show Studio') : (isBn ? 'পূর্ণ স্ক্রিন প্রিভিউ' : 'Full Preview')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isPreviewOnly
                ? 'bg-amber-400 text-neutral-900 border-amber-300 font-semibold'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isPreviewOnly ? (isBn ? 'এডিটর' : 'Studio') : (isBn ? 'প্রিভিউ' : 'Live Preview')}</span>
          </button>
        </div>

        {/* Zone 3: Actions (Language, Customizer, Export, Inquiries) */}
        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-750 transition-colors whitespace-nowrap"
            title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Inquiries Notification Button */}
          <button
            onClick={onOpenInbox}
            className="relative p-2 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-750 transition-colors"
            title={isBn ? 'প্রাপ্ত বার্তা ও অর্ডার' : 'Inquiries & Orders'}
          >
            <Inbox className="w-4 h-4" />
            {inquiryCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-neutral-950 text-[10px] font-bold flex items-center justify-center">
                {inquiryCount}
              </span>
            )}
          </button>

          {/* Customize Drawer Toggle */}
          <button
            onClick={onOpenCustomizer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-neutral-200 hover:text-white hover:bg-neutral-750 text-xs font-medium transition-colors whitespace-nowrap"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isBn ? 'ডিজাইন কাস্টমাইজ' : 'Customize'}</span>
          </button>

          {/* Export Code */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-neutral-950 font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isBn ? 'কোড ডাউনলোড' : 'Export Code'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
