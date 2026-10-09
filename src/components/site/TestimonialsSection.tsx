import React from 'react';
import { Star, MessageSquarePlus } from 'lucide-react';
import { ColorTheme, Language, TestimonialItem } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
  titleBn?: string;
  titleEn?: string;
  theme: ColorTheme;
  language: Language;
  onWriteReview?: () => void;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
  titleBn = 'গ্রাহকদের বাস্তব অভিজ্ঞতা ও রিভিউ',
  titleEn = 'Verified Customer Reviews',
  theme,
  language,
  onWriteReview,
}) => {
  const isBn = language === 'bn';
  const safeTestimonials = Array.isArray(testimonials) ? testimonials : [];

  const handleScrollToReview = () => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="py-16 md:py-24 border-b transition-colors duration-300"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <span 
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block mb-2 border shadow-2xs"
              style={{
                backgroundColor: theme.accentBg,
                color: theme.primary,
                borderColor: theme.borderLight,
              }}
            >
              {isBn ? '১০০% সন্তুষ্ট গ্রাহক পরিবার' : 'Verified Reviews'}
            </span>
            <div className="flex items-center gap-2">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"
                style={{ textWrap: 'balance' }}
              >
                {isBn ? titleBn : titleEn}
              </h2>
              <EditTrigger 
                target={{ 
                  id: 'reviewTitle', 
                  field: 'testimonialsTitleBn', 
                  type: 'text', 
                  title: 'রিভিউ সেকশন শিরোনাম এডিট করুন', 
                  label: 'শিরোনাম', 
                  value: isBn ? titleBn : titleEn, 
                  adminTabShortcut: 'settings_content_manager' 
                }} 
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-sm sm:text-base text-neutral-600">
                {isBn
                  ? 'আমাদের ড্রাই ফ্রুটস, বাদাম ও পোশাক ক্রয় করা গ্রাহকদের সরাসরি অভিজ্ঞতা ও মতামত'
                  : 'Direct reflections from customers buying our premium dry fruits and fashion apparel'}
              </p>
              <EditTrigger 
                target={{ 
                  id: 'reviewDesc', 
                  field: 'testimonialsDescBn', 
                  type: 'textarea', 
                  title: 'রিভিউ বিবরণ এডিট', 
                  label: 'বিবরণ', 
                  value: isBn ? 'আমাদের ড্রাই ফ্রুটস, বাদাম ও পোশাক ক্রয় করা গ্রাহকদের সরাসরি অভিজ্ঞতা ও মতামত' : 'Direct reflections from customers buying our premium dry fruits and fashion apparel', 
                  adminTabShortcut: 'settings_content_manager' 
                }} 
              />
            </div>
          </div>

          <button
            onClick={onWriteReview || handleScrollToReview}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-white font-bold text-xs transition-all shadow-md shrink-0 active:scale-95 cursor-pointer hover:opacity-95"
            style={{
              backgroundColor: theme.primary,
              boxShadow: `0 4px 14px ${theme.primary}30`,
            }}
          >
            <MessageSquarePlus className="w-4 h-4 text-amber-300" />
            <span>{isBn ? '✍️ আপনার রিভিউ লিখুন' : '✍️ Write a Review'}</span>
          </button>
        </div>

        {safeTestimonials.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-2xl bg-white border border-neutral-200 shadow-2xs max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <Star className="w-7 h-7 fill-amber-400 text-amber-500" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900">
              {isBn ? 'এখনও কোনো কাস্টমার রিভিউ নেই' : 'No Customer Reviews Yet'}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
              {isBn
                ? 'আপনি কি আমাদের থেকে পণ্য ক্রয় করেছেন? প্রথম ক্রেতা হিসেবে আপনার মূল্যবান অভিজ্ঞতা ও মতামত শেয়ার করুন!'
                : 'Have you purchased from us? Be the first customer to leave a review!'}
            </p>
            <button
              onClick={handleScrollToReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs transition-all shadow-md cursor-pointer active:scale-95"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{isBn ? '✍️ প্রথম রিভিউটি লিখুন' : '✍️ Write the First Review'}</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {safeTestimonials.map((item) => {
              const stars = item.rating || 5;
              return (
                <div
                  key={item.id}
                  className="p-6 sm:p-7 rounded-3xl border border-neutral-200/80 bg-white/95 flex flex-col justify-between shadow-[0_4px_25px_-5px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_35px_-8px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 relative"
                >
                  <div>
                    {/* Star Rating & Product Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < stars ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'
                            }`}
                          />
                        ))}
                      </div>

                      {item.productName && (
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60 truncate max-w-[150px]">
                          {item.productName}
                        </span>
                      )}
                    </div>

                    <blockquote className="text-sm text-neutral-800 leading-relaxed font-medium mb-6">
                      "{isBn ? item.quoteBn : item.quoteEn}"
                    </blockquote>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white"
                        style={{ backgroundColor: theme.accentBg, color: theme.accent }}
                      >
                        {item.avatarText}
                      </div>
                      <div>
                        <div className="font-extrabold text-sm text-neutral-900">
                          {isBn ? item.authorBn : item.authorEn}
                        </div>
                        <div className="text-[11px] text-neutral-500 font-medium">
                          {isBn ? item.roleBn : item.roleEn} · {isBn ? item.organizationBn : item.organizationEn}
                        </div>
                      </div>
                    </div>
                    <EditTrigger 
                      target={{ 
                        id: `review-${item.id}`, 
                        field: 'testimonials', 
                        type: 'text', 
                        title: `রিভিউ এডিট: ${isBn ? item.authorBn : item.authorEn}`, 
                        label: 'রিভিউ', 
                        value: isBn ? item.quoteBn : item.quoteEn, 
                        adminTabShortcut: 'settings_content_manager' 
                      }} 
                      variant="icon-only" 
                      className="!w-6 !h-6"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
