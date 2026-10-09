import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ColorTheme, FaqItem, Language } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

interface FaqSectionProps {
  faqs: FaqItem[];
  titleBn?: string;
  titleEn?: string;
  descBn?: string;
  descEn?: string;
  theme: ColorTheme;
  language: Language;
}

export const FaqSection: React.FC<FaqSectionProps> = ({
  faqs,
  titleBn = 'সাধারণ জিজ্ঞাসা',
  titleEn = 'Frequently Asked Questions',
  descBn = 'আপনার প্রয়োজনীয় সব প্রশ্নের স্পষ্ট ও সুনির্দিষ্ট উত্তর',
  descEn = 'Direct answers to our most common operational inquiries',
  theme,
  language,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const isBn = language === 'bn';
  const safeFaqs = Array.isArray(faqs) ? faqs : [];
  const currentTitle = isBn ? titleBn : titleEn;
  const currentDesc = isBn ? descBn : descEn;

  return (
    <section 
      id="faq" 
      className="py-16 md:py-24 border-b transition-colors duration-300"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"
              style={{ textWrap: 'balance' }}
            >
              {currentTitle}
            </h2>
            <EditTrigger 
              target={{ 
                id: 'faqTitle', 
                field: 'faqTitleBn', 
                type: 'text', 
                title: 'এফএকিউ শিরোনাম এডিট করুন', 
                label: 'শিরোনাম', 
                value: currentTitle, 
                adminTabShortcut: 'settings_content_manager' 
              }} 
            />
          </div>
          <div 
            className="h-1.5 w-16 rounded-full mx-auto my-3" 
            style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.accent})` }}
          />
          <div className="flex items-center justify-center gap-2 mt-2">
            <p className="text-sm sm:text-base text-neutral-600">
              {currentDesc}
            </p>
            <EditTrigger 
              target={{ 
                id: 'faqDesc', 
                field: 'faqDescBn', 
                type: 'textarea', 
                title: 'এফএকিউ বিবরণ এডিট', 
                label: 'বিবরণ', 
                value: currentDesc, 
                adminTabShortcut: 'settings_content_manager' 
              }} 
            />
          </div>
        </div>

        <div className="space-y-3.5">
          {safeFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className="border rounded-2xl overflow-hidden transition-all duration-300 shadow-2xs hover:shadow-xs"
                style={{
                  borderColor: isOpen ? theme.primary : '#e2e8f0',
                  backgroundColor: '#ffffff',
                }}
              >
                <div className="w-full p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                  style={isOpen ? { backgroundColor: `${theme.accentBg}60` } : undefined}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex-1 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span 
                      className="font-bold text-sm sm:text-base"
                      style={{ color: isOpen ? theme.primary : '#171717' }}
                    >
                      {isBn ? faq.questionBn : faq.questionEn}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : 'text-neutral-500'
                      }`}
                      style={isOpen ? { color: theme.primary } : undefined}
                    />
                  </button>
                  <EditTrigger 
                    target={{ 
                      id: `faq-${faq.id}`, 
                      field: 'faqItem', 
                      productId: faq.id,
                      type: 'faq', 
                      title: `এফএকিউ এডিট: ${isBn ? faq.questionBn : faq.questionEn}`, 
                      label: 'এফএকিউ প্রশ্ন ও উত্তর', 
                      value: isBn ? faq.questionBn : faq.questionEn, 
                      secondaryValue: isBn ? faq.answerBn : faq.answerEn,
                      adminTabShortcut: 'settings_content_manager' 
                    }} 
                    variant="icon-only" 
                    className="!w-6 !h-6"
                  />
                </div>

                {isOpen && (
                  <div 
                    className="px-5 pb-5 pt-3 text-xs sm:text-sm text-neutral-700 leading-relaxed border-t flex items-start justify-between gap-3"
                    style={{ borderColor: theme.borderLight || '#f1f5f9' }}
                  >
                    <p className="flex-1 leading-relaxed">
                      {isBn ? faq.answerBn : faq.answerEn}
                    </p>
                    <EditTrigger 
                      target={{ 
                        id: `faq-${faq.id}`, 
                        field: 'faqItem', 
                        productId: faq.id,
                        type: 'faq', 
                        title: `এফএকিউ এডিট: ${isBn ? faq.questionBn : faq.questionEn}`, 
                        label: 'এফএকিউ প্রশ্ন ও উত্তর', 
                        value: isBn ? faq.questionBn : faq.questionEn, 
                        secondaryValue: isBn ? faq.answerBn : faq.answerEn,
                        adminTabShortcut: 'settings_content_manager' 
                      }} 
                      variant="icon-only" 
                      className="!w-6 !h-6 shrink-0 mt-0.5"
                    />
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
