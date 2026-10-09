import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { ColorTheme, Language, WebsiteData, BannerSlide } from '../../types/website';
import { DEFAULT_BANNER_SLIDES } from '../../data/templates';
import { EditTrigger } from '../editor/EditTrigger';

interface HeroSectionProps {
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
  onOpenBooking?: () => void;
  onOpenCart?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  siteData,
  theme,
  language,
  onOpenBooking,
  onOpenCart,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const isBn = language === 'bn';

  // Extract user customized hero values from siteData
  const userHeroImage = siteData.heroImage;
  const userHeroTitle = siteData.heroHeadlineBn;
  const userHeroSubtitle = siteData.heroSubheadlineBn;
  const userHeroBadge = siteData.heroBadge || siteData.aboutBadgeBn;
  const userHeroCta = siteData.heroCtaPrimaryBn;

  // Build slides array: prioritize siteData.heroSlides, fall back to DEFAULT_BANNER_SLIDES
  const rawSlides: BannerSlide[] = (siteData.heroSlides && siteData.heroSlides.length > 0)
    ? siteData.heroSlides
    : DEFAULT_BANNER_SLIDES;

  const slides: BannerSlide[] = rawSlides.map((s, idx) => {
    if (idx === 0) {
      return {
        ...s,
        image: s.image || userHeroImage,
        titleBn: s.titleBn || userHeroTitle,
        subtitleBn: s.subtitleBn || userHeroSubtitle,
        badgeBn: s.badgeBn || userHeroBadge,
        ctaBn: s.ctaBn || userHeroCta,
      };
    }
    return s;
  });

  const slide = slides[Math.min(currentSlide, slides.length - 1)] || slides[0];

  // Auto slide rotation every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleCtaClick = () => {
    const targetId = slide.targetAnchor ? slide.targetAnchor.slice(1) : 'products';
    const el = document.getElementById(targetId) || document.getElementById('products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      className="relative pt-6 pb-12 md:pt-10 md:pb-16 border-b transition-colors duration-300 overflow-hidden"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Main Full-Width Promotional Banner Slider Wrapper */}
        <div 
          className="relative rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20 text-white min-h-[460px] sm:min-h-[500px] md:min-h-[560px] flex items-center group transition-all duration-500"
          style={{
            background: theme.id === 'sky-blue-cyan'
              ? 'linear-gradient(135deg, #0369a1 0%, #0284c7 50%, #0c4a6e 100%)'
              : 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #022c22 100%)',
          }}
        >
          {/* Background Banner Image with Gradient Overlay */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <img
              key={`${slide.id}-${slide.image}`}
              src={slide.image}
              alt={slide.titleBn}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[2000ms] ease-out opacity-75 md:opacity-85"
            />
            <EditTrigger 
              target={{ 
                id: `heroImage-${slide.id}`, 
                field: currentSlide === 0 ? 'heroImage' : 'heroSlideImage', 
                slideIndex: currentSlide,
                type: 'image', 
                title: `হিরো ব্যানার ব্যাকগ্রাউন্ড ছবি পরিবর্তন ${slides.length > 1 ? `(স্লাইড #${currentSlide + 1})` : ''}`, 
                label: 'ব্যানার ইমেজ', 
                value: slide.image, 
                adminTabShortcut: 'settings_hero' 
              }} 
              variant="image" 
              label={`ব্যানার ছবি পরিবর্তন ${slides.length > 1 ? `(#${currentSlide + 1})` : ''}`} 
              className="!top-4 !right-4 !z-30" 
            />
            <div 
              className="absolute inset-0 backdrop-blur-[0.5px]"
              style={{
                background: theme.id === 'sky-blue-cyan'
                  ? 'linear-gradient(90deg, rgba(8, 47, 73, 0.88) 0%, rgba(3, 105, 161, 0.68) 55%, rgba(14, 165, 233, 0.28) 100%)'
                  : 'linear-gradient(90deg, rgba(2, 44, 34, 0.88) 0%, rgba(6, 78, 59, 0.68) 55%, rgba(16, 185, 129, 0.28) 100%)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>

          {/* Banner Content Container */}
          <div className="relative z-10 max-w-4xl mx-auto px-8 sm:px-16 py-12 md:py-20 space-y-8 text-left w-full">
            {/* Offer / Slogan Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/15 backdrop-blur-xl border border-white/25 text-amber-300 text-xs sm:text-sm font-black shadow-lg animate-in fade-in slide-in-from-left-4 duration-700">
              <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/30" />
              <span className="uppercase tracking-[0.1em]">{isBn ? slide.badgeBn : slide.badgeEn}</span>
              <EditTrigger 
                target={{ 
                  id: `heroBadge-${slide.id}`, 
                  field: currentSlide === 0 ? 'heroBadge' : 'heroSlideBadge', 
                  slideIndex: currentSlide,
                  type: 'text', 
                  title: `অফার ব্যাজ টেক্সট পরিবর্তন ${slides.length > 1 ? `(স্লাইড #${currentSlide + 1})` : ''}`, 
                  label: 'ব্যাজ টেক্সট', 
                  value: isBn ? slide.badgeBn : slide.badgeEn, 
                  adminTabShortcut: 'settings_hero' 
                }} 
              />
            </div>

            {/* Main Promotional Headline */}
            <div className="relative group">
              <h1
                className="text-3xl sm:text-5xl md:text-6xl lg:text-[72px] font-black tracking-tight text-white leading-[1.1] max-w-3xl drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
                style={{ textWrap: 'balance' }}
              >
                {isBn ? slide.titleBn : slide.titleEn}
              </h1>
              <div className="mt-2">
                <EditTrigger 
                  target={{ 
                    id: `heroTitle-${slide.id}`, 
                    field: currentSlide === 0 ? 'heroTitle' : 'heroSlideTitle', 
                    slideIndex: currentSlide,
                    type: 'text', 
                    title: `প্রধান হেডলাইন এডিট ${slides.length > 1 ? `(স্লাইড #${currentSlide + 1})` : ''}`, 
                    label: 'ব্যানার হেডলাইন', 
                    value: isBn ? slide.titleBn : slide.titleEn, 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                  label="হেডলাইন এডিট"
                />
              </div>
            </div>

            {/* Slogan / Subtitle */}
            <div className="relative">
              <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                {isBn ? slide.subtitleBn : slide.subtitleEn}
              </p>
              <div className="mt-2">
                <EditTrigger 
                  target={{ 
                    id: `heroSubtitle-${slide.id}`, 
                    field: currentSlide === 0 ? 'heroSubtitle' : 'heroSlideSubtitle', 
                    slideIndex: currentSlide,
                    type: 'textarea', 
                    title: `সাবটাইটেল বিবরণ পরিবর্তন ${slides.length > 1 ? `(স্লাইড #${currentSlide + 1})` : ''}`, 
                    label: 'সাবটাইটেল টেক্সট', 
                    value: isBn ? slide.subtitleBn : slide.subtitleEn, 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                  label="বিবরণ এডিট"
                />
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="pt-4 flex flex-wrap items-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCtaClick}
                  className="px-8 py-4 rounded-2xl font-black text-sm sm:text-base text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 hover:shadow-[0_0_35px_rgba(251,191,36,0.5)] transition-all active:scale-95 flex items-center gap-2.5 cursor-pointer shadow-xl"
                >
                  <span>{isBn ? slide.ctaBn : slide.ctaEn}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <EditTrigger 
                  target={{ 
                    id: `heroCta-${slide.id}`, 
                    field: currentSlide === 0 ? 'heroCtaText' : 'heroSlideCta', 
                    slideIndex: currentSlide,
                    type: 'text', 
                    title: `অর্ডার বাটন লেখা পরিবর্তন ${slides.length > 1 ? `(স্লাইড #${currentSlide + 1})` : ''}`, 
                    label: 'বাটন টেক্সট', 
                    value: isBn ? slide.ctaBn : slide.ctaEn, 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const contactEl = document.getElementById('contact');
                    if (contactEl) contactEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-6 py-4 rounded-2xl font-bold text-sm sm:text-base bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/25 transition-all hover:border-white/50 cursor-pointer"
                >
                  {isBn ? 'পাইকারি অনুসন্ধানের জন্য' : 'Wholesale Inquiry'}
                </button>
                <EditTrigger 
                  target={{ 
                    id: 'heroSecondaryCta', 
                    field: 'heroSecondaryCtaText', 
                    type: 'text', 
                    title: 'পাইকারি বাটন লেখা পরিবর্তন করুন', 
                    label: 'বাটন টেক্সট', 
                    value: isBn ? 'পাইকারি অনুসন্ধানের জন্য' : 'Wholesale Inquiry', 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                />
              </div>
            </div>

            {/* Quick Trust Highlights */}
            <div className="pt-8 border-t border-white/10 flex flex-wrap items-center gap-y-4 gap-x-8 text-[11px] sm:text-xs text-amber-200/80 font-bold uppercase tracking-widest animate-in fade-in duration-1000 delay-500">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <span>{isBn ? '১০০% খাঁটি ও পরীক্ষিত' : '100% Pure & Tested'}</span>
                <EditTrigger 
                  target={{ 
                    id: 'heroTrust1', 
                    field: 'trustBadge1', 
                    type: 'text', 
                    title: 'ট্রাস্ট ব্যাজ ১ পরিবর্তন', 
                    label: 'ব্যাজ ১', 
                    value: isBn ? '১০০% খাঁটি ও পরীক্ষিত' : '100% Pure & Tested', 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                  variant="icon-only" 
                  className="!w-5 !h-5"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                  <Truck className="w-4 h-4 text-amber-400" />
                </div>
                <span>{isBn ? 'সারা দেশে ক্যাশ অন ডেলিভারি' : 'Nationwide COD'}</span>
                <EditTrigger 
                  target={{ 
                    id: 'heroTrust2', 
                    field: 'trustBadge2', 
                    type: 'text', 
                    title: 'ট্রাস্ট ব্যাজ ২ পরিবর্তন', 
                    label: 'ব্যাজ ২', 
                    value: isBn ? 'সারা দেশে ক্যাশ অন ডেলিভারি' : 'Nationwide COD', 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                  variant="icon-only" 
                  className="!w-5 !h-5"
                />
              </div>
              <div className="hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                  <RotateCcw className="w-4 h-4 text-purple-400" />
                </div>
                <span>{isBn ? 'সহজ রিটার্ন বা এক্সচেঞ্জ' : 'Easy Return Policy'}</span>
                <EditTrigger 
                  target={{ 
                    id: 'heroTrust3', 
                    field: 'trustBadge3', 
                    type: 'text', 
                    title: 'ট্রাস্ট ব্যাজ ৩ পরিবর্তন', 
                    label: 'ব্যাজ ৩', 
                    value: isBn ? 'সহজ রিটার্ন বা এক্সচেঞ্জ' : 'Easy Return Policy', 
                    adminTabShortcut: 'settings_hero' 
                  }} 
                  variant="icon-only" 
                  className="!w-5 !h-5"
                />
              </div>
            </div>
          </div>

          {/* Slider Navigation Arrows (Left & Right) */}
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md transition-all z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-neutral-900/80 hover:bg-neutral-900 text-white flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-md transition-all z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Slider Pagination Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {slides.map((s, sIdx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentSlide(sIdx)}
                className={`transition-all rounded-full cursor-pointer ${
                  currentSlide === sIdx
                    ? 'w-8 h-2.5 bg-amber-400'
                    : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${sIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
