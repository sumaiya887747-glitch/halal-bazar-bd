import { WebsiteData, ColorTheme, BannerSlide, ProductItem } from '../types/website';

export const DEFAULT_REAL_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-kaju-badam-1',
    nameBn: 'কাজু বাদাম',
    nameEn: 'Cashew Nuts',
    categoryBn: 'বাদাম ও ড্রাই ফ্রুটস',
    categoryEn: 'Nuts & Dry Fruits',
    price: 1790,
    originalPrice: 1890,
    discountPercent: 5,
    inStock: true,
    stockQuantity: 50,
    weightAmount: '১ কেজি',
    weightOptions: [
      { label: '১ কেজি', price: 1790, originalPrice: 1890 },
      { label: '৫০০ গ্রাম', price: 920, originalPrice: 990 },
      { label: '২৫০ গ্রাম', price: 480, originalPrice: 520 },
    ],
    image: 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=800&q=80',
    descBn: '১০০% ফ্রেশ, ক্রিস্পি ও প্রিমিয়াম গ্রেডের কাজু বাদাম। কোনো কৃত্রিম কেমিক্যাল বা প্রিজারভেটিভ ছাড়া সরাসরি সেরা বাগান থেকে সংগৃহীত।',
    descEn: '100% fresh and premium quality cashew nuts directly sourced without any additives.',
    badgeBn: 'প্রিমিয়াম কোয়ালিটি',
    badgeEn: 'Premium Quality',
    rating: 5,
    reviewsCount: 18,
  },
];

export const DEFAULT_BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    badgeBn: '✨ ১০০% প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম',
    badgeEn: '✨ 100% Premium Dry Fruits & Nuts',
    titleBn: 'প্রিমিয়াম কাজুবাদাম, কাঠবাদাম ও খেজুরে চলছে স্পেশাল ছাড়!',
    titleEn: 'Special Discount on Jumbo Cashews, Almonds & Dates!',
    subtitleBn: 'সরাসরি বাগান থেকে সংগৃহীত সেরা মানের অর্গানিক ড্রাই ফ্রুটস। হাতে পেয়ে দেখে ক্যাশ অন ডেলিভারি।',
    subtitleEn: 'Directly sourced premium organic dry fruits and nuts. Inspect goods upon arrival before payment.',
    ctaBn: 'ড্রাই ফ্রুটস অর্ডার করুন',
    ctaEn: 'Order Dry Fruits',
    image: 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=1200&q=80',
    tagColor: 'bg-amber-50 text-amber-900 border-amber-300',
    targetAnchor: '#products',
  },
  {
    id: 'slide-2',
    badgeBn: '👗 এক্সক্লুসিভ ফ্যাশন কালেকশন ২০২৬',
    badgeEn: '👗 Exclusive Fashion Collection 2026',
    titleBn: 'রয়েল কটন এমব্রয়ডারি পাঞ্জাবি ও জামদানি শাড়িতে উৎসবের আমেজ',
    titleEn: 'Royal Cotton Embroidered Panjabis & Jamdani Sarees',
    subtitleBn: 'নিখুঁত হাতের কাজ, গর্জিয়াস সুতার এমব্রয়ডারি এবং শতভাগ প্রিমিয়াম কম্বেড কটন ফেব্রিক গ্যারান্টি।',
    subtitleEn: 'Exquisite hand embroidery and 100% high-grade combed cotton guaranteed for ultimate comfort.',
    ctaBn: 'পোশাক কালেকশন দেখুন',
    ctaEn: 'Explore Apparel',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
    tagColor: 'bg-purple-50 text-purple-900 border-purple-300',
    targetAnchor: '#clothing',
  },
  {
    id: 'slide-3',
    badgeBn: '🍯 শতভাগ খাঁটি মধু ও অর্গানিক ফুড',
    badgeEn: '🍯 100% Pure Honey & Organic Pantry',
    titleBn: 'সুন্দরবনের খাঁটি মধু ও প্রিমিয়াম খাটি গাওয়া ঘি',
    titleEn: 'Sundarbans Wildflower Honey & Pure Cow Ghee',
    subtitleBn: 'শতভাগ ভেজালমুক্ত, ল্যাব টেস্টকৃত এবং পুষ্টিগুণে ভরপুর প্রাকৃতিক খাদ্যপণ্য।',
    subtitleEn: '100% adulteration-free, lab-tested pure honey and organic pantry essentials.',
    ctaBn: 'অর্গানিক ফুড দেখুন',
    ctaEn: 'View Organic Foods',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
    tagColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    targetAnchor: '#products',
  },
];

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'emerald-deep-green',
    nameBn: 'গাঢ় সবুজ (রয়েল এমারেল্ড)',
    nameEn: 'Royal Deep Forest Green',
    primary: '#064e3b', // গাঢ় সবুজ (Deep Emerald Green)
    primaryHover: '#047857',
    accent: '#0284c7', // আকর্ষণীয় আকাশী ব্লু (Sky Blue)
    accentBg: '#e0f2fe',
    bgLight: '#f8fdfa',
    surfaceLight: '#ffffff',
    borderLight: '#bbf7d0',
    textLight: '#064e3b',
    textMuted: '#374151',
  },
  {
    id: 'sky-blue-cyan',
    nameBn: 'আকাশী ব্লু (রয়েল স্কাই ব্লু)',
    nameEn: 'Vibrant Sky Blue & Cyan',
    primary: '#0284c7', // আকাশী ব্লু (Sky Blue)
    primaryHover: '#0369a1',
    accent: '#064e3b', // গাঢ় সবুজ (Deep Green)
    accentBg: '#ecfdf5',
    bgLight: '#f0f9ff',
    surfaceLight: '#ffffff',
    borderLight: '#bae6fd',
    textLight: '#0c4a6e',
    textMuted: '#334155',
  },
  {
    id: 'emerald-sky-fusion',
    nameBn: 'গাঢ় সবুজ ও আকাশী ব্লু ফিউশন',
    nameEn: 'Deep Green & Sky Blue Duo',
    primary: '#065f46',
    primaryHover: '#047857',
    accent: '#0ea5e9',
    accentBg: '#e0f2fe',
    bgLight: '#f8fdf9',
    surfaceLight: '#ffffff',
    borderLight: '#bbf7d0',
    textLight: '#064e3b',
    textMuted: '#374151',
  },
  {
    id: 'emerald-halal',
    nameBn: 'রয়েল হালাল এমারেল্ড ও সোনালী জাফরান',
    nameEn: 'Halal Emerald & Royal Amber',
    primary: '#065f46', // গাঢ় সবুজ
    primaryHover: '#047857',
    accent: '#0284c7', // আকাশী
    accentBg: '#e0f2fe',
    bgLight: '#faf9f5',
    surfaceLight: '#ffffff',
    borderLight: '#e5e0d4',
    textLight: '#1f2937',
    textMuted: '#4b5563',
  },
  {
    id: 'maroon',
    nameBn: 'মরিচ লাল ও কারি ব্রাউন',
    nameEn: 'Fiery Chili & Cumin Brown',
    primary: '#7f1d1d',
    primaryHover: '#991b1b',
    accent: '#dc2626',
    accentBg: '#fef2f2',
    bgLight: '#ffffff',
    surfaceLight: '#fff5f5',
    borderLight: '#fecaca',
    textLight: '#450a0a',
    textMuted: '#991b1b',
  },
  {
    id: 'emerald',
    nameBn: 'অর্গানিক গ্রিন ও ভেষজ',
    nameEn: 'Organic Green & Herbal',
    primary: '#064e3b',
    primaryHover: '#047857',
    accent: '#059669',
    accentBg: '#ecfdf5',
    bgLight: '#ffffff',
    surfaceLight: '#f0fdf4',
    borderLight: '#d1fae5',
    textLight: '#064e3b',
    textMuted: '#047857',
  },
  {
    id: 'slate',
    nameBn: 'ক্ল্যাসিক ব্ল্যাক ও চারকোল',
    nameEn: 'Classic Slate & Black',
    primary: '#0f172a',
    primaryHover: '#1e293b',
    accent: '#d97706',
    accentBg: '#fffbeb',
    bgLight: '#ffffff',
    surfaceLight: '#f8fafc',
    borderLight: '#e2e8f0',
    textLight: '#0f172a',
    textMuted: '#64748b',
  }
];

export const TEMPLATES: Record<string, WebsiteData> = {
  spices: {
    id: 'spices',
    nameBn: 'হালাল বাজার বিডি',
    nameEn: 'Halal Bazar BD',
    taglineBn: 'শতভাগ প্রিমিয়াম ড্রাই ফ্রুটস, কাজুবাদাম, কাঠবাদাম এবং এক্সক্লুসিভ কোয়ালিটি পোশাক ও ফ্যাশন কালেকশন',
    taglineEn: '100% Premium Dry Fruits, Nuts, Dates & Premium Fashion Apparel Collection',
    heroHeadlineBn: 'প্রিমিয়াম ড্রাই ফ্রুটস ও এক্সক্লুসিভ পোশাক কালেকশন — সেরা পণ্যের বিশ্বস্ত ঠিকানা',
    heroHeadlineEn: 'Premium Quality Dry Fruits, Nuts & Artisan Apparel — Everything for Your Family',
    heroSubheadlineBn: 'বিশ্বসেরা বাগান থেকে সংগৃহীত ১০০% প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, পেস্তা, কিসমিস ও খেজুরের পাশাপাশি আমাদের প্রিমিয়াম কটন পাঞ্জাবি, ঐতিহ্যবাহী শাড়ি, থ্রি-পিস ও ক্যাজুয়াল পোশাকের বিশাল সমাহার।',
    heroSubheadlineEn: 'Hand-picked premium cashews, California almonds, pistachios, dates, and golden raisins alongside luxury embroidered cotton panjabis, traditional sarees, and boutique wear.',
    heroCtaPrimaryBn: 'সব ড্রাই ফ্রুটস ও পোশাক দেখুন',
    heroCtaPrimaryEn: 'Explore Dry Fruits & Clothing',
    heroCtaSecondaryBn: 'আমাদের মানের নিশ্চয়তা',
    heroCtaSecondaryEn: 'Quality & Purity Promise',
    heroImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',

    clothingHeroBadge: '👗 ১০০% প্রিমিয়াম সুতি ও ঐতিহ্যবাহী ফ্যাশন',
    clothingHeroTitle: 'ঐতিহ্যবাহী ও আধুনিক প্রিমিয়াম পোশাক কালেকশন — আভিজাত্য ও ফ্যাশনের সেরা ঠিকানা',
    clothingHeroSubtitle: 'রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, প্রিমিয়াম বুটিক থ্রি-পিস, আরামদায়ক পোলো টি-শার্ট ও এক্সক্লুসিভ দুবাই বোরকা-হিজাবের চমৎকার কালেকশন।',
    clothingHeroCtaText: 'পোশাক কালেকশন দেখুন',
    clothingHeroImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg',
    clothingHeroFloatingBadge: '১০০% ফেব্রিক ও সাইজ গ্যারান্টি',

    aboutBadgeBn: 'আমাদের কোয়ালিটি ও বিশুদ্ধতার অঙ্গীকার',
    aboutBadgeEn: 'Quality Benchmark',
    aboutTitleBn: 'কোয়ালিটি ও ফ্যাশনে আপসহীন — প্রতিটি পণ্যে ১০০% প্রিমিয়াম মান',
    aboutTitleEn: 'Zero compromises on pure quality, rich aroma, and premium fabrics',
    aboutDescBn: 'আমরা নিয়ে এসেছি সেরা কোয়ালিটির ড্রাই ফ্রুটস ও প্রিমিয়াম পোশাকের সেরা কম্বিনেশন। বিশ্বের সেরা বাগান থেকে সংগৃহীত পুষ্টিকর কাজুবাদাম, কাঠবাদাম, খেজুর ও কিসমিসের পাশাপাশি আমাদের রয়েছে নিজস্ব কারিগর ও তাঁতিদের তৈরি সেরা ফেব্রিকের পাঞ্জাবি, শাড়ি, থ্রি-পিস ও পোশাক। প্রতিটি পণ্য গ্রাহকের সর্বোচ্চ সন্তুষ্টি নিশ্চিত করে প্রস্তুত করা হয়।',
    aboutDescEn: 'We bring you the finest combination of premium imported dry fruits and high-grade lifestyle fashion. From hand-picked nuts, dates, and dried figs to luxurious cotton panjabis, authentic Dhakai sarees, and stylish everyday apparel.',
    metrics: [
      { value: '১০০%', labelBn: 'খাঁটি ও কোয়ালিটি নিশ্চয়তা', labelEn: '100% Quality Guaranteed' },
      { value: '২৪-৪৮ঘণ্টা', labelBn: 'সারা দেশে দ্রুত হোম ডেলিভারি', labelEn: 'Fast Nationwide Delivery' },
    ],

    servicesSectionTitleBn: 'কেন আমাদের থেকে কেনাকাটা করবেন?',
    servicesSectionTitleEn: 'Why Choose Our Store?',
    servicesSectionDescBn: 'প্রিমিয়াম ড্রাই ফ্রুটস থেকে শুরু করে আকর্ষণীয় কাপড়-চোপড় — প্রতিটি পণ্যে সর্বোচ্চ কোয়ালিটি নিশ্চিত',
    servicesSectionDescEn: 'From premium selected dry fruits & nuts to handloom & luxury fabrics — uncompromised standards',
    services: [
      {
        id: 'sp_s1',
        number: '01',
        titleBn: '১০০% খাঁটি ও প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম',
        titleEn: '100% Pure & Fresh Dry Fruits and Nuts',
        descBn: 'সরাসরি বিশ্বসেরা বাগান থেকে সংগ্রহ করে স্বাস্থ্যকর উপায়ে এয়ারটাইট প্যাক করা প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, কিসমিস, আঞ্জির ও খেজুর।',
        descEn: 'Whole jumbo nuts and sun-dried fruits ethically sourced and packed in airtight food-grade pouches.',
        metric: '১০০%',
        metricLabelBn: 'ভেজালমুক্ত ও খাঁটি',
        metricLabelEn: 'Pure & Chemical-Free'
      },
      {
        id: 'sp_s2',
        number: '02',
        titleBn: 'প্রিমিয়াম ফেব্রিক ও আকর্ষণীয় পোশাক কালেকশন',
        titleEn: 'Premium Fabrics & Artisan Clothing',
        descBn: '১০০% পিওর কম্বড কটন পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস ও আরামদায়ক পোলো টি-শার্ট।',
        descEn: 'Master-crafted luxury cotton panjabis, authentic Dhakai sarees, boutique three-pieces and polo shirts.',
        metric: '১০০%',
        metricLabelBn: 'কালার ও সাইজ গ্যারান্টি',
        metricLabelEn: 'Quality & Fabric Guarantee'
      },
      {
        id: 'sp_s3',
        number: '03',
        titleBn: 'নিরাপদ প্যাকেজিং ও দ্রুত হোম ডেলিভারি',
        titleEn: 'Safe Packaging & Express Delivery',
        descBn: 'ফুড-গ্রেড এয়ারটাইট জিপলক প্যাকেজিং ও পোশাকে আকর্ষণীয় বক্স প্যাকিং। সারা দেশে ক্যাশ অন ডেলিভারি সুবিধা।',
        descEn: 'Multi-layer food-grade pouches and luxury garment packaging with fast nationwide cash-on-delivery.',
        metric: '২৪-৪৮ঘণ্টা',
        metricLabelBn: 'দ্রুততম ডেলিভারি',
        metricLabelEn: 'Express Delivery Time'
      }
    ],

    productsSectionTitleBn: 'আমাদের জনপ্রিয় ড্রাই ফ্রুটস ও ফ্যাশন পোশাক কালেকশন',
    productsSectionTitleEn: 'Premium Dry Fruits & Fashion Apparel Collection',
    products: DEFAULT_REAL_PRODUCTS,

    testimonialsSectionTitleBn: 'গ্রাহকদের বাস্তব অভিজ্ঞতা ও রিভিউ',
    testimonialsSectionTitleEn: 'Verified Customer Reviews',
    testimonials: [],

    faqSectionTitleBn: 'পণ্য, পোশাক ও ডেলিভারি সম্পর্কিত সচরাচর জিজ্ঞাসা',
    faqSectionTitleEn: 'Frequently Asked Questions',
    faqs: [
      {
        id: 'sp_f1',
        questionBn: 'আপনাদের ড্রাই ফ্রুটস ও বাদাম শতভাগ সতেজ ও প্রিমিয়াম হওয়ার নিশ্চয়তা কী?',
        questionEn: 'How can I be assured that your dry fruits & nuts are 100% fresh?',
        answerBn: 'আমাদের প্রতিটি ড্রাই ফ্রুটস ও বাদাম প্রিমিয়াম গ্রেডের এবং নতুন মৌসুমের তাজা স্টক। কোনো প্রকার কৃত্রিম রঙ, কেমিক্যাল বা পুরনো তেল ব্যবহার করা হয় না। প্রতিটি প্যাকেট এয়ারটাইট ফুড-গ্রেড প্যাকেজিংয়ে সরবরাহ করা হয়।',
        answerEn: 'Our nuts and dried fruits are top-grade harvest with zero artificial glaze or chemicals. We pack in moisture-proof resealable pouches with a 100% satisfaction guarantee.'
      },
      {
        id: 'sp_f2',
        questionBn: 'পোশাকের সাইজ বা কালার পছন্দ না হলে কি এক্সচেঞ্জ করা যাবে?',
        questionEn: 'Can I exchange clothing items if the size or color does not fit?',
        answerBn: 'হ্যাঁ! পাঞ্জাবি, শাড়ি, থ্রি-পিস বা পোলো টি-শার্টের সাইজে কোনো সমস্যা হলে ডেলিভারি পাওয়ার ৩ দিনের মধ্যে সম্পূর্ণ বিনামূল্যে সাইজ এক্সচেঞ্জ সুবিধা পাবেন।',
        answerEn: 'Yes! We offer a hassle-free 3-day size and color exchange policy on all panjabis, sarees, three-pieces, and apparel.'
      },
      {
        id: 'sp_f3',
        questionBn: 'ডেলিভারি চার্জ কত এবং কতদিনে পণ্য হাতে পাব?',
        questionEn: 'What are the delivery charges and delivery times across Bangladesh?',
        answerBn: 'ঢাকার ভেতর ডেলিভারি চার্জ ৬০ টাকা (২৪-৪৮ ঘণ্টায় হোম ডেলিভারি) এবং ঢাকার বাইরে ১২০ টাকা (২-৩ দিনে কুরিয়ার হোম ডেলিভারি)। ক্যাশ অন ডেলিভারিতে পণ্য দেখে টাকা পরিশোধ করতে পারবেন।',
        answerEn: 'Within Dhaka, delivery fee is ৳60 (arrives in 24–48 hours). Outside Dhaka, fee is ৳120 (arrives in 2–3 business days). Cash on Delivery is supported nationwide.'
      }
    ],

    contactTitleBn: 'পাইকারি ও রিটেইল অর্ডার এবং সহায়তা',
    contactTitleEn: 'Customer Support & Bulk Inquiries',
    contactDescBn: 'যেকোনো ড্রাই ফ্রুটস, বাদাম বা পোশাকের অর্ডার, সাইজ সম্পর্কে তথ্য বা সহায়তার জন্য কল করুন অথবা সরাসরি মেসেজ দিন।',
    contactDescEn: 'For custom retail orders, wholesale dry fruits supply, or support inquiries, contact our customer relations team.',
    contactEmail: 'order@halalbazarbd.com',
    contactPhone: '+880 1711-889900',
    contactAddressBn: 'রোড ৪, ব্লক বি, মিরপুর ডিওএইচএস, ঢাকা ১২১৬',
    contactAddressEn: 'Road 4, Block B, Mirpur DOHS, Dhaka 1216',

    footerTextBn: 'সর্বস্বত্ব সংরক্ষিত। হালাল বাজার বিডি – প্রিমিয়াম ড্রাই ফ্রুটস ও পোশাকের বিশ্বস্ত ঠিকানা।',
    footerTextEn: 'All rights reserved. Halal Bazar BD - Premium Dry Fruits & Apparel Store.',

    navItems: [
      { id: 'about', labelBn: 'বিশুদ্ধতা', labelEn: 'Purity', href: '#about' },
      { id: 'products', labelBn: 'ড্রাই ফ্রুটস ও পণ্যসম্ভার', labelEn: 'Dry Fruits & Nuts', href: '#products' },
      { id: 'clothing', labelBn: 'পোশাক', labelEn: 'Clothing', href: '#clothing' },
      { id: 'services', labelBn: 'প্রক্রিয়াজাতকরণ', labelEn: 'Processing', href: '#services' },
      { id: 'faq', labelBn: 'প্রশ্নোত্তর', labelEn: 'FAQ', href: '#faq' },
      { id: 'contact', labelBn: 'অর্ডার ও সহায়তা', labelEn: 'Support', href: '#contact' },
    ]
  }
};
