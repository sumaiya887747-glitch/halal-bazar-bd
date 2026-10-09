import React from 'react';
import { ColorTheme, Language, WebsiteData } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

interface ServicesSectionProps {
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  siteData,
  theme,
  language,
}) => {
  const isBn = language === 'bn';
  const safeServices = Array.isArray(siteData?.services) ? siteData.services : [];

  return (
    <section 
      id="services" 
      className="py-16 md:py-24 border-b transition-colors duration-300 relative"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-20 text-center mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-neutral-900"
              style={{ textWrap: 'balance' }}
            >
              {isBn ? siteData.servicesSectionTitleBn : siteData.servicesSectionTitleEn}
            </h2>
            <EditTrigger 
              target={{ 
                id: 'servicesTitle', 
                field: 'servicesSectionTitleBn', 
                type: 'text', 
                title: 'সার্ভিস সেকশন শিরোনাম এডিট', 
                label: 'শিরোনাম', 
                value: isBn ? siteData.servicesSectionTitleBn : siteData.servicesSectionTitleEn, 
                adminTabShortcut: 'settings_sections' 
              }} 
            />
          </div>
          <div 
            className="h-1.5 w-20 rounded-full mx-auto" 
            style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }}
          />
          <div className="flex items-center justify-center gap-2 max-w-2xl mx-auto">
            <p className="text-base sm:text-lg text-neutral-600 leading-relaxed font-medium">
              {isBn ? siteData.servicesSectionDescBn : siteData.servicesSectionDescEn}
            </p>
            <EditTrigger 
              target={{ 
                id: 'servicesDesc', 
                field: 'servicesSectionDescBn', 
                type: 'textarea', 
                title: 'সার্ভিস সেকশন বিবরণ এডিট', 
                label: 'বিবরণ', 
                value: isBn ? siteData.servicesSectionDescBn : siteData.servicesSectionDescEn, 
                adminTabShortcut: 'settings_sections' 
              }} 
            />
          </div>
        </div>

        {/* Bento Grid or Numbered Capability Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {safeServices.map((service, index) => {
            const isFeatured = index === 0;
            const gradients = [
              'from-emerald-500/10 to-teal-500/10',
              'from-sky-500/10 to-blue-500/10',
              'from-amber-500/10 to-orange-500/10'
            ];
            const activeGradient = gradients[index % gradients.length];

            return (
              <div
                key={service.id}
                className={`group p-8 sm:p-10 rounded-[40px] border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between bg-gradient-to-br ${activeGradient} relative overflow-hidden`}
                style={{ borderColor: theme.borderLight || '#f1f5f9' }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -mr-16 -mt-16" />
                
                <div className="relative z-10">
                  {/* Clean natural editorial numbering */}
                  <div className="flex items-center justify-between mb-6">
                    <div 
                      className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-lg font-black group-hover:scale-110 transition-transform duration-500 border border-neutral-100"
                      style={{ color: theme.primary }}
                    >
                      {service.number}
                    </div>
                    <EditTrigger 
                      target={{ 
                        id: `service-card-${service.id}`, 
                        field: 'services', 
                        type: 'text', 
                        title: `সার্ভিস কার্ড এডিট: ${isBn ? service.titleBn : service.titleEn}`, 
                        label: 'সার্ভিস এডিট', 
                        value: isBn ? service.titleBn : service.titleEn, 
                        adminTabShortcut: 'settings_sections' 
                      }} 
                      variant="icon-only" 
                      className="!w-6 !h-6"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-900 mb-4 leading-tight">
                    {isBn ? service.titleBn : service.titleEn}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 leading-relaxed font-medium">
                    {isBn ? service.descBn : service.descEn}
                  </p>
                </div>

                {service.metric && (
                  <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between relative z-10">
                    <span className="text-xs text-neutral-500 font-black uppercase tracking-widest">
                      {isBn ? service.metricLabelBn : service.metricLabelEn}
                    </span>
                    <span 
                      className="text-base font-black tabular-nums"
                      style={{ color: theme.primary }}
                    >
                      {service.metric}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
