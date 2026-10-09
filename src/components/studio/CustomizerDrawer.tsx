import React, { useState } from 'react';
import {
  X,
  Palette,
  Layout,
  Type,
  Inbox,
  Check,
  Trash2,
  Calendar,
  Mail,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  ColorTheme,
  FormSubmission,
  Language,
  TemplateId,
  WebsiteData
} from '../../types/website';
import { COLOR_THEMES } from '../../data/templates';

interface CustomizerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId: TemplateId;
  setActiveTemplateId: (id: TemplateId) => void;
  activeTheme: ColorTheme;
  setActiveTheme: (theme: ColorTheme) => void;
  currentSiteData: WebsiteData;
  onUpdateSiteData: (updates: Partial<WebsiteData>) => void;
  language: Language;
  submissions: FormSubmission[];
  onClearSubmissions: () => void;
  activeTab?: 'customize' | 'inbox';
}

export const CustomizerDrawer: React.FC<CustomizerDrawerProps> = ({
  isOpen,
  onClose,
  activeTemplateId,
  setActiveTemplateId,
  activeTheme,
  setActiveTheme,
  currentSiteData,
  onUpdateSiteData,
  language,
  submissions,
  onClearSubmissions,
  activeTab: initialTab = 'customize',
}) => {
  const [tab, setTab] = useState<'customize' | 'inbox'>(initialTab);
  const isBn = language === 'bn';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-base font-bold text-neutral-900">
              {isBn ? 'ওয়েবসাইট কন্ট্রোল স্টুডিও' : 'Website Studio Controls'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              {isBn ? 'রিয়েল-টাইমে পরিবর্তন করুন ও তাৎক্ষণিক দেখুন' : 'Live customizations applied instantly'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-200 px-6 pt-2 bg-white">
          <button
            onClick={() => setTab('customize')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-colors ${
              tab === 'customize'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>{isBn ? 'ডিজাইন ও কনটেন্ট' : 'Design & Content'}</span>
          </button>
          <button
            onClick={() => setTab('inbox')}
            className={`flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-colors relative ${
              tab === 'inbox'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>{isBn ? 'প্রাপ্ত বার্তা ও বুকিং' : 'Inquiries & Orders'}</span>
            {submissions.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-neutral-900 text-[10px] font-bold flex items-center justify-center">
                {submissions.length}
              </span>
            )}
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {tab === 'customize' ? (
            <>
              {/* 1. Website Template Switcher */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Layout className="w-3.5 h-3.5" />
                  <span>{isBn ? 'ওয়েবসাইট ক্যাটাগরি' : 'Website Category'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'spices', bn: '🥜 ড্রাই ফ্রুটস ও বাদাম', en: 'Dry Fruits & Nuts' },
                    { id: 'agency', bn: 'বিজনেস ও এজেন্সি', en: 'Business / Agency' },
                    { id: 'tech', bn: 'টেক স্টার্টআপ', en: 'Tech Startup' },
                    { id: 'restaurant', bn: 'রেস্টুরেন্ট ও ফুড', en: 'Fine Dining' },
                    { id: 'portfolio', bn: 'পোর্টফোলিও ও সিভি', en: 'Portfolio / CV' },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setActiveTemplateId(tpl.id as TemplateId)}
                      className={`text-left p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        activeTemplateId === tpl.id
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-semibold">{isBn ? tpl.bn : tpl.en}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">
                        {isBn ? tpl.en : tpl.bn}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Color Palettes */}
              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5" />
                  <span>{isBn ? 'কালার প্যালেট ও থিম' : 'Color Palette Theme'}</span>
                </label>
                <div className="space-y-1.5">
                  {COLOR_THEMES.map((theme) => {
                    const isSelected = activeTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => setActiveTheme(theme)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-colors ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-1">
                            <span
                              className="w-5 h-5 rounded-full border border-white shadow-xs inline-block"
                              style={{ backgroundColor: theme.primary }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-white shadow-xs inline-block"
                              style={{ backgroundColor: theme.accent }}
                            />
                            <span
                              className="w-5 h-5 rounded-full border border-white shadow-xs inline-block"
                              style={{ backgroundColor: theme.accentBg }}
                            />
                          </div>
                          <div>
                            <span className="font-medium text-neutral-900">
                              {isBn ? theme.nameBn : theme.nameEn}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-neutral-900 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Quick Edit Brand & Text */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5" />
                  <span>{isBn ? 'তথ্য ও টেক্সট পরিবর্তন' : 'Edit Key Copy & Brand'}</span>
                </label>

                {/* Site Name */}
                <div>
                  <span className="text-xs text-neutral-600 block mb-1">
                    {isBn ? 'ওয়েবসাইট / ব্র্যান্ডের নাম' : 'Website / Brand Name'}
                  </span>
                  <input
                    type="text"
                    value={isBn ? currentSiteData.nameBn : currentSiteData.nameEn}
                    onChange={(e) => {
                      if (isBn) {
                        onUpdateSiteData({ nameBn: e.target.value });
                      } else {
                        onUpdateSiteData({ nameEn: e.target.value });
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Tagline */}
                <div>
                  <span className="text-xs text-neutral-600 block mb-1">
                    {isBn ? 'ট্যাগলাইন বা স্লোগান' : 'Brand Tagline'}
                  </span>
                  <input
                    type="text"
                    value={isBn ? currentSiteData.taglineBn : currentSiteData.taglineEn}
                    onChange={(e) => {
                      if (isBn) {
                        onUpdateSiteData({ taglineBn: e.target.value });
                      } else {
                        onUpdateSiteData({ taglineEn: e.target.value });
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Hero Headline */}
                <div>
                  <span className="text-xs text-neutral-600 block mb-1">
                    {isBn ? 'হিরো সেকশন হেডলাইন' : 'Hero Main Headline'}
                  </span>
                  <textarea
                    rows={2}
                    value={isBn ? currentSiteData.heroHeadlineBn : currentSiteData.heroHeadlineEn}
                    onChange={(e) => {
                      if (isBn) {
                        onUpdateSiteData({ heroHeadlineBn: e.target.value });
                      } else {
                        onUpdateSiteData({ heroHeadlineEn: e.target.value });
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Contact Email & Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-neutral-600 block mb-1">
                      {isBn ? 'ইমেইল এড্রেস' : 'Contact Email'}
                    </span>
                    <input
                      type="email"
                      value={currentSiteData.contactEmail}
                      onChange={(e) => onUpdateSiteData({ contactEmail: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-neutral-600 block mb-1">
                      {isBn ? 'ফোন নম্বর' : 'Phone Number'}
                    </span>
                    <input
                      type="text"
                      value={currentSiteData.contactPhone}
                      onChange={(e) => onUpdateSiteData({ contactPhone: e.target.value })}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <span className="text-xs text-neutral-600 block mb-1">
                    {isBn ? 'অফিস বা স্টোরের ঠিকানা' : 'Physical Address'}
                  </span>
                  <input
                    type="text"
                    value={isBn ? currentSiteData.contactAddressBn : currentSiteData.contactAddressEn}
                    onChange={(e) => {
                      if (isBn) {
                        onUpdateSiteData({ contactAddressBn: e.target.value });
                      } else {
                        onUpdateSiteData({ contactAddressEn: e.target.value });
                      }
                    }}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Submissions & Orders Inbox */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    {isBn ? 'প্রাপ্ত বার্তা ও বুকিং তালিকা' : 'Received Inquiries & Bookings'}
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {submissions.length === 0
                      ? isBn
                        ? 'ওয়েবসাইটে ফর্ম সাবমিট করলে এখানে জমা হবে'
                        : 'Submissions from the live preview will appear here'
                      : `${submissions.length} ${isBn ? 'টি এন্ট্রি সংগৃহীত হয়েছে' : 'items received'}`}
                  </p>
                </div>
                {submissions.length > 0 && (
                  <button
                    onClick={onClearSubmissions}
                    className="p-1.5 text-neutral-400 hover:text-red-600 rounded transition-colors"
                    title={isBn ? 'সব মুছে ফেলুন' : 'Clear All'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-neutral-200 rounded-xl bg-neutral-50">
                  <Inbox className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-neutral-600">
                    {isBn ? 'এখনও কোনো বার্তা বা অর্ডার জমা হয়নি' : 'No inquiries received yet'}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-1 max-w-xs mx-auto">
                    {isBn
                      ? 'ওয়েবসাইটের যোগাযোগ ফর্মটি পূরণ করে সাবমিট টেস্ট করুন!'
                      : 'Test the contact form or table reservation on the website preview to see it live here!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submissions.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-lg border border-neutral-200 bg-neutral-50/50 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-900 text-sm">{item.name}</span>
                        <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-neutral-600">
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            {item.email}
                          </span>
                        )}
                        {item.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-neutral-400" />
                            {item.phone}
                          </span>
                        )}
                      </div>

                      {item.details && Object.keys(item.details).length > 0 && (
                        <div className="p-2 rounded bg-white border border-neutral-200/80 text-[11px] text-neutral-700">
                          {Object.entries(item.details).map(([key, val]) => (
                            <div key={key} className="flex justify-between py-0.5">
                              <span className="text-neutral-500 capitalize">{key}:</span>
                              <span className="font-medium text-neutral-900">{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="p-2.5 rounded bg-white border border-neutral-200 text-neutral-700 whitespace-pre-wrap">
                        {item.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{isBn ? 'লাইভ প্রিভিউ সক্রিয়' : 'Live Sync Active'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            {isBn ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
