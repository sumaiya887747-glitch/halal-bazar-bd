import React from 'react';
import { Sparkles } from 'lucide-react';
import { ColorTheme, Language, WebsiteData } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

interface AboutSectionProps {
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  siteData,
  theme,
  language,
}) => {
  const isBn = language === 'bn';

  return (
    <section 
      id="about" 
      className="py-16 md:py-28 border-b transition-colors duration-300 relative overflow-hidden"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      {/* Decorative Background Elements */}
      <div 
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -mr-48 -mt-48 opacity-25"
        style={{ backgroundColor: theme.accent }}
      />
      <div 
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl -ml-48 -mb-48 opacity-20"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Editorial Story */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-20">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <div 
                className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xs"
                style={{
                  backgroundColor: theme.accentBg,
                  color: theme.primary,
                  borderColor: theme.borderLight,
                }}
              >
                <div 
                  className="w-1.5 h-1.5 rounded-full animate-pulse" 
                  style={{ backgroundColor: theme.primary }}
                />
                <span>{isBn ? siteData.aboutBadgeBn : siteData.aboutBadgeEn}</span>
              </div>
              <EditTrigger 
                target={{ 
                  id: 'aboutBadge', 
                  field: 'aboutBadgeBn', 
                  type: 'text', 
                  title: 'আমাদের গল্প ব্যাজ পরিবর্তন', 
                  label: 'ব্যাজ টেক্সট', 
                  value: isBn ? siteData.aboutBadgeBn : siteData.aboutBadgeEn, 
                  adminTabShortcut: 'settings_sections' 
                }} 
              />
            </div>
            <div>
              <h2
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-900 leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                {isBn ? siteData.aboutTitleBn : siteData.aboutTitleEn}
              </h2>
              <div className="mt-2">
                <EditTrigger 
                  target={{ 
                    id: 'aboutTitle', 
                    field: 'aboutTitleBn', 
                    type: 'text', 
                    title: 'আমাদের গল্প শিরোনাম এডিট', 
                    label: 'শিরোনাম', 
                    value: isBn ? siteData.aboutTitleBn : siteData.aboutTitleEn, 
                    adminTabShortcut: 'settings_sections' 
                  }} 
                  label="শিরোনাম এডিট"
                />
              </div>
            </div>
            <div 
              className="h-1.5 w-24 rounded-full" 
              style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }}
            />
          </div>
          <div className="lg:col-span-6">
            <p className="text-lg sm:text-xl text-neutral-700 leading-relaxed font-medium">
              {isBn ? siteData.aboutDescBn : siteData.aboutDescEn}
            </p>
            <div className="mt-2">
              <EditTrigger 
                target={{ 
                  id: 'aboutDesc', 
                  field: 'aboutDescBn', 
                  type: 'textarea', 
                  title: 'আমাদের গল্প বিস্তারিত বিবরণ এডিট', 
                  label: 'বিবরণ', 
                  value: isBn ? siteData.aboutDescBn : siteData.aboutDescEn, 
                  adminTabShortcut: 'settings_sections' 
                }} 
                label="বিবরণ এডিট"
              />
            </div>
          </div>
        </div>

        {/* Proof Metrics Grid strictly with tabular-nums */}
        {siteData.metrics && siteData.metrics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {siteData.metrics.map((metric, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-3xl bg-white/95 border shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(6,78,59,0.12)] transition-all duration-500 hover:-translate-y-1.5 backdrop-blur-md relative overflow-hidden"
                style={{ borderColor: theme.borderLight || '#e2e8f0' }}
              >
                <div 
                  className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20"
                  style={{ backgroundColor: theme.primary }}
                />
                <div className="space-y-4 relative z-10">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-xs border border-white/60"
                    style={{ backgroundColor: theme.accentBg, color: theme.primary }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: theme.primary }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className="text-4xl sm:text-5xl font-black font-mono tabular-nums tracking-tighter"
                      style={{ color: theme.primary }}
                    >
                      {metric.value}
                    </div>
                    <EditTrigger 
                      target={{ 
                        id: `metric-${idx}`, 
                        field: 'metrics', 
                        type: 'text', 
                        title: `মেট্রিক এডিট: ${isBn ? metric.labelBn : metric.labelEn}`, 
                        label: 'মেট্রিক এডিট', 
                        value: metric.value, 
                        adminTabShortcut: 'settings_sections' 
                      }} 
                      variant="icon-only" 
                      className="!w-6 !h-6"
                    />
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 font-extrabold tracking-wide uppercase">
                    {isBn ? metric.labelBn : metric.labelEn}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
