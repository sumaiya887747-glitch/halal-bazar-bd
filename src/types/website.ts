export type Language = 'bn' | 'en';

export type TemplateId = 'spices' | 'agency' | 'tech' | 'ecommerce' | 'restaurant' | 'portfolio';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type ColorTheme = {
  id: string;
  nameBn: string;
  nameEn: string;
  primary: string; // e.g. '#0f172a' or '#059669'
  primaryHover: string;
  accent: string;
  accentBg: string;
  bgLight: string;
  surfaceLight: string;
  borderLight: string;
  textLight: string;
  textMuted: string;
};

export interface NavItem {
  id: string;
  labelBn: string;
  labelEn: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  titleBn: string;
  titleEn: string;
  descBn: string;
  descEn: string;
  metric?: string;
  metricLabelBn?: string;
  metricLabelEn?: string;
}

export interface ProductItem {
  id: string;
  nameBn: string;
  nameEn: string;
  descBn: string;
  descEn: string;
  price: number; // Offer / Selling Price (বর্তমান বিক্রয় মূল্য)
  originalPrice?: number; // Regular / Original Price (আসল বা পূর্বের মূল্য)
  discountPercent?: number; // Discount % (যেমন: 15%)
  quantity?: number | string; // Quantity value (যেমন: 1, 500, 250)
  unit?: 'KG' | 'GM' | 'Pcs' | 'Ltr' | string; // Unit (KG বা GM)
  weightOptions?: { label: string; price: number }[];
  currency?: string;
  categoryBn: string;
  categoryEn: string;
  rating: number;
  reviewsCount?: number;
  image?: string;
  badgeBn?: string;
  badgeEn?: string;
  discountBadge?: string;
  featured?: boolean;
  inStock?: boolean;
  stockStatusText?: string;
  stockQuantity?: number; // Stock inventory quantity (যেমন: 4 units in stock)
  lowStockThreshold?: number; // Optional per-product threshold override (ডিফল্ট: ৫ ইউনিট)
}

export interface PortfolioItem {
  id: string;
  titleBn: string;
  titleEn: string;
  categoryBn: string;
  categoryEn: string;
  clientBn: string;
  clientEn: string;
  outcomeBn: string;
  outcomeEn: string;
  year: string;
}

export interface PricingPlan {
  id: string;
  nameBn: string;
  nameEn: string;
  priceMonthly: number;
  priceYearly: number;
  descBn: string;
  descEn: string;
  featuresBn: string[];
  featuresEn: string[];
  isPopular?: boolean;
  ctaTextBn: string;
  ctaTextEn: string;
}

export interface TestimonialItem {
  id: string;
  quoteBn: string;
  quoteEn: string;
  authorBn: string;
  authorEn: string;
  roleBn: string;
  roleEn: string;
  organizationBn: string;
  organizationEn: string;
  avatarText: string;
  rating?: number;
  productName?: string;
  date?: string;
}

export interface FaqItem {
  id: string;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

export interface BannerSlide {
  id: string;
  badgeBn: string;
  badgeEn: string;
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaBn: string;
  ctaEn: string;
  image: string;
  tagColor?: string;
  targetAnchor: string;
}

export interface WebsiteData {
  id: TemplateId;
  nameBn: string;
  nameEn: string;
  storeBadgeBn?: string;
  logoLetter?: string;
  logoImage?: string;
  taglineBn: string;
  taglineEn: string;
  heroHeadlineBn: string;
  heroHeadlineEn: string;
  heroSubheadlineBn: string;
  heroSubheadlineEn: string;
  heroCtaPrimaryBn: string;
  heroCtaPrimaryEn: string;
  heroCtaSecondaryBn: string;
  heroCtaSecondaryEn: string;
  heroImage: string;
  heroBadge?: string;
  heroSlides?: BannerSlide[];
  
  aboutBadgeBn: string;
  aboutBadgeEn: string;
  aboutTitleBn: string;
  aboutTitleEn: string;
  aboutDescBn: string;
  aboutDescEn: string;
  metrics: {
    value: string;
    labelBn: string;
    labelEn: string;
  }[];

  servicesSectionTitleBn: string;
  servicesSectionTitleEn: string;
  servicesSectionDescBn: string;
  servicesSectionDescEn: string;
  services: ServiceItem[];

  productsSectionTitleBn?: string;
  productsSectionTitleEn?: string;
  products?: ProductItem[];

  portfolioSectionTitleBn?: string;
  portfolioSectionTitleEn?: string;
  portfolio?: PortfolioItem[];

  pricingSectionTitleBn?: string;
  pricingSectionTitleEn?: string;
  pricing?: PricingPlan[];

  testimonialsSectionTitleBn: string;
  testimonialsSectionTitleEn: string;
  testimonials: TestimonialItem[];

  faqSectionTitleBn: string;
  faqSectionTitleEn: string;
  faqSectionDescBn?: string;
  faqSectionDescEn?: string;
  faqs: FaqItem[];

  contactTitleBn: string;
  contactTitleEn: string;
  contactDescBn: string;
  contactDescEn: string;
  contactEmail: string;
  contactPhone: string;
  contactAddressBn: string;
  contactAddressEn: string;
  facebookUrl?: string;
  whatsappNumber?: string;
  spicesImage?: string;
  clothingImage?: string;
  clothingFeatures?: { title: string; desc: string }[];
  clothingHeroBadge?: string;
  clothingHeroTitle?: string;
  clothingHeroSubtitle?: string;
  clothingHeroCtaText?: string;
  clothingHeroImage?: string;
  clothingHeroFloatingBadge?: string;

  footerTextBn: string;
  footerTextEn: string;
  announcementText?: string;
  isAnnouncementActive?: boolean;

  navItems: NavItem[];
}

export interface FormSubmission {
  id: string;
  timestamp: string;
  name: string;
  email?: string;
  phone?: string;
  message: string;
  type: 'contact' | 'booking' | 'order' | 'quote' | 'wholesale' | 'express_order';
  details?: Record<string, any>;
  isArchived?: boolean;
  wholesaleDetails?: {
    businessName?: string;
    businessType?: string;
    productInterest?: string;
    estimatedQuantity?: string;
    district?: string;
    status?: 'new' | 'contacted' | 'quoted' | 'deal_closed' | string;
  };
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
}
