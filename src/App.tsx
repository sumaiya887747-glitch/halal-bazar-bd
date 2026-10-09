/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  CartItem,
  ColorTheme,
  FormSubmission,
  Language,
  NavItem,
  ProductItem,
  TemplateId,
  TestimonialItem,
  WebsiteData,
} from './types/website';
import { COLOR_THEMES, TEMPLATES, DEFAULT_BANNER_SLIDES } from './data/templates';
import { DEFAULT_PRODUCTS } from './data/mockProducts';
import { AdminOrder, AdminTab, OrderStatus, StoreSettings } from './types/admin';
import { SiteHeader } from './components/site/SiteHeader';
import { CategoryNavBar, DEFAULT_CATEGORY_NAV_ITEMS } from './components/site/CategoryNavBar';
import { HeroSection } from './components/site/HeroSection';
import { AboutSection } from './components/site/AboutSection';
import { ServicesSection } from './components/site/ServicesSection';
import { SpicesSection } from './components/site/SpicesSection';
import { ClothingSection } from './components/site/ClothingSection';
import { PortfolioSection } from './components/site/PortfolioSection';
import { PricingSection } from './components/site/PricingSection';
import { TestimonialsSection } from './components/site/TestimonialsSection';
import { FaqSection } from './components/site/FaqSection';
import { ContactSection } from './components/site/ContactSection';
import { SiteFooter } from './components/site/SiteFooter';
import { CartDrawer } from './components/site/CartDrawer';
import { BookingModal } from './components/site/BookingModal';
import { OrderTrackerModal } from './components/site/OrderTrackerModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { SecretAccessModal } from './components/admin/SecretAccessModal';
import { ExpressOrderModal } from './components/site/ExpressOrderModal';
import { InvoiceReceiptModal } from './components/site/InvoiceReceiptModal';
import { ProductReviewModal } from './components/site/ProductReviewModal';
import { VisualEditorProvider, useVisualEditor } from './components/editor/VisualEditorContext';
import { VisualQuickEditModal } from './components/editor/VisualQuickEditModal';
import { LivePreviewTopBar } from './components/editor/LivePreviewTopBar';
import { CheckCircle, Eye, Package } from 'lucide-react';
import { formatOrderDateTime } from './utils/date';
import {
  sendBrowserOrderNotification,
  requestNotificationPermission,
  playOrderNotificationSound
} from './utils/notifications';
import { db, auth } from './lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { handleFirestoreError, OperationType, sanitizeForFirestore, splitSettingsForFirestore } from './utils/firebaseUtils';

const CLIENT_ID = Math.random().toString(36).substring(2, 9);

const VisualQuickEditConsumer: React.FC<{
  onSave: (field: string, newValue: any, productId?: string) => Promise<void> | void;
  onNavigateToAdminTab?: (tab: AdminTab) => void;
  products: ProductItem[];
}> = ({ onSave, onNavigateToAdminTab, products }) => {
  const { activeQuickEdit, closeQuickEdit } = useVisualEditor();
  return (
    <VisualQuickEditModal
      target={activeQuickEdit}
      onClose={closeQuickEdit}
      onSave={onSave}
      onNavigateToAdminTab={onNavigateToAdminTab}
      products={products}
    />
  );
};

export default function App() {
  const [language, setLanguage] = useState<Language>('bn');
  const [activeCategoryTab, setActiveCategoryTab] = useState<'spices' | 'clothing'>('spices');
  const [activeCategoryKey, setActiveCategoryKey] = useState<string>('all');
  const [activeTemplateId] = useState<TemplateId>('spices');
  const [activeTheme, setActiveTheme] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      const savedThemeId = localStorage.getItem('hb_active_theme_id');
      const found = COLOR_THEMES.find((t) => t.id === savedThemeId);
      if (found) return found;
    }
    return COLOR_THEMES[0]; // গাঢ় সবুজ (রয়েল এমারেল্ড)
  });

  const handleToggleTheme = () => {
    setActiveTheme((prev) => {
      // Toggle between emerald-deep-green (গাঢ় সবুজ) and sky-blue-cyan (আকাশী ব্লু)
      const nextTheme = prev.id === 'emerald-deep-green' ? COLOR_THEMES[1] : COLOR_THEMES[0];
      if (typeof window !== 'undefined') {
        localStorage.setItem('hb_active_theme_id', nextTheme.id);
      }
      return nextTheme;
    });
  };

  const handleSelectTheme = (themeId: string) => {
    const found = COLOR_THEMES.find((t) => t.id === themeId);
    if (found) {
      setActiveTheme(found);
      if (typeof window !== 'undefined') {
        localStorage.setItem('hb_active_theme_id', found.id);
      }
    }
  };

  // Dedicated Separate Admin Portal State & Auth
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hb_admin_auth') === 'true';
    }
    return false;
  });

  // Secret Code Prompt Modal State
  const [isSecretModalOpen, setIsSecretModalOpen] = useState(false);
  const secretCode = 'tanvir88';

  // Global Secret Code & Keyboard Listeners (Typing tanvir88, admin, Alt+A, or URL hash)
  useEffect(() => {
    let buffer = '';
    let bufferTimer: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (activeEl && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeEl.tagName)) {
        return;
      }

      // Hotkey: Alt+A or Ctrl+Shift+A
      if (
        (e.altKey && e.key.toLowerCase() === 'a') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')
      ) {
        e.preventDefault();
        setIsSecretModalOpen(true);
        return;
      }

      // Key sequence buffer (e.g. typing tanvir88 or admin)
      buffer += e.key;
      clearTimeout(bufferTimer);
      bufferTimer = setTimeout(() => {
        buffer = '';
      }, 2500);

      if (buffer.endsWith('tanvir88') || buffer.toLowerCase().endsWith('admin')) {
        buffer = '';
        setIsSecretModalOpen(true);
      }
    };

    const handleHashCheck = () => {
      if (
        window.location.hash === '#admin' ||
        window.location.hash === '#tanvir88' ||
        window.location.search.includes('code=tanvir88')
      ) {
        setIsSecretModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('hashchange', handleHashCheck);

    handleHashCheck();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', handleHashCheck);
      clearTimeout(bufferTimer);
    };
  }, []);

  // Real-time synchronization across all open tabs, windows, and devices
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('halal_bazar_realtime_sync');
      channel.onmessage = (event) => {
        if (!event.data || event.data.sender === CLIENT_ID) return;
        const { type, payload } = event.data;
        if (type === 'SYNC_PRODUCTS') {
          setProducts(payload);
        } else if (type === 'SYNC_SETTINGS') {
          setStoreSettings(payload);
        } else if (type === 'SYNC_ORDERS') {
          setOrders(payload);
        } else if (type === 'SYNC_SUBMISSIONS') {
          setSubmissions(payload);
        }
      };
    } catch (e) {}

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'hb_live_products' && e.newValue) {
        try { setProducts(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'hb_store_settings' && e.newValue) {
        try { setStoreSettings(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'hb_admin_orders' && e.newValue) {
        try { setOrders(JSON.parse(e.newValue)); } catch (err) {}
      } else if (e.key === 'hb_admin_submissions' && e.newValue) {
        try { setSubmissions(JSON.parse(e.newValue)); } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Real-time synchronization across multiple physical devices (SSE + Polling server-side sync)
  useEffect(() => {
    let active = true;

    const processSyncData = (data: any) => {
      if (!data || !active) return;

      if (Array.isArray(data.orders)) {
        const cleaned = data.orders.filter(
          (ord: any) => ord.id !== 'ord-101' && ord.id !== 'ord-102' && ord.id !== 'ord-103' && !ord.id.startsWith('demo-')
        );
        const prefix = storeSettings.invoicePrefix !== undefined ? storeSettings.invoicePrefix : 'INV-';
        const preserved = cleaned.map((ord: any) => {
          const existingSerial = ord.serialNo || (ord.orderNumber ? parseInt(String(ord.orderNumber).replace(/\D/g, ''), 10) : undefined);
          const finalSerial = existingSerial && !isNaN(existingSerial) && existingSerial > 0 ? existingSerial : 1;
          const finalInvoiceNo = ord.invoiceNumber || (prefix ? `${prefix}${String(finalSerial).padStart(4, '0')}` : `${finalSerial}`);
          return {
            ...ord,
            serialNo: finalSerial,
            orderNumber: ord.orderNumber || `${finalSerial}`,
            invoiceNumber: finalInvoiceNo,
          };
        });
        setOrders(preserved);
      }

      if (Array.isArray(data.submissions)) {
        setSubmissions(data.submissions);
      }

      if (Array.isArray(data.testimonials)) {
        setTestimonials(data.testimonials);
      }

      if (Array.isArray(data.products) && data.products.length > 0) {
        setProducts((prev) => {
          return data.products.map((serverItem: ProductItem) => {
            const localMatch = prev.find((p) => p.id === serverItem.id);
            if (localMatch && localMatch.image && localMatch.image.startsWith('data:') && !serverItem.image?.startsWith('data:')) {
              return { ...serverItem, image: localMatch.image };
            }
            return serverItem;
          });
        });
      }

      if (data.settings && typeof data.settings === 'object' && Object.keys(data.settings).length > 0) {
        setStoreSettings((prev) => ({ ...prev, ...data.settings }));
      }
    };

    // 1. Instant Push with EventSource (SSE)
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          processSyncData(data);
        } catch (e) {}
      };
      eventSource.onerror = () => {
        // Browser automatically attempts reconnect on stream disruption
      };
    } catch (e) {}

    // 2. Continuous Polling Fallback (Every 1 second for ultra-fast sync)
    const syncWithServer = async () => {
      try {
        const res = await fetch('/api/sync');
        if (!res.ok) return;
        const data = await res.json();
        processSyncData(data);
      } catch (e) {}
    };

    // Initial sync
    syncWithServer();
    
    // Setup real-time listeners from Firestore
    const setupFirebaseListeners = () => {
      try {
        // Real-time listener for products
        const productsCol = collection(db, 'products');
        onSnapshot(productsCol, (snapshot) => {
          const firestoreProducts = snapshot.docs.map(doc => doc.data() as ProductItem);
          setProducts(firestoreProducts);
        });

        // Real-time listener for settings
        const parts = ['general', 'appearance', 'homepage', 'payments', 'content'];
        parts.forEach((part) => {
          const docRef = doc(db, 'settings', part);
          onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setStoreSettings((prev) => ({ ...prev, ...docSnap.data() }));
            }
          });
        });
      } catch (e) {
        console.error('Error setting up Firestore listeners', e);
      }
    };
    setupFirebaseListeners();

    const interval = setInterval(syncWithServer, 1000);
    return () => {
      active = false;
      if (eventSource) {
        eventSource.close();
      }
      clearInterval(interval);
    };
  }, []);

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live Products State with localStorage (starts empty, then synced)
  const [products, setProducts] = useState<ProductItem[]>([]);

  useEffect(() => {
    localStorage.setItem('hb_live_products', JSON.stringify(products));
    try {
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_PRODUCTS', payload: products, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}

    // Persist to Firestore
    Promise.all(products.filter(p => !!p.id).map(p => setDoc(doc(db, 'products', p.id), sanitizeForFirestore(p))))
      .catch((e) => handleFirestoreError(e, OperationType.WRITE, 'products'));
  }, [products]);

  // Store Settings with localStorage
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const defaultSettings: StoreSettings = {
      storeName: 'Halal Bazar BD',
      storeTagline: 'শতভাগ প্রিমিয়াম ড্রাই ফ্রুটস, বাদাম এবং এক্সক্লুসিভ কোয়ালিটি পোশাক ও ফ্যাশন কালেকশন',
      logoLetter: 'হ',
      logoImage: undefined,
      primaryColor: '#064e3b', // গাঢ় সবুজ (Deep Green)
      secondaryColor: '#0284c7', // আকর্ষণীয় আকাশী ব্লু (Sky Blue)
      themeId: 'emerald-deep-green',
      phone: '+880 1711-889900',
      email: 'order@halalbazarbd.com',
      address: 'রোড ৪, ব্লক বি, মিরপুর ডিওএইচএস, ঢাকা ১২১৬',
      deliveryFeeDhaka: 60,
      deliveryFeeOutside: 120,
      lowStockThreshold: 5,
      enableLowStockAlerts: true,
      nextInvoiceNumber: 1,
      invoicePrefix: 'INV-',
      bkashNumber: '01711-889900',
      bkashType: 'personal',
      nagadNumber: '01711-889900',
      nagadType: 'personal',
      paymentInstructionsBn: 'বিকাশ বা নগদ থেকে উপরের নম্বরে Send Money / পেমেন্ট করার পর নিচের বক্সে আপনার বিকাশ/নগদ নম্বর এবং ট্রানজেকশন আইডি (TrxID) প্রদান করুন।',
      announcementText: 'বিশেষ ধামাকা অফার: সকল প্রিমিয়াম ড্রাই ফ্রুটস ও পোশাকে আকর্ষণীয় মূল্যছাড়!',
      isAnnouncementActive: true,
      heroBadge: 'আমাদের বিশুদ্ধতা ও কোয়ালিটির নিশ্চয়তা',
      heroTitle: 'প্রিমিয়াম ড্রাই ফ্রুটস ও এক্সক্লুসিভ পোশাক কালেকশন — সেরা পণ্যের বিশ্বস্ত ঠিকানা',
      heroSubtitle: 'বিশ্বের সেরা বাগান থেকে বাছাইকৃত ১০০% প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, পেস্তা, কিসমিস ও খেজুরের পাশাপাশি ঐতিহ্যবাহী পাঞ্জাবি, শাড়ি ও পোশাকের সেরা সমাহার।',
      heroCtaText: 'পণ্য অর্ডার করুন',
      heroImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
      clothingHeroBadge: '👗 ১০০% প্রিমিয়াম সুতি ও ঐতিহ্যবাহী ফ্যাশন',
      clothingHeroTitle: 'ঐতিহ্যবাহী ও আধুনিক প্রিমিয়াম পোশাক কালেকশন — আভিজাত্য ও ফ্যাশনের সেরা ঠিকানা',
      clothingHeroSubtitle: 'রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, প্রিমিয়াম বুটিক থ্রি-পিস, আরামদায়ক পোলো টি-শার্ট ও এক্সক্লুসিভ দুবাই বোরকা-হিজাবের চমৎকার কালেকশন।',
      clothingHeroCtaText: 'পোশাক কালেকশন দেখুন',
      clothingHeroImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg',
      clothingHeroFloatingBadge: '১০০% ফেব্রিক ও সাইজ গ্যারান্টি',
      footerText: 'হালাল বাজার বিডি — আপনার আস্থার বিশ্বস্ত অনলাইন শপ।',
      navItems: TEMPLATES.spices.navItems,
      categoryNavItems: DEFAULT_CATEGORY_NAV_ITEMS,
      facebookUrl: 'https://facebook.com/halalbazarbd',
      whatsappNumber: '01711-889900',
      spicesImage: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
      clothingImage: '/src/assets/images/hero_premium_apparel_1791006163359.jpg',
    };
    const saved = localStorage.getItem('hb_store_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged: StoreSettings = { ...defaultSettings, ...parsed };
        if (merged.storeName === 'Halal Bazar BD - Pure & Organic Products') {
          merged.storeName = 'Halal Bazar BD';
        }
        if (Array.isArray(parsed.navItems)) {
          merged.navItems = parsed.navItems.map((item: any) => {
            if (item.labelBn?.includes('মসলা') || item.labelBn?.includes('মশলা')) {
              return { ...item, labelBn: 'ড্রাই ফ্রুটস ও পণ্যসম্ভার', labelEn: 'Dry Fruits & Nuts' };
            }
            return item;
          });
        }
        if (merged.storeTagline?.includes('মসলা') || merged.storeTagline?.includes('মশলা')) merged.storeTagline = defaultSettings.storeTagline;
        if (merged.heroTitle?.includes('মসলা') || merged.heroTitle?.includes('মশলা')) merged.heroTitle = defaultSettings.heroTitle;
        if (merged.heroSubtitle?.includes('মসলা') || merged.heroSubtitle?.includes('মশলা')) merged.heroSubtitle = defaultSettings.heroSubtitle;
        if (merged.announcementText?.includes('মসলা') || merged.announcementText?.includes('মশলা')) merged.announcementText = defaultSettings.announcementText;
        if (merged.spicesTitleBn?.includes('মসলা') || merged.spicesTitleBn?.includes('মশলা')) merged.spicesTitleBn = '🥜 প্রিমিয়াম ড্রাই ফ্রুটস ও বাদাম কর্নার';
        if (merged.spicesDescBn?.includes('মসলা') || merged.spicesDescBn?.includes('মশলা') || merged.spicesDescBn?.includes('হলুদ')) {
          merged.spicesDescBn = 'বিশ্বের সেরা বাগান থেকে সংগৃহীত প্রিমিয়াম কাজুবাদাম, ক্যালিফোর্নিয়া কাঠবাদাম, ইরানি মরিয়ম খেজুর, আফগানি সোনালী কিসমিস, রোস্টেড পেস্তাবাদাম ও শুকনো আঞ্জির।';
        }
        if (merged.spicesImage?.includes('spice_turmeric') || merged.spicesImage?.includes('hero_pure_spices')) {
          merged.spicesImage = defaultSettings.spicesImage;
        }
        if (!merged.nextInvoiceNumber || isNaN(merged.nextInvoiceNumber) || merged.nextInvoiceNumber < 1) {
          merged.nextInvoiceNumber = 1;
        }
        return merged;
      } catch (e) {}
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('hb_store_settings', JSON.stringify(storeSettings));
    try {
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_SETTINGS', payload: storeSettings, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}

    // Persist to Firestore
    const splitData = splitSettingsForFirestore(storeSettings);
    Object.entries(splitData).forEach(([key, value]) => {
      setDoc(doc(db, 'settings', key), value)
        .catch((e) => handleFirestoreError(e, OperationType.WRITE, `settings/${key}`));
    });
  }, [storeSettings]);

  useEffect(() => {
    if (storeSettings.themeId && storeSettings.themeId !== activeTheme.id) {
      const found = COLOR_THEMES.find((t) => t.id === storeSettings.themeId);
      if (found) {
        setActiveTheme(found);
        if (typeof window !== 'undefined') {
          localStorage.setItem('hb_active_theme_id', found.id);
        }
      }
    }
  }, [storeSettings.themeId]);

  useEffect(() => {
    if (storeSettings.themeId !== activeTheme.id || storeSettings.primaryColor !== activeTheme.primary) {
      setStoreSettings((prev) => ({
        ...prev,
        themeId: activeTheme.id,
        primaryColor: activeTheme.primary,
        secondaryColor: activeTheme.accent,
      }));
    }
  }, [activeTheme]);

  // Orders State with localStorage & sequential numbering starting strictly from 1
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<AdminOrder[]>([]);

  useEffect(() => {
    localStorage.setItem('hb_admin_orders', JSON.stringify(orders));
    try {
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_ORDERS', payload: orders, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}
  }, [orders]);

  // Shop & Booking States
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [initialTrackQuery, setInitialTrackQuery] = useState<string>('');

  // Real-time Order Notification States
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'denied';
  });
  const [newOrderToast, setNewOrderToast] = useState<AdminOrder | null>(null);

  const isInitialOrdersLoad = useRef(true);
  const knownOrderIds = useRef<Set<string>>(new Set());

  const handleRequestNotificationPermission = async () => {
    const perm = await requestNotificationPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      playOrderNotificationSound();
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
        }).catch(() => {});
      }
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trackVal = params.get('track') || params.get('order');
    if (trackVal) {
      setInitialTrackQuery(trackVal.trim());
      setTrackerOpen(true);
    }
  }, []);

  // Express Order & Invoice & Review Modals State
  const [expressProduct, setExpressProduct] = useState<ProductItem | null>(null);
  const [isExpressModalOpen, setIsExpressModalOpen] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<AdminOrder | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleOpenExpressOrder = (product: ProductItem) => {
    setExpressProduct(product);
    setIsExpressModalOpen(true);
  };

  // Live Testimonials / Reviews State with localStorage (starts blank)
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(() => {
    const saved = localStorage.getItem('hb_live_testimonials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out default demo reviews if any
          const demoIds = new Set(['1', '2', '3', 'rev-1', 'rev-2', 'rev-3', 't_sp1', 't_sp2', 't_sp3']);
          return parsed.filter((t: any) => !demoIds.has(t.id));
        }
      } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('hb_live_testimonials', JSON.stringify(testimonials));
  }, [testimonials]);

  const handleAddReview = (newReview: {
    author: string;
    location?: string;
    productName?: string;
    rating: number;
    comment: string;
  }) => {
    const avatar = newReview.author.slice(0, 2).toUpperCase();
    const item: TestimonialItem = {
      id: `rev-${Date.now()}`,
      quoteBn: newReview.comment,
      quoteEn: newReview.comment,
      authorBn: newReview.author,
      authorEn: newReview.author,
      roleBn: newReview.productName ? `ক্রেতা (${newReview.productName})` : 'সন্তুষ্ট ক্রেতা',
      roleEn: newReview.productName ? `Buyer (${newReview.productName})` : 'Verified Buyer',
      organizationBn: newReview.location || 'বাংলাদেশ',
      organizationEn: newReview.location || 'Bangladesh',
      avatarText: avatar || 'HB',
      rating: newReview.rating || 5,
      productName: newReview.productName,
      date: 'আজকে'
    };
    setTestimonials((prev) => [item, ...prev]);
    fetch('/api/testimonials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testimonial: item }),
    }).catch(() => {});
    showToast('🎉 আপনার রিভিউটি সফলভাবে গৃহীত ও ওয়েবসাইটে যুক্ত হয়েছে!');
  };

  // Submissions (Contact & Wholesale Messages) with localStorage (starts blank)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [archivedSubmissions, setArchivedSubmissions] = useState<FormSubmission[]>([]);

  useEffect(() => {
    localStorage.setItem('hb_admin_submissions', JSON.stringify(submissions));
    try {
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_SUBMISSIONS', payload: submissions, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}
  }, [submissions]);

  const handleUpdateMessage = async (updatedMessage: FormSubmission) => {
    if (updatedMessage.isArchived) {
      setArchivedSubmissions((prev) => prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
    } else {
      setSubmissions((prev) => {
        const exists = prev.find(m => m.id === updatedMessage.id);
        if (exists) {
            return prev.map((m) => (m.id === updatedMessage.id ? updatedMessage : m));
        } else {
            return [updatedMessage, ...prev];
        }
      });
      setArchivedSubmissions((prev) => prev.filter((m) => m.id !== updatedMessage.id));
    }

    setDoc(doc(db, 'submissions', updatedMessage.id), sanitizeForFirestore(updatedMessage)).catch(e => console.error('Firebase Submission Update Error:', e));

    fetch('/api/submissions/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions: updatedMessage.isArchived ? [...submissions, updatedMessage] : submissions }),
    }).catch(() => {});
    showToast(isBn ? 'পাইকারি অনুসন্ধানের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে!' : 'Wholesale inquiry updated!');
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isBn = language === 'bn';

  // Dynamic descriptive contents based on active tab (Dry Fruits vs Clothing)
  const categoryContents = {
    spices: {
      taglineBn: 'শতভাগ প্রিমিয়াম ড্রাই ফ্রুটস, কাজুবাদাম, কাঠবাদাম, ইরানি মরিয়ম খেজুর ও সোনালী কিসমিস',
      heroHeadlineBn: 'কোনো কেমিক্যাল নেই, ১০০% প্রাকৃতিক ও পুষ্টিকর প্রিমিয়াম ড্রাই ফ্রুটস',
      heroSubheadlineBn: 'বিশ্বসেরা বাগান থেকে সংগৃহীত রোস্টেড কাজুবাদাম, ক্যালিফোর্নিয়া কাঠবাদাম, ইরানি মরিয়ম খেজুর, আফগানি কিসমিস ও শুকনো আঞ্জির।',
      heroCtaPrimaryBn: 'ড্রাই ফ্রুটস ও বাদাম কিনুন',
      aboutBadgeBn: '১০০% বিশুদ্ধতা ও কোয়ালিটির নিশ্চয়তা',
      aboutTitleBn: 'পুষ্টি, স্বাদ ও স্বাস্থ্য সুরক্ষায় অনন্য — প্রতিটি ড্রাই ফ্রুটসে শতভাগ প্রিমিয়াম মান',
      aboutDescBn: 'বিশ্বসেরা বাগান থেকে সরাসরি সংগৃহীত প্রিমিয়াম কাজুবাদাম, ক্যালিফোর্নিয়া কাঠবাদাম, রোস্টেড পেস্তাবাদাম, শুকনো আঞ্জির, ইরানি মরিয়ম খেজুর ও সোনালী কিসমিস। প্রতিটি ড্রাই ফ্রুটসে আমরা নিশ্চিত করি সর্বোচ্চ সতেজতা ও প্রিমিয়াম কোয়ালিটি।',
      metrics: [
        { value: '১০০%', labelBn: 'খাঁটি ও প্রিমিয়াম কোয়ালিটি', labelEn: '100% Quality Guaranteed' },
        { value: '২৪-৪৮ঘণ্টা', labelBn: 'সারা দেশে দ্রুত হোম ডেলিভারি', labelEn: 'Fast Nationwide Delivery' },
      ],
      servicesSectionTitleBn: 'কেন আমাদের প্রিমিয়াম ড্রাই ফ্রুটস কিনবেন?',
      servicesSectionDescBn: 'সরাসরি বিশ্বসেরা বাগান থেকে সংগৃহীত সর্বোচ্চ কোয়ালিটি, সতেজতা ও পুষ্টিগুণের প্রতিশ্রুতি',
      services: [
        {
          id: 'sp_s1',
          number: '01',
          titleBn: '১০০% অরিজিনাল ও কেমিক্যালমুক্ত ড্রাই ফ্রুটস',
          titleEn: 'Triple-Sorted & Fresh Dry Fruits',
          descBn: 'সরাসরি আন্তর্জাতিক সেরা বাগান থেকে সংগ্রহ করে সম্পূর্ণ প্রাকৃতিকভাবে সংরক্ষিত প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, পেস্তা ও কিসমিস।',
          descEn: 'Whole premium jumbo nuts and dried fruits harvested ethically without artificial dyes or preservatives.',
          metric: '১০০%',
          metricLabelBn: 'ভেজালমুক্ত ও তাজা',
          metricLabelEn: 'Fresh & Chemical-Free'
        },
        {
          id: 'sp_s2',
          number: '02',
          titleBn: 'ভিআইপি ইরানি মরিয়ম ও আজওয়া খেজুর',
          titleEn: 'VIP Iranian & Saudi Dates',
          descBn: 'আসল মদিনার আজওয়া ও প্রিমিয়াম ইরানি মরিয়ম খেজুর। নরম, রসালো ও প্রাকৃতিক শক্তিবর্ধক।',
          descEn: 'Authentic Ajwa and Maryam dates packed with natural caramel taste and energy.',
          metric: '১০০%',
          metricLabelBn: 'প্রাকৃতিক ও মিষ্টি',
          metricLabelEn: 'Pure & Natural'
        },
        {
          id: 'sp_s3',
          number: '03',
          titleBn: 'ফুড-গ্রেড এয়ারটাইট জিপলক ও নিরাপদ প্যাকেজিং',
          titleEn: 'Airtight Food-Grade Packaging',
          descBn: 'প্রতিটি ড্রাই ফ্রুটস ফুড-গ্রেড এয়ারটাইট জিপলক প্যাকেজে সিল করা হয়, যা বাদাম ও ফলের মচমচে ভাব ও পুষ্টি দীর্ঘদিন অক্ষুণ্ণ রাখে।',
          descEn: 'Multi-layer food-grade resealable pouches ensure moisture-proof and long-lasting crispness.',
          metric: '২৪-৪৮ঘণ্টা',
          metricLabelBn: 'দ্রুততম হোম ডেলিভারি',
          metricLabelEn: 'Express Shipping Delivery'
        }
      ]
    },
    clothing: {
      taglineBn: 'প্রিমিয়াম কোয়ালিটি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস ও কমফোর্টেবল ক্যাজুয়াল কালেকশন',
      heroHeadlineBn: 'ফ্যাশনে আপসহীন — প্রতিটি পোশাকে ১০০% প্রিমিয়াম মান',
      heroSubheadlineBn: 'আমাদের নিজস্ব তাঁতি ও অভিজ্ঞ কারিগরদের বোনা রয়্যাল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস ও ক্যাজুয়াল পোলো টি-শার্ট।',
      heroCtaPrimaryBn: 'নতুন কালেকশন দেখুন',
      aboutBadgeBn: 'আকর্ষণীয় ডিজাইন ও কোয়ালিটি ফেব্রিক',
      aboutTitleBn: 'ফ্যাশন ও আরামের চমৎকার ফিউশন — প্রতিটি পোশাকে প্রিমিয়াম গুণমান',
      aboutDescBn: 'উৎসব ও দৈনন্দিন ব্যবহারের জন্য আমাদের নিজস্ব তাঁতি ও কারিগরদের বোনা রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস, পোলো টি-শার্ট ও ইমপোর্টেড দুবাই বোরকা-হিজাব সেট। কালার গ্যারান্টি ও প্রিমিয়াম ফেব্রিকের কারণে আমাদের প্রতিটি পোশাক আপনার দেবে পূর্ণ স্বস্তি।',
      metrics: [
        { value: '১০০%', labelBn: 'প্রিমিয়াম কটন ও সাইজ গ্যারান্টি', labelEn: '100% Premium Cotton Fabric' },
        { value: '২৪-৪৮ঘণ্টা', labelBn: 'সারা দেশে ক্যাশ অন ডেলিভারি', labelEn: 'Nationwide Cash On Delivery' },
      ],
      servicesSectionTitleBn: 'কেন আমাদের পোশাক কালেকশন পছন্দ করবেন?',
      servicesSectionDescBn: 'সেরা কারিগরদের বোনা সূক্ষ্ম কাজ ও শতভাগ কমফোর্ট ফেব্রিকের নিশ্চয়তা',
      services: [
        {
          id: 'cl_s1',
          number: '01',
          titleBn: 'অভিজ্ঞ কারিগরদের এক্সক্লুসিভ ডিজাইন',
          titleEn: 'Exclusive Designs & Hand Embroideries',
          descBn: 'প্রতিটি পাঞ্জাবি, শাড়ি ও থ্রি-পিসে ব্যবহার করা হয়েছে নিখুঁত হাতের কাজ, গর্জিয়াস সুতার এমব্রয়ডারি এবং আকর্ষণীয় ফিনিশিং।',
          descEn: 'Every luxury item features exquisite custom embroidery patterns and master-tailored fits.',
          metric: '১০০%',
          metricLabelBn: 'এক্সক্লুসিভ ডিজাইন',
          metricLabelEn: 'Exclusive Artisanal'
        },
        {
          id: 'cl_s2',
          number: '02',
          titleBn: '১০০% কটন ও আরামদায়ক প্রিমিয়াম ফেব্রিক',
          titleEn: '100% High-Grade Combed Cotton',
          descBn: 'যেকোনো ঋতুতে আরামদায়ক ব্যবহারের জন্য শতভাগ প্রিমিয়াম লাক্সারি কটন, লিনেন ও জর্জেট ফেব্রিক গ্যারান্টি।',
          descEn: 'Breathable premium long-staple cotton and natural flax linen for maximum all-day wear comfort.',
          metric: '১০০%',
          metricLabelBn: 'ফেব্রিক গ্যারান্টি',
          metricLabelEn: 'Fabric & Color Promise'
        },
        {
          id: 'cl_s3',
          number: '03',
          titleBn: 'রয়েল গিফট বক্স প্যাকেজিং ও সহজ এক্সচেঞ্জ',
          titleEn: 'Luxury Gift Box & Easy Exchange',
          descBn: 'প্রতিটি পোশাক আকর্ষণীয় রয়েল গিফট বক্সে প্রিমিয়াম প্যাকেজিংয়ে ডেলিভারি করা হয়। সাইজ সমস্যা হলে রয়েছে সহজ ৩ দিনের এক্সচেঞ্জ সুবিধা।',
          descEn: 'Shipped in deluxe signature gift boxes with an easy 3-day return or exchange window for complete peace of mind.',
          metric: '৩ দিন',
          metricLabelBn: 'সহজ এক্সচেঞ্জ',
          metricLabelEn: 'Hassle-Free Exchange'
        }
      ]
    }
  };

  const activeContent = categoryContents[activeCategoryTab];
  const isClothing = activeCategoryTab === 'clothing';

  // Active Website Data synced with Store Settings and active tab
  const currentSiteData: WebsiteData = {
    ...TEMPLATES.spices,
    nameBn: storeSettings.storeName,
    nameEn: storeSettings.storeName,
    storeBadgeBn: storeSettings.storeBadgeBn || 'প্রিমিয়াম স্টোর',
    logoLetter: storeSettings.logoLetter,
    logoImage: storeSettings.logoImage,
    taglineBn: activeContent.taglineBn,
    taglineEn: activeContent.taglineBn,
    heroHeadlineBn: isClothing
      ? (storeSettings.clothingHeroTitle || TEMPLATES.spices.clothingHeroTitle || activeContent.heroHeadlineBn)
      : (storeSettings.heroTitle || activeContent.heroHeadlineBn),
    heroHeadlineEn: isClothing
      ? (storeSettings.clothingHeroTitle || TEMPLATES.spices.clothingHeroTitle || activeContent.heroHeadlineBn)
      : (storeSettings.heroTitle || activeContent.heroHeadlineBn),
    heroSubheadlineBn: isClothing
      ? (storeSettings.clothingHeroSubtitle || TEMPLATES.spices.clothingHeroSubtitle || activeContent.heroSubheadlineBn)
      : (storeSettings.heroSubtitle || activeContent.heroSubheadlineBn),
    heroSubheadlineEn: isClothing
      ? (storeSettings.clothingHeroSubtitle || TEMPLATES.spices.clothingHeroSubtitle || activeContent.heroSubheadlineBn)
      : (storeSettings.heroSubtitle || activeContent.heroSubheadlineBn),
    heroCtaPrimaryBn: isClothing
      ? (storeSettings.clothingHeroCtaText || TEMPLATES.spices.clothingHeroCtaText || activeContent.heroCtaPrimaryBn)
      : (storeSettings.heroCtaText || activeContent.heroCtaPrimaryBn),
    heroCtaPrimaryEn: isClothing
      ? (storeSettings.clothingHeroCtaText || TEMPLATES.spices.clothingHeroCtaText || activeContent.heroCtaPrimaryBn)
      : (storeSettings.heroCtaText || activeContent.heroCtaPrimaryBn),
    heroImage: isClothing
      ? (storeSettings.clothingHeroImage || storeSettings.clothingImage || TEMPLATES.spices.clothingHeroImage || '/src/assets/images/hero_premium_apparel_1791006163359.jpg')
      : (storeSettings.heroImage || TEMPLATES.spices.heroImage),
    heroBadge: isClothing
      ? (storeSettings.clothingHeroBadge || TEMPLATES.spices.clothingHeroBadge || activeContent.aboutBadgeBn)
      : (storeSettings.heroBadge || activeContent.aboutBadgeBn),
    aboutBadgeBn: storeSettings.aboutBadgeBn || (isClothing ? storeSettings.clothingHeroBadge : storeSettings.heroBadge) || activeContent.aboutBadgeBn,
    clothingHeroFloatingBadge: isClothing
      ? (storeSettings.clothingHeroFloatingBadge || TEMPLATES.spices.clothingHeroFloatingBadge || '১০০% ফেব্রিক ও সাইজ গ্যারান্টি')
      : undefined,
    aboutBadgeEn: isClothing
      ? (storeSettings.clothingHeroBadge || activeContent.aboutBadgeBn)
      : (storeSettings.heroBadge || activeContent.aboutBadgeBn),
    aboutTitleBn: storeSettings.aboutTitleBn || activeContent.aboutTitleBn,
    aboutDescBn: storeSettings.aboutDescBn || activeContent.aboutDescBn,
    metrics: Array.isArray(storeSettings.customMetrics) && storeSettings.customMetrics.length > 0
      ? storeSettings.customMetrics
      : activeContent.metrics,
    servicesSectionTitleBn: storeSettings.servicesSectionTitleBn || storeSettings.spicesTitleBn || activeContent.servicesSectionTitleBn,
    servicesSectionDescBn: storeSettings.servicesSectionDescBn || storeSettings.spicesDescBn || activeContent.servicesSectionDescBn,
    services: Array.isArray(storeSettings.customServices) && storeSettings.customServices.length > 0
      ? storeSettings.customServices.map((s) => ({
          id: s.id,
          number: s.number,
          titleBn: s.titleBn,
          titleEn: s.titleBn,
          descBn: s.descBn,
          descEn: s.descBn,
          metric: s.metric,
          metricLabelBn: s.metricLabelBn,
          metricLabelEn: s.metricLabelBn,
        }))
      : (activeContent.services || TEMPLATES.spices.services),
    faqs: Array.isArray(storeSettings.customFaqs) && storeSettings.customFaqs.length > 0
      ? storeSettings.customFaqs.map((f) => ({
          id: f.id,
          questionBn: f.questionBn,
          questionEn: f.questionBn,
          answerBn: f.answerBn,
          answerEn: f.answerBn,
        }))
      : TEMPLATES.spices.faqs,
    testimonials: Array.isArray(storeSettings.customTestimonials) && storeSettings.customTestimonials.length > 0
      ? storeSettings.customTestimonials.map((t) => ({
          id: t.id,
          quoteBn: t.quoteBn,
          quoteEn: t.quoteBn,
          authorBn: t.authorBn,
          authorEn: t.authorBn,
          roleBn: t.roleBn || 'সম্মানিত গ্রাহক',
          roleEn: t.roleBn || 'Valued Customer',
          organizationBn: 'হালাল বাজার বিডি',
          organizationEn: 'Halal Bazar BD',
          avatarText: t.authorBn ? t.authorBn.charAt(0) : 'গ',
          rating: t.rating || 5,
          productName: t.productName,
        }))
      : TEMPLATES.spices.testimonials,
    contactTitleBn: storeSettings.contactTitleBn || TEMPLATES.spices.contactTitleBn,
    contactDescBn: storeSettings.contactDescBn || TEMPLATES.spices.contactDescBn,
    faqSectionTitleBn: storeSettings.faqTitleBn || TEMPLATES.spices.faqSectionTitleBn,
    faqSectionDescBn: storeSettings.faqDescBn || TEMPLATES.spices.faqSectionDescBn || 'আপনার প্রয়োজনীয় সব প্রশ্নের স্পষ্ট ও সুনির্দিষ্ট উত্তর',
    faqSectionDescEn: storeSettings.faqDescBn || TEMPLATES.spices.faqSectionDescEn || 'Direct answers to our most common operational inquiries',
    contactEmail: storeSettings.email,
    contactPhone: storeSettings.phone,
    contactAddressBn: storeSettings.address,
    contactAddressEn: storeSettings.address,
    facebookUrl: storeSettings.facebookUrl,
    whatsappNumber: storeSettings.whatsappNumber,
    spicesImage: storeSettings.spicesImage,
    clothingImage: storeSettings.clothingImage,
    announcementText: storeSettings.announcementText,
    isAnnouncementActive: storeSettings.isAnnouncementActive,
    footerTextBn: storeSettings.footerTextBn || storeSettings.footerText,
    footerTextEn: storeSettings.footerTextBn || storeSettings.footerText,
    heroSlides: storeSettings.heroSlides,
    products: products,
    navItems: Array.isArray(storeSettings.navItems) && storeSettings.navItems.length > 0
      ? storeSettings.navItems
      : TEMPLATES.spices.navItems,
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Cart Handlers
  const handleAddToCart = (product: ProductItem) => {
    if (product.inStock === false) {
      showToast(isBn ? `দুঃখিত, "${product.nameBn}" বর্তমানে স্টক আউট (Out of Stock)` : `Sorry, "${product.nameEn}" is currently Out of Stock`);
      return;
    }
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    showToast(isBn ? `"${product.nameBn}" ব্যাগে যোগ হয়েছে` : `Added "${product.nameEn}" to bag`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Unified Real-Time Cloud Listeners (Firebase Firestore)
  useEffect(() => {
    // 1. Listen for real-time Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as StoreSettings;
        setStoreSettings((prev) => ({
          ...prev,
          ...data,
          logoImage: data.logoImage || prev.logoImage,
          heroImage: data.heroImage || prev.heroImage,
          clothingHeroImage: data.clothingHeroImage || prev.clothingHeroImage,
          clothingImage: data.clothingImage || prev.clothingImage,
          spicesImage: data.spicesImage || prev.spicesImage,
          favicon: data.favicon || prev.favicon,
          heroSlides: (data.heroSlides && data.heroSlides.length > 0) ? data.heroSlides : prev.heroSlides,
        }));
      }
    }, (err) => {
      console.warn('Firestore Settings Listener:', err);
    });

    // 2. Listen for real-time Products & Inventory
    const unsubProducts = onSnapshot(doc(db, 'products', 'inventory'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data?.items) && data.items.length > 0) {
          if (data.updatedBy !== CLIENT_ID) {
            setProducts((prev) => {
              return data.items.map((cloudItem: ProductItem) => {
                const localMatch = prev.find((p) => p.id === cloudItem.id);
                if (localMatch && localMatch.image && localMatch.image.startsWith('data:') && !cloudItem.image?.startsWith('data:')) {
                  return { ...cloudItem, image: localMatch.image };
                }
                return cloudItem;
              });
            });
          }
        }
      }
    }, (err) => {
      console.warn('Firestore Products Listener:', err);
    });

    // 3. Listen for real-time Orders
    const unsubOrders = onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      const ords: AdminOrder[] = [];
      const arch: AdminOrder[] = [];
      snap.forEach((d) => {
        const data = d.data() as AdminOrder;
        if (data.isArchived) {
          arch.push(data);
        } else {
          ords.push(data);
        }
      });

      if (isInitialOrdersLoad.current) {
        ords.forEach((o) => knownOrderIds.current.add(o.id));
        arch.forEach((o) => knownOrderIds.current.add(o.id));
        isInitialOrdersLoad.current = false;
      } else if (isAdminAuthenticated) {
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newOrd = change.doc.data() as AdminOrder;
            if (!knownOrderIds.current.has(newOrd.id) && !newOrd.isArchived) {
              knownOrderIds.current.add(newOrd.id);

              // Trigger Real-Time Desktop Browser Notification & Audio Chime
              sendBrowserOrderNotification(newOrd, () => {
                setActiveTab('orders');
              });

              // Set in-app toast alert
              setNewOrderToast(newOrd);

              // Flash browser tab title for visibility
              document.title = `🚨 (নতুন অর্ডার!) ${storeSettings.storeName}`;
            }
          }
        });
      }

      setOrders(ords);
      setArchivedOrders(arch);
    }, (error) => {
      console.warn('Firestore Orders Listener Error:', error);
    });

    // 4. Listen for real-time Submissions & Wholesale Inquiries
    const unsubSubs = onSnapshot(query(collection(db, 'submissions'), orderBy('timestamp', 'desc')), (snap) => {
      const subs: FormSubmission[] = [];
      const arch: FormSubmission[] = [];
      snap.forEach((d) => {
        const data = d.data() as FormSubmission;
        if (data.isArchived) {
          arch.push(data);
        } else {
          subs.push(data);
        }
      });
      setSubmissions(subs);
      setArchivedSubmissions(arch);
    }, (error) => {
      console.warn('Firestore Submissions Listener Error:', error);
    });

    return () => {
      unsubSettings();
      unsubProducts();
      unsubOrders();
      unsubSubs();
    };
  }, [isAdminAuthenticated, storeSettings.storeName]);

  // Admin Portal Tab Management
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // New Order / Form Submission Handler
  const handleNewSubmission = async (sub: Omit<FormSubmission, 'id' | 'timestamp'>) => {
    const orderTimestamp = formatOrderDateTime(new Date());
    const subId = `sub-${Date.now()}`;
    const newEntry: FormSubmission = {
      ...sub,
      id: subId,
      timestamp: orderTimestamp,
    };
    setSubmissions((prev) => [newEntry, ...prev]);

    // Save to Firebase (Permanent Storage)
    try {
      await setDoc(doc(db, 'submissions', subId), sanitizeForFirestore(newEntry));
    } catch (e) {
      console.error('Firebase Submission Error:', e);
    }

    // If it's a shop checkout order, create an AdminOrder
    if (sub.type === 'order' || sub.type === 'express_order') {
      let itemsToOrder: AdminOrder['items'] = [];
      if (sub.details?.cartItems) {
        itemsToOrder = sub.details.cartItems;
      } else if (sub.details?.cartItemsJson) {
        try {
          itemsToOrder = JSON.parse(sub.details.cartItemsJson);
        } catch (e) {}
      }
      if (itemsToOrder.length === 0 && cartItems.length > 0) {
        itemsToOrder = cartItems.map((ci) => ({
          productName: ci.product.nameBn,
          quantity: ci.quantity,
          price: ci.product.price,
          originalPrice: ci.product.originalPrice || ci.product.price,
          discountPercent: ci.product.discountPercent || 0,
        }));
      }
      if (itemsToOrder.length === 0) {
        itemsToOrder = [{ productName: 'অনলাইন অর্ডারকৃত পণ্য', quantity: 1, price: 500 }];
      }

      const subtotal = itemsToOrder.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const originalSubtotal = itemsToOrder.reduce((sum, i) => sum + (i.originalPrice || i.price) * i.quantity, 0);
      
      // Additional coupon discount from details if present
      const extraDiscount = Number(sub.details?.discountAmount || 0);
      
      const discountAmount = Math.max(0, originalSubtotal - subtotal) + extraDiscount;
      const discountPercent = originalSubtotal > 0 && discountAmount > 0 ? Math.round((discountAmount / originalSubtotal) * 100) : 0;
      const deliveryFee = sub.details?.deliveryArea === 'Inside Dhaka' ? storeSettings.deliveryFeeDhaka : storeSettings.deliveryFeeOutside;
      const total = (subtotal - extraDiscount) + deliveryFee;

      const paymentMethodRaw = sub.details?.paymentMethod || '';
      let resolvedPaymentMethod: 'cod' | 'bkash' | 'nagad' = 'cod';
      if (paymentMethodRaw.toLowerCase().includes('nagad') || paymentMethodRaw.includes('নগদ')) {
        resolvedPaymentMethod = 'nagad';
      } else if (paymentMethodRaw.toLowerCase().includes('bkash') || paymentMethodRaw.includes('বিকাশ')) {
        resolvedPaymentMethod = 'bkash';
      }

      const initialAdvance = resolvedPaymentMethod !== 'cod' ? total : 0;
      const initialDue = total - initialAdvance;

      // Calculate highest serial number ever assigned across active and archived orders
      const maxActiveSerial = orders.reduce((max, o) => {
        const s = o.serialNo || (o.orderNumber ? parseInt(String(o.orderNumber).replace(/\D/g, ''), 10) : 0);
        return !isNaN(s) && s > max ? s : max;
      }, 0);

      const maxArchivedSerial = archivedOrders.reduce((max, o) => {
        const s = o.serialNo || (o.orderNumber ? parseInt(String(o.orderNumber).replace(/\D/g, ''), 10) : 0);
        return !isNaN(s) && s > max ? s : max;
      }, 0);

      const maxExistingSerial = Math.max(maxActiveSerial, maxArchivedSerial);
      const configuredStart = Number(storeSettings.nextInvoiceNumber);
      const validConfigured = !isNaN(configuredStart) && configuredStart > 0 ? configuredStart : 1;

      // Strictly monotonic serial number (never re-uses deleted order numbers)
      const nextSerial = Math.max(maxExistingSerial + 1, validConfigured);

      const prefix = storeSettings.invoicePrefix !== undefined ? storeSettings.invoicePrefix : 'INV-';
      const formattedInvoiceNo = prefix ? `${prefix}${String(nextSerial).padStart(4, '0')}` : `${nextSerial}`;

      // Update storeSettings nextInvoiceNumber for subsequent orders
      const updatedSettings = {
        ...storeSettings,
        nextInvoiceNumber: nextSerial + 1,
      };
      handleUpdateSettings(updatedSettings);

      const newAdminOrder: AdminOrder = {
        id: `ord-${Date.now()}`,
        serialNo: nextSerial,
        orderNumber: `${nextSerial}`,
        invoiceNumber: formattedInvoiceNo,
        customerName: sub.name,
        customerPhone: sub.phone || '',
        customerAddress: sub.details?.address || sub.message,
        deliveryArea: sub.details?.deliveryArea === 'Inside Dhaka' ? 'dhaka' : 'outside',
        paymentMethod: resolvedPaymentMethod,
        paymentChannel: resolvedPaymentMethod,
        trxId: sub.details?.trxId || undefined,
        senderNumber: sub.details?.senderNumber || undefined,
        items: itemsToOrder,
        subtotal,
        originalSubtotal: originalSubtotal > subtotal ? originalSubtotal : undefined,
        discountAmount: discountAmount > 0 ? discountAmount : undefined,
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
        deliveryFee,
        total,
        advancePaid: initialAdvance,
        dueAmount: initialDue,
        orderNotes: sub.details?.orderNotes || sub.details?.notes || undefined,
        status: 'pending',
        createdAt: orderTimestamp,
      };

      setOrders((prev) => [newAdminOrder, ...prev]);
      setInvoiceOrder(newAdminOrder);
      setIsInvoiceModalOpen(true);

      // Automated Inventory Deduction on Order Placement (Only if explicitly enabled by admin)
      if (storeSettings.autoDeductStockOnOrder) {
        setProducts((currentProducts) => {
          let changed = false;
          const updated = currentProducts.map((p) => {
            const matchItem = itemsToOrder.find(
              (it) => it.productName && (
                it.productName === p.nameBn ||
                it.productName.includes(p.nameBn) ||
                p.nameBn.includes(it.productName) ||
                (p.nameEn && it.productName.toLowerCase().includes(p.nameEn.toLowerCase()))
              )
            );
            if (matchItem) {
              changed = true;
              const currentQty = p.stockQuantity !== undefined ? p.stockQuantity : (p.inStock === false ? 0 : 12);
              const deduct = matchItem.quantity || 1;
              const newQty = Math.max(0, currentQty - deduct);
              return {
                ...p,
                stockQuantity: newQty,
                inStock: newQty > 0 ? (p.inStock !== false) : false,
                stockStatusText: newQty === 0 ? (p.stockStatusText || 'স্টক আউট') : p.stockStatusText,
              };
            }
            return p;
          });
          if (changed) {
            fetch('/api/products/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ products: updated }),
            }).catch(() => {});
          }
          return changed ? updated : currentProducts;
        });
      }

      if (isAdminAuthenticated) {
        sendBrowserOrderNotification(newAdminOrder, () => {
          setActiveTab('orders');
        });
        setNewOrderToast(newAdminOrder);
      }

      // Save to Firebase (Permanent Storage)
      try {
        await setDoc(doc(db, 'orders', newAdminOrder.id), sanitizeForFirestore(newAdminOrder));
      } catch (e) {
        console.error('Firebase Order Error:', e);
      }

      fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newAdminOrder }),
      }).catch(() => {});
    }

    fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submission: newEntry }),
    }).catch(() => {});

    showToast(
      isBn
        ? 'আপনার অর্ডার / বার্তা সফলভাবে গৃহীত হয়েছে! এডমিন প্যানেলে এটি যুক্ত হয়েছে।'
        : 'Order received and logged in Admin Panel!'
    );
  };

  // Admin Order Status Update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
      
      const orderToUpdate = next.find(o => o.id === orderId);
      if (orderToUpdate) {
        setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(orderToUpdate)).catch(e => console.error('Firebase Status Update Error:', e));
      }

      fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: next }),
      }).catch(() => {});
      return next;
    });
    showToast(`অর্ডার স্ট্যাটাস পরিবর্তন করা হয়েছে: ${newStatus}`);
  };

  // Admin Bulk Order Status Update
  const handleUpdateBulkOrderStatus = async (orderIds: string[], newStatus: OrderStatus) => {
    if (!orderIds || orderIds.length === 0) return;
    const idSet = new Set(orderIds);
    setOrders((prev) => {
      const next = prev.map((o) => (idSet.has(o.id) ? { ...o, status: newStatus } : o));

      orderIds.forEach((id) => {
        const orderToUpdate = next.find(o => o.id === id);
        if (orderToUpdate) {
          setDoc(doc(db, 'orders', id), sanitizeForFirestore(orderToUpdate)).catch(e => console.error('Firebase Bulk Status Update Error:', e));
        }
      });

      fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: next }),
      }).catch(() => {});
      return next;
    });
    showToast(`${orderIds.length}টি অর্ডারের স্ট্যাটাস সফলভাবে '${newStatus}'-এ আপডেট করা হয়েছে!`);
  };

  const handleUpdateOrder = async (updatedOrder: AdminOrder) => {
    if (updatedOrder.isArchived) {
      setArchivedOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)));
    } else {
      setOrders((prev) => {
        const exists = prev.find(o => o.id === updatedOrder.id);
        if (exists) {
            return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
        } else {
            return [updatedOrder, ...prev];
        }
      });
      setArchivedOrders((prev) => prev.filter((o) => o.id !== updatedOrder.id));
    }
    
    setDoc(doc(db, 'orders', updatedOrder.id), sanitizeForFirestore(updatedOrder)).catch(e => console.error('Firebase Order Update Error:', e));

    // Update API
    fetch('/api/orders/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders: updatedOrder.isArchived ? [...orders, updatedOrder] : orders }),
    }).catch(() => {});
    showToast(isBn ? 'অর্ডারের তথ্য আপডেট করা হয়েছে!' : 'Order updated successfully!');
  };

  const handleUpdateOrderDeliveryFee = async (orderId: string, newFee: number) => {
    setOrders((prev) => {
      const next = prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              deliveryFee: newFee,
              total: o.subtotal + newFee,
            }
          : o
      );

      const orderToUpdate = next.find(o => o.id === orderId);
      if (orderToUpdate) {
        setDoc(doc(db, 'orders', orderId), sanitizeForFirestore(orderToUpdate)).catch(e => console.error('Firebase Fee Update Error:', e));
      }

      fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: next }),
      }).catch(() => {});
      return next;
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    const orderToArchive = orders.find(o => o.id === orderId);
    if (orderToArchive) {
      // Mark as archived in Firestore (Never Delete)
      setDoc(doc(db, 'orders', orderId), sanitizeForFirestore({ ...orderToArchive, isArchived: true })).catch(e => console.error('Firebase Archive Error:', e));
    }

    setOrders((prev) => {
      const next = prev.filter((o) => o.id !== orderId);
      fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders: next }),
      }).catch(() => {});
      return next;
    });
    showToast(isBn ? 'অর্ডারটি সরানো হয়েছে (ডাটাবেসে সংরক্ষিত আছে)।' : 'Order removed (kept in database).');
  };

  const handleDeleteMessage = (messageId: string) => {
    const msgToArchive = submissions.find(m => m.id === messageId);
    if (msgToArchive) {
      // Mark as archived in Firestore (Never Delete)
      setDoc(doc(db, 'submissions', messageId), sanitizeForFirestore({ ...msgToArchive, isArchived: true })).catch(e => console.error('Firebase Archive Error:', e));
    }

    setSubmissions((prev) => {
      const next = prev.filter((m) => m.id !== messageId);
      fetch('/api/submissions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissions: next }),
      }).catch(() => {});
      return next;
    });
    showToast(isBn ? 'বার্তাটি সরানো হয়েছে (ডাটাবেসে সংরক্ষিত আছে)।' : 'Message removed (kept in database).');
  };

  const handleUpdateProducts = async (newProducts: ProductItem[]) => {
    setProducts(newProducts);
    try {
      localStorage.setItem('hb_live_products', JSON.stringify(newProducts));
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_PRODUCTS', payload: newProducts, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}

    // 1. Sync to Express Server (SSE broadcast to all local listeners)
    fetch('/api/products/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: newProducts }),
    }).catch(() => {});

    // 2. Sync to Firebase Cloud Firestore for persistent cross-device real-time sync
    try {
      const cleanItems = newProducts.map((p) => {
        const item: any = { ...p };
        if (typeof item.image === 'string' && (item.image.startsWith('data:') || item.image.length > 2048)) {
          item.image = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80';
        }
        return item;
      });
      await setDoc(doc(db, 'products', 'inventory'), {
        items: sanitizeForFirestore(cleanItems),
        updatedAt: Date.now(),
        updatedBy: CLIENT_ID,
      });
    } catch (e) {
      console.warn('Firebase Products Sync Error:', e);
    }
  };

  const handleUpdateSettings = async (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    
    try {
      localStorage.setItem('hb_store_settings', JSON.stringify(newSettings));
      const ch = new BroadcastChannel('halal_bazar_realtime_sync');
      ch.postMessage({ type: 'SYNC_SETTINGS', payload: newSettings, sender: CLIENT_ID });
      ch.close();
    } catch (e) {}

    // Save to Firebase (Permanent Storage)
    try {
      const cloudPayload = prepareSettingsForFirestore(newSettings);
      await setDoc(doc(db, 'settings', 'global'), cloudPayload);
    } catch (e) {
      console.error('Firebase Settings Error:', e);
      // Fallback: If still rejected, save essential non-binary scalar configuration
      try {
        const fallbackSettings = {
          storeName: newSettings.storeName,
          phone: newSettings.phone,
          email: newSettings.email,
          address: newSettings.address,
          deliveryFeeDhaka: newSettings.deliveryFeeDhaka,
          deliveryFeeOutside: newSettings.deliveryFeeOutside,
          lowStockThreshold: newSettings.lowStockThreshold,
          autoDeductStockOnOrder: newSettings.autoDeductStockOnOrder,
          updatedAt: Date.now(),
        };
        await setDoc(doc(db, 'settings', 'global'), fallbackSettings, { merge: true });
      } catch (innerErr) {
        console.warn('Fallback Firebase settings write failed:', innerErr);
      }
    }

    try {
      await fetch('/api/settings/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings }),
      });
    } catch (e) {}
  };

  const handleQuickEditSave = async (field: string, newValue: any, productId?: string) => {
    if (field === 'product' && productId) {
      const nextProducts = products.map((p) => {
        if (p.id === productId) {
          return {
            ...p,
            nameBn: newValue.nameBn,
            nameEn: newValue.nameEn || p.nameEn,
            price: Number(newValue.price),
            originalPrice: Number(newValue.originalPrice || newValue.price),
            inStock: Boolean(newValue.inStock),
            image: newValue.image || p.image,
          };
        }
        return p;
      });
      handleUpdateProducts(nextProducts);
      showToast('🎉 পণ্য সফলভাবে আপডেট করা হয়েছে!');
      return;
    }

    // Specially handle Hero Banner Image & Slides
    if (field === 'heroImage' || field === 'heroSlideImage') {
      const imgVal = typeof newValue === 'string' ? newValue : (newValue?.image || newValue?.primary || '');
      const currentSlides = storeSettings.heroSlides && storeSettings.heroSlides.length > 0 
        ? [...storeSettings.heroSlides] 
        : [...DEFAULT_BANNER_SLIDES];
      
      const targetIdx = productId !== undefined && !isNaN(Number(productId)) ? Number(productId) : 0;
      if (currentSlides[targetIdx]) {
        currentSlides[targetIdx] = { ...currentSlides[targetIdx], image: imgVal };
      } else {
        currentSlides[0] = { ...currentSlides[0], image: imgVal };
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        heroImage: targetIdx === 0 ? imgVal : (storeSettings.heroImage || imgVal),
        heroSlides: currentSlides,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 হিরো ব্যানার ছবি সফলভাবে পরিবর্তন করা হয়েছে!');
      return;
    }

    // Specially handle Hero Title & Slide Titles
    if (field === 'heroTitle' || field === 'heroSlideTitle') {
      const titleVal = typeof newValue === 'string' ? newValue : String(newValue || '');
      const currentSlides = storeSettings.heroSlides && storeSettings.heroSlides.length > 0 
        ? [...storeSettings.heroSlides] 
        : [...DEFAULT_BANNER_SLIDES];
      const targetIdx = productId !== undefined && !isNaN(Number(productId)) ? Number(productId) : 0;
      if (currentSlides[targetIdx]) {
        currentSlides[targetIdx] = { ...currentSlides[targetIdx], titleBn: titleVal, titleEn: titleVal };
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        heroTitle: targetIdx === 0 ? titleVal : (storeSettings.heroTitle || titleVal),
        heroSlides: currentSlides,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ব্যানার হেডলাইন সফলভাবে পরিবর্তন করা হয়েছে!');
      return;
    }

    // Specially handle Hero Subtitle & Slide Subtitles
    if (field === 'heroSubtitle' || field === 'heroSlideSubtitle') {
      const subVal = typeof newValue === 'string' ? newValue : String(newValue || '');
      const currentSlides = storeSettings.heroSlides && storeSettings.heroSlides.length > 0 
        ? [...storeSettings.heroSlides] 
        : [...DEFAULT_BANNER_SLIDES];
      const targetIdx = productId !== undefined && !isNaN(Number(productId)) ? Number(productId) : 0;
      if (currentSlides[targetIdx]) {
        currentSlides[targetIdx] = { ...currentSlides[targetIdx], subtitleBn: subVal, subtitleEn: subVal };
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        heroSubtitle: targetIdx === 0 ? subVal : (storeSettings.heroSubtitle || subVal),
        heroSlides: currentSlides,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ব্যানার সাবটাইটেল সফলভাবে পরিবর্তন করা হয়েছে!');
      return;
    }

    // Specially handle Hero Badge & Slide Badges
    if (field === 'heroBadge' || field === 'heroSlideBadge') {
      const badgeVal = typeof newValue === 'string' ? newValue : String(newValue || '');
      const currentSlides = storeSettings.heroSlides && storeSettings.heroSlides.length > 0 
        ? [...storeSettings.heroSlides] 
        : [...DEFAULT_BANNER_SLIDES];
      const targetIdx = productId !== undefined && !isNaN(Number(productId)) ? Number(productId) : 0;
      if (currentSlides[targetIdx]) {
        currentSlides[targetIdx] = { ...currentSlides[targetIdx], badgeBn: badgeVal, badgeEn: badgeVal };
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        heroBadge: targetIdx === 0 ? badgeVal : (storeSettings.heroBadge || badgeVal),
        heroSlides: currentSlides,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ব্যানার অফার ব্যাজ সফলভাবে পরিবর্তন করা হয়েছে!');
      return;
    }

    // Specially handle Hero CTA Button & Slide Buttons
    if (field === 'heroCtaText' || field === 'heroSlideCta') {
      const ctaVal = typeof newValue === 'string' ? newValue : String(newValue || '');
      const currentSlides = storeSettings.heroSlides && storeSettings.heroSlides.length > 0 
        ? [...storeSettings.heroSlides] 
        : [...DEFAULT_BANNER_SLIDES];
      const targetIdx = productId !== undefined && !isNaN(Number(productId)) ? Number(productId) : 0;
      if (currentSlides[targetIdx]) {
        currentSlides[targetIdx] = { ...currentSlides[targetIdx], ctaBn: ctaVal, ctaEn: ctaVal };
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        heroCtaText: targetIdx === 0 ? ctaVal : (storeSettings.heroCtaText || ctaVal),
        heroSlides: currentSlides,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ব্যানার বাটন টেক্সট সফলভাবে পরিবর্তন করা হয়েছে!');
      return;
    }

    // Specially handle FAQ Question & Answer inline edits
    if (field === 'faqItem' || field === 'faqQuestion' || field === 'faqAnswer' || field === 'faqs') {
      const baseFaqs = Array.isArray(storeSettings.customFaqs) && storeSettings.customFaqs.length > 0
        ? [...storeSettings.customFaqs]
        : TEMPLATES.spices.faqs.map((f) => ({
            id: f.id,
            questionBn: f.questionBn,
            answerBn: f.answerBn,
          }));

      const targetId = productId;
      let newQ = '';
      let newA = '';
      let isObject = false;

      if (typeof newValue === 'object' && newValue !== null) {
        isObject = true;
        newQ = String(newValue.questionBn || newValue.primary || '').trim();
        newA = String(newValue.answerBn || newValue.secondary || '').trim();
      } else if (field === 'faqAnswer') {
        newA = String(newValue || '').trim();
      } else {
        newQ = String(newValue || '').trim();
      }

      let found = false;
      const updatedFaqs = baseFaqs.map((f, idx) => {
        const cleanTarget = targetId ? String(targetId).replace(/^faq-[qa]?-?/, '').trim() : '';
        const isMatch = Boolean(
          targetId && (
            f.id === targetId ||
            f.id === cleanTarget ||
            targetId.includes(f.id) ||
            f.id.includes(targetId) ||
            (cleanTarget && (cleanTarget.includes(f.id) || f.id.includes(cleanTarget))) ||
            targetId === String(idx) ||
            targetId === `faq-${idx}` ||
            targetId === `faq-${idx + 1}`
          )
        );

        if (isMatch) {
          found = true;
          return {
            ...f,
            questionBn: isObject ? (newQ || f.questionBn) : (field === 'faqAnswer' ? f.questionBn : (newQ || f.questionBn)),
            answerBn: isObject ? (newA || f.answerBn) : (field === 'faqAnswer' ? (newA || f.answerBn) : f.answerBn),
            questionEn: isObject ? (newQ || f.questionBn) : (field === 'faqAnswer' ? ((f as any).questionEn || f.questionBn) : (newQ || f.questionBn)),
            answerEn: isObject ? (newA || f.answerBn) : (field === 'faqAnswer' ? (newA || f.answerBn) : ((f as any).answerEn || f.answerBn)),
          };
        }
        return f;
      });

      if (!found && targetId) {
        updatedFaqs.push({
          id: targetId,
          questionBn: newQ || 'নতুন প্রশ্ন',
          answerBn: newA || 'নতুন উত্তর',
          questionEn: newQ || 'New Question',
          answerEn: newA || 'New Answer',
        });
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        customFaqs: updatedFaqs,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 এফএকিউ প্রশ্ন ও উত্তর সফলভাবে সংরক্ষণ করা হয়েছে!');
      return;
    }

    // Specially handle FAQ Title & Description
    if (field === 'faqTitle' || field === 'faqTitleBn') {
      const txt = String(newValue || '');
      const updatedSettings: StoreSettings = {
        ...storeSettings,
        faqTitleBn: txt,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 এফএকিউ শিরোনাম সফলভাবে আপডেট হয়েছে!');
      return;
    }

    if (field === 'faqDesc' || field === 'faqDescBn') {
      const txt = String(newValue || '');
      const updatedSettings: StoreSettings = {
        ...storeSettings,
        faqDescBn: txt,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 এফএকিউ বিবরণ সফলভাবে আপডেট হয়েছে!');
      return;
    }

    // Specially handle Store Sub-Tagline / Badge (প্রিমিয়াম স্টোর)
    if (field === 'storeBadgeBn' || field === 'headerSubTagline') {
      const txt = String(newValue || '');
      const updatedSettings: StoreSettings = {
        ...storeSettings,
        storeBadgeBn: txt,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 স্টোর সাব-টাইটেল সফলভাবে পরিমার্জন করা হয়েছে!');
      return;
    }

    // Specially handle Testimonials card edit
    if (field === 'testimonials' && productId) {
      const baseReviews = Array.isArray(storeSettings.customTestimonials) && storeSettings.customTestimonials.length > 0
        ? [...storeSettings.customTestimonials]
        : TEMPLATES.spices.testimonials.map((t) => ({
            id: t.id,
            authorBn: t.authorBn,
            quoteBn: t.quoteBn,
            roleBn: t.roleBn,
            rating: t.rating,
            productName: t.productName,
          }));

      const valStr = typeof newValue === 'string' ? newValue : (newValue?.primary || '');
      const updatedReviews = baseReviews.map((t) => {
        if (t.id === productId || productId.includes(t.id)) {
          return { ...t, quoteBn: valStr };
        }
        return t;
      });

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        customTestimonials: updatedReviews,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 কাস্টমার রিভিউ সফলভাবে আপডেট করা হয়েছে!');
      return;
    }

    // Specially handle Services / Feature card edit
    if (field === 'services' && productId) {
      const baseServices = Array.isArray(storeSettings.customServices) && storeSettings.customServices.length > 0
        ? [...storeSettings.customServices]
        : TEMPLATES.spices.services.map((s) => ({
            id: s.id,
            number: s.number,
            titleBn: s.titleBn,
            descBn: s.descBn,
            metric: s.metric,
            metricLabelBn: s.metricLabelBn,
          }));

      const valStr = typeof newValue === 'string' ? newValue : (newValue?.primary || '');
      const updatedServices = baseServices.map((s) => {
        if (s.id === productId || productId.includes(s.id)) {
          return { ...s, descBn: valStr, titleBn: s.titleBn || valStr };
        }
        return s;
      });

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        customServices: updatedServices,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 বৈশিষ্ট্য কার্ড সফলভাবে আপডেট করা হয়েছে!');
      return;
    }

    // Specially handle Footer text
    if (field === 'footerText' || field === 'footerTextBn') {
      const txt = String(newValue || '');
      const updatedSettings: StoreSettings = {
        ...storeSettings,
        footerText: txt,
        footerTextBn: txt,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ফুটার টেক্সট সফলভাবে সংরক্ষণ করা হয়েছে!');
      return;
    }

    // Specially handle Phone
    if (field === 'phone' || field === 'contactPhone') {
      const ph = String(newValue || '');
      const updatedSettings: StoreSettings = {
        ...storeSettings,
        phone: ph,
      };
      await handleUpdateSettings(updatedSettings);
      showToast('🎉 ফোন নম্বর সফলভাবে সংরক্ষণ করা হয়েছে!');
      return;
    }

    const updatedSettings: StoreSettings = {
      ...storeSettings,
      [field]: newValue,
    };
    await handleUpdateSettings(updatedSettings);
    showToast('🎉 তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  // Render Offline Blocker if user is offline
  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950 text-white p-6 select-none font-sans">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Accent Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-6">
            {/* Warning Icon with Amber Ring and Wave animation */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="relative w-16 h-16 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-amber-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M21 3L3 21M8.464 8.464a5 5 0 017.072 0M12 13a1 1 0 110-2 1 1 0 010 2zM5.636 5.636a9 9 0 000 12.728m0-12.728L3 3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-extrabold text-amber-400">
                ইন্টারনেট সংযোগ বিচ্ছিন্ন!
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                এই ওয়েবসাইটটি ভিজিট করতে এবং অর্ডার করতে আপনার সচল ইন্টারনেট সংযোগ (ওয়াইফাই অথবা মোবাইল ডাটা) প্রয়োজন।
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const status = navigator.onLine;
                  setIsOnline(status);
                  if (status) {
                    window.location.reload();
                  }
                }}
                className="w-full py-3 px-6 rounded-xl font-bold bg-amber-400 text-neutral-950 hover:bg-amber-300 active:scale-98 transition-all shadow-lg shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                <span>পুনরায় চেষ্টা করুন</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Dedicated Admin Portal if open
  if (isAdminOpen) {
    if (!isAdminAuthenticated) {
      return (
        <AdminLogin
          storeName={storeSettings.storeName}
          settings={storeSettings}
          theme={activeTheme}
          onLoginSuccess={() => setIsAdminAuthenticated(true)}
          onBackToStore={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
        />
      );
    }

    // If activeTab is 'live_preview', fall through to render the full live store with the preview bar
    if (activeTab !== 'live_preview') {
      return (
        <AdminDashboard
          products={products}
          onUpdateProducts={handleUpdateProducts}
          orders={orders}
          archivedOrders={archivedOrders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onUpdateBulkOrderStatus={handleUpdateBulkOrderStatus}
          onUpdateOrder={handleUpdateOrder}
          onUpdateOrderDeliveryFee={handleUpdateOrderDeliveryFee}
          onDeleteOrder={handleDeleteOrder}
          settings={storeSettings}
          onUpdateSettings={handleUpdateSettings}
          messages={submissions}
          archivedMessages={archivedSubmissions}
          onUpdateMessage={handleUpdateMessage}
          onDeleteMessage={handleDeleteMessage}
          theme={activeTheme}
          onToggleTheme={handleToggleTheme}
          onSelectTheme={handleSelectTheme}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={handleRequestNotificationPermission}
          newOrderToast={newOrderToast}
          onClearNewOrderToast={() => {
            setNewOrderToast(null);
            document.title = storeSettings.storeName;
          }}
          onBackToStore={() => {
            setIsAdminOpen(false);
            if (window.location.hash === '#admin') {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          onLogout={() => {
            localStorage.removeItem('hb_admin_auth');
            setIsAdminAuthenticated(false);
          }}
        />
      );
    }
  }

  // Render Live Store (or Full Store Live Preview)
  return (
    <VisualEditorProvider isLivePreview={isAdminOpen && activeTab === 'live_preview'}>
      <div 
        className="min-h-screen text-neutral-900 flex flex-col font-sans selection:bg-neutral-900 selection:text-white transition-colors duration-300"
        style={{
          backgroundColor: activeTheme.bgLight,
          // @ts-ignore
          '--color-primary': activeTheme.primary,
          '--color-primary-hover': activeTheme.primaryHover,
          '--color-accent': activeTheme.accent,
          '--color-accent-bg': activeTheme.accentBg,
        }}
      >
        {/* Live Preview Mode Sticky Admin Topbar */}
        {isAdminOpen && activeTab === 'live_preview' && (
          <LivePreviewTopBar
            onBackToDashboard={() => setActiveTab('overview')}
            onCloseAdmin={() => {
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') {
                window.history.pushState(null, '', window.location.pathname);
              }
            }}
          />
        )}
      {/* 1. Header (Top Header Section: Logo, Central Search Bar, Actions) */}
      <SiteHeader
        siteData={currentSiteData}
        theme={activeTheme}
        language={language}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        products={products}
        onAddToCart={handleAddToCart}
        onOpenCart={() => setCartOpen(true)}
        onOpenBooking={() => setBookingOpen(true)}
        onOpenTracker={() => setTrackerOpen(true)}
        onToggleLanguage={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
        onOpenAdmin={() => setIsSecretModalOpen(true)}
        onToggleTheme={handleToggleTheme}
      />

      {/* 2. Main Product Category Navigation Bar (প্রধান ক্যাটাগরি মেনুবার) */}
      <CategoryNavBar
        categories={storeSettings.categoryNavItems || DEFAULT_CATEGORY_NAV_ITEMS}
        activeCategory={activeCategoryKey}
        onSelectCategory={(catKey) => {
          setActiveCategoryKey(catKey);
          if (catKey === 'dress' || catKey === 'clothing' || catKey === 'panjabi' || catKey === 'saree') {
            setActiveCategoryTab('clothing');
            const el = document.getElementById('clothing') || document.getElementById('products');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setActiveCategoryTab('spices');
            const el = document.getElementById('products') || document.getElementById('spices');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        language={language}
        theme={activeTheme}
      />

      {/* 2. Hero Section */}
      <HeroSection
        siteData={{
          ...currentSiteData,
          heroImage: activeCategoryTab === 'clothing' && currentSiteData.clothingImage 
            ? currentSiteData.clothingImage 
            : currentSiteData.heroImage
        }}
        theme={activeTheme}
        language={language}
        onOpenBooking={() => setBookingOpen(true)}
        onOpenCart={() => setCartOpen(true)}
      />

      {/* 3. About & Metrics */}
      <AboutSection
        siteData={currentSiteData}
        theme={activeTheme}
        language={language}
      />

      {/* 4. Services Section */}
      <ServicesSection
        siteData={currentSiteData}
        theme={activeTheme}
        language={language}
      />

      {/* 5. Combined Tabbed Product Showcase (Product listings remain here at the bottom) */}
      <div id="products-list-showcase">
        {activeCategoryTab === 'spices' ? (
          <SpicesSection
            products={products}
            selectedCategory={activeCategoryKey}
            titleBn={storeSettings.spicesTitleBn}
            descBn={storeSettings.spicesDescBn}
            theme={activeTheme}
            language={language}
            onAddToCart={handleAddToCart}
            onExpressOrder={handleOpenExpressOrder}
          />
        ) : (
          <ClothingSection
            products={products}
            selectedCategory={activeCategoryKey}
            titleBn={storeSettings.clothingTitleBn}
            descBn={storeSettings.clothingDescBn}
            theme={activeTheme}
            language={language}
            onAddToCart={handleAddToCart}
            onExpressOrder={handleOpenExpressOrder}
          />
        )}
      </div>

      {/* 6. Portfolio (if applicable) */}
      {currentSiteData.portfolio && currentSiteData.portfolio.length > 0 && (
        <PortfolioSection
          portfolio={currentSiteData.portfolio}
          titleBn={currentSiteData.portfolioSectionTitleBn}
          titleEn={currentSiteData.portfolioSectionTitleEn}
          theme={activeTheme}
          language={language}
        />
      )}

      {/* 7. Pricing (if applicable) */}
      {currentSiteData.pricing && currentSiteData.pricing.length > 0 && (
        <PricingSection
          pricing={currentSiteData.pricing}
          titleBn={currentSiteData.pricingSectionTitleBn}
          titleEn={currentSiteData.pricingSectionTitleEn}
          theme={activeTheme}
          language={language}
        />
      )}

      {/* 8. Testimonials / Reviews */}
      <TestimonialsSection
        testimonials={testimonials}
        titleBn={currentSiteData.testimonialsSectionTitleBn}
        titleEn={currentSiteData.testimonialsSectionTitleEn}
        theme={activeTheme}
        language={language}
        onWriteReview={() => setIsReviewModalOpen(true)}
      />

      {/* 9. FAQ Accordion */}
      <FaqSection
        faqs={currentSiteData.faqs}
        titleBn={currentSiteData.faqSectionTitleBn}
        titleEn={currentSiteData.faqSectionTitleEn}
        descBn={currentSiteData.faqSectionDescBn}
        descEn={currentSiteData.faqSectionDescEn}
        theme={activeTheme}
        language={language}
      />

      {/* 11. Interactive Lead Capture, Contact & Review Submission */}
      <ContactSection
        siteData={currentSiteData}
        theme={activeTheme}
        language={language}
        onSubmitMessage={handleNewSubmission}
        onAddReview={handleAddReview}
      />

      {/* 11. Quiet Footer */}
      <SiteFooter
        siteData={currentSiteData}
        theme={activeTheme}
        language={language}
        onOpenAdmin={() => setIsSecretModalOpen(true)}
      />

      {/* Secret Code Access Modal */}
      <SecretAccessModal
        isOpen={isSecretModalOpen}
        onClose={() => setIsSecretModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthenticated(true);
          setIsAdminOpen(true);
        }}
        validCode={secretCode}
      />

      {/* Shopping Bag Drawer (For E-commerce) */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        theme={activeTheme}
        language={language}
        settings={storeSettings}
        onCheckoutComplete={handleNewSubmission}
      />

      {/* Table Booking Modal (For Restaurant) */}
      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        theme={activeTheme}
        language={language}
        onBookingComplete={handleNewSubmission}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={trackerOpen}
        onClose={() => setTrackerOpen(false)}
        orders={orders}
        language={language}
        theme={activeTheme}
        initialQuery={initialTrackQuery}
      />

      {/* 1-Click Express Checkout Modal */}
      <ExpressOrderModal
        isOpen={isExpressModalOpen}
        onClose={() => setIsExpressModalOpen(false)}
        product={expressProduct}
        settings={storeSettings}
        onSubmitOrder={handleNewSubmission}
        language={language}
        theme={activeTheme}
      />

      {/* Instant Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setInvoiceOrder(null);
        }}
        order={invoiceOrder}
        settings={storeSettings}
        language={language}
        theme={activeTheme}
      />

      {/* Product Review Submission Modal */}
      <ProductReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        products={products}
        onSubmitReview={handleAddReview}
        language={language}
      />

      {/* Interactive Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
      </div>

      {/* Visual Quick Editor Modal (opens when clicking any edit icon in Live Preview) */}
      <VisualQuickEditConsumer
        onSave={handleQuickEditSave}
        onNavigateToAdminTab={(tab) => {
          setActiveTab(tab);
        }}
        products={products}
      />
    </VisualEditorProvider>
  );
}
