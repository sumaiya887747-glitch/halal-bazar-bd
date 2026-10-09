import { NavItem, ProductItem, BannerSlide } from './website';

export type OrderStatus = 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  serialNo?: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  deliveryArea: 'dhaka' | 'outside';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentChannel?: 'cod' | 'bkash' | 'nagad';
  trxId?: string;
  senderNumber?: string;
  items: {
    productName: string;
    quantity: number;
    price: number;
    originalPrice?: number;
    discountPercent?: number;
    unit?: string;
    weightAmount?: string | number;
  }[];
  subtotal: number;
  originalSubtotal?: number;
  discountAmount?: number;
  discountPercent?: number;
  deliveryFee: number;
  total: number;
  advancePaid?: number;
  dueAmount?: number;
  orderNotes?: string;
  status: OrderStatus;
  createdAt: string;
  isArchived?: boolean;
}

export interface CategoryNavItem {
  id: string;
  labelBn: string;
  labelEn: string;
  categoryKey: string;
  icon?: string;
  badge?: string;
  href?: string;
}

export interface UsefulLinkItem {
  id: string;
  label: string;
  href: string;
}

export interface SectionToggles {
  features: boolean;
  about: boolean;
  services: boolean;
  faq: boolean;
  testimonials: boolean;
  clothing: boolean;
  products: boolean;
}

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'editor' | 'moderator';
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeBadgeBn?: string;
  logoLetter: string;
  logoImage?: string;
  favicon?: string;
  primaryColor: string;
  secondaryColor?: string;
  themeId?: string;
  bgColor?: string;
  textColor?: string;
  fontFamily?: string;
  customCss?: string;

  phone: string;
  email: string;
  address: string;
  whatsappNumber?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;

  deliveryFeeDhaka: number;
  deliveryFeeOutside: number;
  lowStockThreshold?: number; // Configurable threshold (e.g. 5 units)
  enableLowStockAlerts?: boolean; // Toggle for automated alerts (default: true)
  autoDeductStockOnOrder?: boolean; // Toggle for auto-deducting stock upon customer checkout (default: false / manual)
  nextInvoiceNumber?: number;
  invoicePrefix?: string;
  bkashNumber?: string;
  bkashType?: 'personal' | 'merchant' | 'agent';
  nagadNumber?: string;
  nagadType?: 'personal' | 'merchant' | 'agent';
  paymentInstructionsBn?: string;
  announcementText: string;
  isAnnouncementActive: boolean;

  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaText: string;
  heroImage: string;
  heroSlides?: BannerSlide[];

  footerText: string;
  copyrightText?: string;
  usefulLinks?: UsefulLinkItem[];
  sectionToggles?: SectionToggles;

  navItems: NavItem[];
  categoryNavItems?: CategoryNavItem[];

  spicesImage?: string;
  clothingImage?: string;
  clothingFeatures?: { title: string; desc: string }[];
  clothingHeroBadge?: string;
  clothingHeroTitle?: string;
  clothingHeroSubtitle?: string;
  clothingHeroCtaText?: string;
  clothingHeroImage?: string;
  clothingHeroFloatingBadge?: string;

  // SEO & Scripts
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  headerScript?: string;
  footerScript?: string;

  // Admin Security & Roles
  adminName?: string;
  adminEmail?: string;
  adminRole?: 'admin' | 'editor' | 'moderator';
  adminPassword?: string;
  adminUsers?: AdminUserItem[];

  // Section titles and descriptions customizable by admin
  aboutBadgeBn?: string;
  aboutTitleBn?: string;
  aboutDescBn?: string;
  spicesBadgeBn?: string;
  spicesTitleBn?: string;
  spicesDescBn?: string;
  clothingTitleBn?: string;
  clothingDescBn?: string;
  servicesSectionTitleBn?: string;
  servicesSectionDescBn?: string;
  testimonialsTitleBn?: string;
  testimonialsDescBn?: string;
  footerTextBn?: string;
  heroSecondaryCtaText?: string;
  trustBadge1?: string;
  trustBadge2?: string;
  trustBadge3?: string;
  contactWholesaleText?: string;
  faqTitleBn?: string;
  faqDescBn?: string;
  contactTitleBn?: string;
  contactDescBn?: string;
  customMetrics?: { value: string; labelBn: string; labelEn: string }[];

  // Coupons / Promo codes
  coupons?: {
    id: string;
    code: string;
    discountPercent?: number;
    discountAmount?: number;
    minOrderAmount?: number;
    active: boolean;
  }[];

  // Custom Cards & Content Items
  customServices?: {
    id: string;
    number: string;
    titleBn: string;
    descBn: string;
    metric?: string;
    metricLabelBn?: string;
  }[];
  customFaqs?: {
    id: string;
    questionBn: string;
    answerBn: string;
    questionEn?: string;
    answerEn?: string;
  }[];
  customTestimonials?: {
    id: string;
    authorBn: string;
    roleBn?: string;
    quoteBn: string;
    rating?: number;
    productName?: string;
  }[];
}

export type AdminTab = 
  | 'overview' 
  | 'analytics'
  | 'orders' 
  | 'products' 
  | 'wholesale' 
  | 'customers' 
  | 'live_preview'
  | 'settings' 
  | 'settings_general' 
  | 'settings_header_footer' 
  | 'settings_homepage' 
  | 'settings_appearance' 
  | 'settings_seo' 
  | 'settings_security'
  | 'settings_hero' 
  | 'settings_sections' 
  | 'settings_payments' 
  | 'settings_content_manager'
  | 'navigation'
  | 'archive';

export interface QuickEditTarget {
  id: string;
  field: string;
  type: 'text' | 'textarea' | 'image' | 'number' | 'toggle' | 'product' | 'faq';
  title: string;
  label: string;
  value: any;
  secondaryValue?: any;
  productId?: string;
  slideIndex?: number;
  adminTabShortcut?: AdminTab;
}
