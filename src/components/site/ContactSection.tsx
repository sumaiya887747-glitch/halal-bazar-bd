import React, { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2, Send, Star, Building2, PhoneCall } from 'lucide-react';
import { ColorTheme, FormSubmission, Language, WebsiteData } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

interface ContactSectionProps {
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
  onSubmitMessage: (submission: Omit<FormSubmission, 'id' | 'timestamp'>) => void;
  onAddReview?: (review: {
    author: string;
    location: string;
    productName: string;
    rating: number;
    comment: string;
  }) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  siteData,
  theme,
  language,
  onSubmitMessage,
  onAddReview,
}) => {
  const [activeTab, setActiveTab] = useState<'wholesale' | 'review'>('wholesale');

  // Wholesale Form State (Only 4 fields as requested)
  const [wholesaleData, setWholesaleData] = useState({
    name: '',
    phone: '',
    email: '',
    productInterest: '',
    message: '',
  });

  // Contact Message Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  // Review Form State
  const [reviewData, setReviewData] = useState({
    name: '',
    location: '',
    productName: '',
    rating: 5,
    hoverRating: 0,
    comment: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedType, setSubmittedType] = useState<'wholesale' | 'message' | 'review'>('wholesale');
  const [errorMsg, setErrorMsg] = useState('');
  const isBn = language === 'bn';

  const handleWholesaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wholesaleData.name.trim() || !wholesaleData.phone.trim() || !wholesaleData.message.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর এবং চাহিদার বিবরণ লিখুন।' : 'Please provide your name, phone number, and requirements.');
      return;
    }

    setErrorMsg('');
    onSubmitMessage({
      name: wholesaleData.name.trim(),
      email: wholesaleData.email.trim() || 'wholesale@client.local',
      phone: wholesaleData.phone.trim(),
      message: `[🏢 পাইকারি অনুসন্ধান]: আগ্রহী পণ্য: ${wholesaleData.productInterest}. বিস্তারিত: ${wholesaleData.message}`,
      type: 'wholesale',
      wholesaleDetails: {
        businessName: wholesaleData.name.trim(),
        businessType: 'পাইকারি ক্রেতা',
        productInterest: wholesaleData.productInterest,
        estimatedQuantity: 'বার্তা দ্রষ্টব্য',
        district: 'বাংলাদেশ',
        status: 'new',
      },
    });

    setSubmittedType('wholesale');
    setIsSubmitted(true);
    setWholesaleData({
      name: '',
      phone: '',
      email: '',
      productInterest: '',
      message: '',
    });
  };

  const handleMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে সব তথ্য সঠিকভাবে পূরণ করুন।' : 'Please fill out all required fields.');
      return;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setErrorMsg(isBn ? 'একটি সঠিক ইমেইল এড্রেস লিখুন।' : 'Please enter a valid email address.');
      return;
    }

    setErrorMsg('');
    onSubmitMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      type: 'contact',
    });

    setSubmittedType('message');
    setIsSubmitted(true);
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewData.name.trim() || !reviewData.comment.trim()) {
      setErrorMsg(isBn ? 'অনুগ্রহ করে আপনার নাম ও রিভিউ লিখুন।' : 'Please provide your name and review.');
      return;
    }

    setErrorMsg('');
    if (onAddReview) {
      onAddReview({
        author: reviewData.name.trim(),
        location: reviewData.location.trim() || (isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'),
        productName: reviewData.productName,
        rating: reviewData.rating,
        comment: reviewData.comment.trim(),
      });
    }

    onSubmitMessage({
      name: reviewData.name.trim(),
      email: 'review@customer.local',
      phone: '',
      message: `[⭐ ${reviewData.rating} Star Review for ${reviewData.productName}]: ${reviewData.comment.trim()}`,
      type: 'contact',
    });

    setSubmittedType('review');
    setIsSubmitted(true);
    setReviewData({
      name: '',
      location: '',
      productName: '',
      rating: 5,
      hoverRating: 0,
      comment: '',
    });
  };

  return (
    <section 
      id="contact" 
      className="py-16 md:py-24 text-white relative overflow-hidden transition-colors duration-500"
      style={{
        background: theme.id === 'sky-blue-cyan'
          ? 'linear-gradient(135deg, #082f49 0%, #0369a1 45%, #0c4a6e 100%)'
          : 'linear-gradient(135deg, #022c22 0%, #064e3b 45%, #022c22 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 block">
              {isBn ? 'পাইকারি ও রিটেইল যোগাযোগ' : 'Wholesale & Retail Desk'}
            </span>
            <div className="flex items-center gap-2">
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                {isBn ? siteData.contactTitleBn : siteData.contactTitleEn}
              </h2>
              <EditTrigger 
                target={{ 
                  id: 'contactTitle', 
                  field: 'contactTitleBn', 
                  type: 'text', 
                  title: 'যোগাযোগ সেকশন শিরোনাম এডিট', 
                  label: 'শিরোনাম', 
                  value: isBn ? siteData.contactTitleBn : siteData.contactTitleEn, 
                  adminTabShortcut: 'settings_sections' 
                }} 
              />
            </div>
            <div className="flex items-start gap-2">
              <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-md">
                {isBn ? siteData.contactDescBn : siteData.contactDescEn}
              </p>
              <EditTrigger 
                target={{ 
                  id: 'contactDesc', 
                  field: 'contactDescBn', 
                  type: 'textarea', 
                  title: 'যোগাযোগ বিবরণ এডিট', 
                  label: 'বিবরণ', 
                  value: isBn ? siteData.contactDescBn : siteData.contactDescEn, 
                  adminTabShortcut: 'settings_sections' 
                }} 
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span>{isBn ? 'পাইকারি ও বাল্ক অর্ডারের বিশেষ সুবিধা:' : 'Special Wholesale & Bulk Pricing:'}</span>
                </div>
                <EditTrigger 
                  target={{ 
                    id: 'contactWholesale', 
                    field: 'contactWholesaleText', 
                    type: 'textarea', 
                    title: 'পাইকারি সুবিধা বিবরণ এডিট', 
                    label: 'পাইকারি টেক্সট', 
                    value: isBn ? 'রেস্টুরেন্ট, ক্যাটারিং, সুপারশপ এবং শোরুমের জন্য বিশেষ হোলসেল দামে সেরা মানের পণ্য সরবরাহ করা হয়।' : 'Special wholesale rates available for restaurants, superstores, and showrooms.', 
                    adminTabShortcut: 'settings_sections' 
                  }} 
                  variant="icon-only" 
                  className="!w-5 !h-5"
                />
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                {isBn
                  ? 'রেস্টুরেন্ট, ক্যাটারিং, সুপারশপ এবং শোরুমের জন্য বিশেষ হোলসেল দামে সেরা মানের পণ্য সরবরাহ করা হয়। ফর্মটি পূরণ করলে আমাদের প্রতিনিধি আপনার সাথে দ্রুত সরাসরি যোগাযোগ করবেন।'
                  : 'Special wholesale rates available for restaurants, superstores, and showrooms. Fill out the form and our representative will contact you promptly.'}
              </p>
            </div>

            <div className="pt-4 space-y-4 border-t border-neutral-800 text-sm text-neutral-300">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wide">
                      {isBn ? 'ইমেইল করুন' : 'Direct Email'}
                    </div>
                    <a href={`mailto:${siteData.contactEmail}`} className="hover:text-white transition-colors">
                      {siteData.contactEmail}
                    </a>
                  </div>
                  <EditTrigger 
                    target={{ 
                      id: 'email', 
                      field: 'email', 
                      type: 'text', 
                      title: 'ইমেইল এড্রেস পরিবর্তন করুন', 
                      label: 'ইমেইল', 
                      value: siteData.contactEmail || '', 
                      adminTabShortcut: 'settings_general' 
                    }} 
                    variant="icon-only" 
                    className="!w-5 !h-5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wide">
                      {isBn ? 'সরাসরি কল / হোয়াটসঅ্যাপ' : 'Telephone / WhatsApp'}
                    </div>
                    <a href={`tel:${siteData.contactPhone}`} className="hover:text-white transition-colors font-mono font-bold">
                      {siteData.contactPhone}
                    </a>
                  </div>
                  <EditTrigger 
                    target={{ 
                      id: 'phone', 
                      field: 'phone', 
                      type: 'text', 
                      title: 'যোগাযোগ নম্বর পরিবর্তন করুন', 
                      label: 'ফোন নম্বর', 
                      value: siteData.contactPhone || '', 
                      adminTabShortcut: 'settings_general' 
                    }} 
                    variant="icon-only" 
                    className="!w-5 !h-5"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <div className="text-[11px] text-neutral-400 uppercase tracking-wide">
                      {isBn ? 'প্রধান অফিস ও ওয়্যারহাউজ' : 'Warehouse Location'}
                    </div>
                    <span>
                      {isBn ? siteData.contactAddressBn : siteData.contactAddressEn}
                    </span>
                  </div>
                  <EditTrigger 
                    target={{ 
                      id: 'address', 
                      field: 'address', 
                      type: 'text', 
                      title: 'অফিস ঠিকানা পরিবর্তন করুন', 
                      label: 'ঠিকানা', 
                      value: siteData.contactAddressBn || '', 
                      adminTabShortcut: 'settings_general' 
                    }} 
                    variant="icon-only" 
                    className="!w-5 !h-5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Column with 2 Tabs: Wholesale, Review */}
          <div className="lg:col-span-7 bg-neutral-800/80 p-5 sm:p-7 rounded-2xl border border-neutral-700/80">
            {/* Tab Selection */}
            <div className="grid grid-cols-2 p-1 bg-neutral-900/90 rounded-xl border border-neutral-700/80 mb-6 gap-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('wholesale');
                  setIsSubmitted(false);
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'wholesale'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-neutral-950 font-black shadow-md'
                    : 'text-amber-400 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{isBn ? '🏢 পাইকারি অনুসন্ধান' : 'Wholesale Inquiry'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('review');
                  setIsSubmitted(false);
                  setErrorMsg('');
                }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'review'
                    ? 'bg-neutral-800 text-amber-300 font-bold shadow-xs border border-neutral-600'
                    : 'text-neutral-400 hover:text-amber-300'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current text-amber-400 shrink-0" />
                <span className="truncate">{isBn ? '⭐ কাস্টমার রিভিউ' : 'Write Review'}</span>
              </button>
            </div>

            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {submittedType === 'wholesale'
                    ? (isBn ? '🏢 পাইকারি অনুসন্ধান সফলভাবে গৃহীত হয়েছে!' : '🏢 Wholesale Inquiry Received!')
                    : submittedType === 'review'
                    ? (isBn ? '🎉 রিভিউ সফলভাবে যুক্ত হয়েছে!' : '🎉 Review Submitted Successfully!')
                    : (isBn ? 'বার্তাটি সফলভাবে পাঠানো হয়েছে!' : 'Message Successfully Transmitted!')}
                </h3>
                <p className="text-sm text-neutral-300 max-w-md mx-auto leading-relaxed">
                  {submittedType === 'wholesale'
                    ? (isBn
                        ? 'আপনার পাইকারি চাহিদাটি সফলভাবে গৃহীত হয়েছে। আমাদের সেলস প্রতিনিধি খুব দ্রুত আপনার সাথে মোবাইল/হোয়াটসঅ্যাপে যোগাযোগ করবেন।'
                        : 'Your wholesale requirement has been received. Our sales representative will contact you promptly.')
                    : submittedType === 'review'
                    ? (isBn
                        ? 'আপনার মূল্যবান মতামতের জন্য অসংখ্য ধন্যবাদ! আপনার রিভিউটি আমাদের ওয়েবসাইটে যুক্ত করা হয়েছে।'
                        : 'Thank you for your valuable feedback! Your review has been added to our website.')
                    : (isBn
                        ? 'আমাদের টিম খুব দ্রুত আপনার সাথে যোগাযোগ করবে।'
                        : 'Our team will review your inquiry and reply within 24 hours.')}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 transition-colors cursor-pointer"
                  >
                    {isBn ? 'আরেকটি ফর্ম পাঠান' : 'Submit Another Request'}
                  </button>
                </div>
              </div>
            ) : activeTab === 'wholesale' ? (
              /* DEDICATED WHOLESALE INQUIRY FORM */
              <form onSubmit={handleWholesaleSubmit} className="space-y-3.5">
                {errorMsg && (
                  <div className="p-3 text-xs rounded-lg bg-red-900/40 border border-red-700 text-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11.5px] text-amber-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>পাইকারি ক্রেতাদের জন্য বিশেষ ক্যাটালগ ও ডিসকাউন্ট মূল্যতালিকা সরবরাহ করা হয়।</span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      {isBn ? 'আপনার নাম / স্বত্বাধিকারী *' : 'Your Name / Proprietor *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={wholesaleData.name}
                      onChange={(e) => setWholesaleData({ ...wholesaleData, name: e.target.value })}
                      placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-200 mb-1">
                      {isBn ? 'মোবাইল নম্বর (কল ও হোয়াটসঅ্যাপ) *' : 'Mobile (Call & WhatsApp) *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={wholesaleData.phone}
                      onChange={(e) => setWholesaleData({ ...wholesaleData, phone: e.target.value })}
                      placeholder={isBn ? 'মোবাইল নম্বর লিখুন' : 'Enter mobile number'}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {isBn ? 'যে পণ্যের পাইকারি চান *' : 'Product Category *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={wholesaleData.productInterest}
                    onChange={(e) => setWholesaleData({ ...wholesaleData, productInterest: e.target.value })}
                    placeholder={isBn ? 'পণ্যের নাম লিখুন' : 'Enter product name'}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    {isBn ? 'আপনার বার্তা বা বিস্তারিত রিকোয়ারমেন্ট *' : 'Detailed Requirements *'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={wholesaleData.message}
                    onChange={(e) => setWholesaleData({ ...wholesaleData, message: e.target.value })}
                    placeholder={
                      isBn
                        ? 'আপনার বিস্তারিত চাহিদা বা বার্তাটি এখানে লিখুন...'
                        : 'Enter your detailed requirements or message here...'
                    }
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg font-black text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 transition-all text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>{isBn ? '🏢 পাইকারি অনুসন্ধান ও প্রাইস কোটেশন পাঠান' : '🏢 Submit Wholesale Inquiry'}</span>
                </button>
              </form>
            ) : (
              /* Review & Feedback Form */
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs rounded-lg bg-red-900/40 border border-red-700 text-red-200">
                    {errorMsg}
                  </div>
                )}

                {/* Interactive Star Rating Selector */}
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-700/80 space-y-2">
                  <label className="block text-xs font-bold text-amber-300">
                    {isBn ? 'আপনার রেটিং দিন (Star Rating) *' : 'Select Your Star Rating *'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled =
                        (reviewData.hoverRating || reviewData.rating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewData({ ...reviewData, rating: star })}
                          onMouseEnter={() => setReviewData({ ...reviewData, hoverRating: star })}
                          onMouseLeave={() => setReviewData({ ...reviewData, hoverRating: 0 })}
                          className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                                : 'text-neutral-600'
                            }`}
                          />
                        </button>
                      );
                    })}
                    <span className="ml-2 font-mono font-bold text-sm text-amber-300">
                      {reviewData.rating === 5 && (isBn ? 'অসাধারণ (৫/৫)' : '5.0 - Excellent')}
                      {reviewData.rating === 4 && (isBn ? 'খুব ভালো (৪/৫)' : '4.0 - Very Good')}
                      {reviewData.rating === 3 && (isBn ? 'ভালো (৩/৫)' : '3.0 - Good')}
                      {reviewData.rating === 2 && (isBn ? 'মোটামুটি (২/৫)' : '2.0 - Fair')}
                      {reviewData.rating === 1 && (isBn ? 'উন্নতি প্রয়োজন (১/৫)' : '1.0 - Needs Improvement')}
                    </span>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      {isBn ? 'আপনার নাম *' : 'Your Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewData.name}
                      onChange={(e) => setReviewData({ ...reviewData, name: e.target.value })}
                      placeholder={isBn ? 'আপনার নাম লিখুন' : 'Enter your name'}
                      className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      {isBn ? 'আপনার জেলা / এলাকা (ঐচ্ছিক)' : 'City / Location (Optional)'}
                    </label>
                    <input
                      type="text"
                      value={reviewData.location}
                      onChange={(e) => setReviewData({ ...reviewData, location: e.target.value })}
                      placeholder={isBn ? 'আপনার জেলা বা এলাকা লিখুন' : 'Enter your city or area'}
                      className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    {isBn ? 'যে পণ্যটির রিভিউ দিচ্ছেন *' : 'Product Reviewed *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewData.productName}
                    onChange={(e) => setReviewData({ ...reviewData, productName: e.target.value })}
                    placeholder={isBn ? 'পণ্যের নাম লিখুন' : 'Enter product name'}
                    className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    {isBn ? 'আপনার রিভিউ বা অভিজ্ঞতা লিখুন *' : 'Your Detailed Review & Feedback *'}
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                    placeholder={
                      isBn
                        ? 'আপনার মন্তব্য বা অভিজ্ঞতা লিখুন...'
                        : 'Enter your review or feedback here...'
                    }
                    className="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-lg font-black text-neutral-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>{isBn ? '⭐ রিভিউ সাবমিট করুন' : '⭐ Submit Customer Review'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
