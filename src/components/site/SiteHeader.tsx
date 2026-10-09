import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Calendar, Menu, X, Search, Package, Plus, Check, Truck, Sparkles, Palette } from 'lucide-react';
import { ColorTheme, Language, ProductItem, WebsiteData } from '../../types/website';
import { EditTrigger } from '../editor/EditTrigger';

const cleanPhoneForWhatsapp = (phoneStr: string): string => {
  if (!phoneStr) return '8801329571899';
  const firstPhone = phoneStr.split(/[,/|]/)[0].trim();
  const cleaned = firstPhone.replace(/\D/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return '88' + cleaned;
  }
  if (cleaned.length === 10 && /^[1-9]/.test(cleaned)) {
    return '880' + cleaned;
  }
  return cleaned || '8801329571899';
};

interface SiteHeaderProps {
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
  cartCount?: number;
  products?: ProductItem[];
  onAddToCart?: (product: ProductItem) => void;
  onOpenCart?: () => void;
  onOpenBooking?: () => void;
  onOpenTracker?: () => void;
  onToggleLanguage?: () => void;
  onOpenAdmin?: () => void;
  onToggleTheme?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  siteData,
  theme,
  language,
  cartCount = 0,
  products = [],
  onAddToCart,
  onOpenCart,
  onOpenBooking,
  onOpenTracker,
  onToggleLanguage,
  onOpenAdmin,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isBn = language === 'bn';
  const siteName = isBn ? siteData.nameBn : siteData.nameEn;
  const isShop = siteData.id === 'ecommerce' || siteData.id === 'spices';
  const isRestaurant = siteData.id === 'restaurant';

  const ctaLabel = isRestaurant
    ? isBn ? 'টেবিল বুকিং' : 'Reserve Table'
    : isShop
    ? isBn ? 'অর্ডার করুন' : 'Order Now'
    : isBn ? siteData.heroCtaPrimaryBn : siteData.heroCtaPrimaryEn;

  // Secret admin access on 3 rapid clicks on logo
  const handleSecretLogoClick = (e: React.MouseEvent) => {
    const nextCount = logoClickCount + 1;
    if (nextCount >= 3) {
      setLogoClickCount(0);
      onOpenAdmin?.();
    } else {
      setLogoClickCount(nextCount);
      setTimeout(() => setLogoClickCount(0), 1200);
    }
  };

  const handleActionClick = () => {
    if (isRestaurant && onOpenBooking) {
      onOpenBooking();
    } else if (isShop && onOpenCart) {
      onOpenCart();
    } else {
      const contactEl = document.getElementById('contact');
      if (contactEl) {
        contactEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId) || (targetId === 'clothing' ? document.getElementById('products') : null);
      if (targetEl) {
        e.preventDefault();
        window.history.pushState(null, '', href);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
        targetEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const searchResults = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) =>
      p.nameBn.toLowerCase().includes(q) ||
      p.nameEn.toLowerCase().includes(q) ||
      p.categoryBn.toLowerCase().includes(q) ||
      p.categoryEn.toLowerCase().includes(q) ||
      p.descBn.toLowerCase().includes(q) ||
      p.descEn.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [products, searchQuery]);

  const handleAddSearchItem = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product);
      setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  const handleSelectSearchProduct = (product: ProductItem) => {
    setIsSearchOpen(false);
    const targetSection = document.getElementById('products') || document.getElementById('spices') || document.getElementById('clothing');
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderStyledStoreName = (name: string) => {
    const bdRegex = /^(.*?\bhalal\s+bazar|\b.+?)\s*(bd)$/i;
    const match = name.match(bdRegex);

    if (match) {
      const mainPart = match[1].trim();
      const bdPart = match[2].toUpperCase();

      return (
        <span className="inline-flex items-baseline gap-1 font-black tracking-tighter leading-[0.9] font-sans group-hover:opacity-85 transition-opacity">
          <span className="text-lg sm:text-2xl font-black text-amber-600 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xs">
            {mainPart}
          </span>
          <span className="text-xl sm:text-3xl font-black ml-0.5 tracking-tight" style={{ color: theme.primary || '#065f46' }}>
            {bdPart}
          </span>
        </span>
      );
    }

    if (name.toUpperCase().endsWith('BD')) {
      const mainPart = name.substring(0, name.length - 2).trim();
      return (
        <span className="inline-flex items-baseline gap-1 font-black tracking-tighter leading-[0.9] font-sans group-hover:opacity-85 transition-opacity">
          <span className="text-lg sm:text-2xl font-black text-amber-600 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-2xs">
            {mainPart}
          </span>
          <span className="text-xl sm:text-3xl font-black ml-0.5 tracking-tight" style={{ color: theme.primary || '#065f46' }}>
            BD
          </span>
        </span>
      );
    }

    return (
      <span className="text-lg sm:text-2xl font-black tracking-tighter text-amber-600 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 bg-clip-text text-transparent block leading-[0.9] font-sans group-hover:opacity-85 transition-opacity">
        {name}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-2xl border-b border-neutral-200/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] transition-all duration-300">
      {/* Top Announcement Bar */}
      <div 
        className="text-white text-[11px] py-1.5 px-4 font-black border-b border-white/10 hidden sm:block shadow-xs transition-colors duration-300 tracking-wide"
        style={{
          background: `linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryHover} 50%, ${theme.primary} 100%)`
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center gap-1.5 shrink-0 bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-950 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight shadow-xs">
              <Sparkles className="w-3 h-3 fill-neutral-950" />
              <span>Special Offer</span>
            </div>
            <span className="truncate text-white font-medium tracking-normal text-[11.5px]">
              {siteData.announcementText || (isBn
                ? '✨ ১০০% প্রিমিয়াম ড্রাই ফ্রুটস ও পোশাক কালেকশন — সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি'
                : '✨ 100% Pure Agro Pantry & Premium Apparel Collection - Fast Cash on Delivery')}
            </span>
            <EditTrigger 
              target={{ 
                id: 'announcement', 
                field: 'announcementText', 
                type: 'text', 
                title: 'ঘোষণা বার এডিট করুন', 
                label: 'ঘোষণা টেক্সট', 
                value: siteData.announcementText || (isBn ? '✨ ১০০% প্রিমিয়াম ড্রাই ফ্রুটস ও পোশাক কালেকশন — সারা দেশে দ্রুত ক্যাশ অন ডেলিভারি' : '✨ 100% Pure Agro Pantry & Premium Apparel Collection - Fast Cash on Delivery'), 
                adminTabShortcut: 'settings_header_footer' 
              }} 
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] shrink-0 font-bold">
            <div className="flex items-center gap-1.5 text-amber-200 bg-white/10 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Hotline: {siteData.contactPhone || '01711-889900'}</span>
              <EditTrigger 
                target={{ 
                  id: 'phone', 
                  field: 'phone', 
                  type: 'text', 
                  title: 'হটলাইন নম্বর পরিবর্তন করুন', 
                  label: 'হটলাইন নম্বর', 
                  value: siteData.contactPhone || '01711-889900', 
                  adminTabShortcut: 'settings_general' 
                }} 
                variant="icon-only" 
                className="!w-5 !h-5 !bg-amber-400/80"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-20 sm:h-22 flex items-center justify-between gap-4 sm:gap-8">
        {/* 1. Logo (বাম পাশে ব্র্যান্ডের লোগো ও নাম) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 relative">
          <div className="relative">
            <button
              type="button"
              onClick={handleSecretLogoClick}
              className="w-12 h-12 sm:w-13 sm:h-13 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/20 shrink-0 group ring-2 ring-black/5"
              style={{ 
                backgroundColor: siteData.logoImage ? 'transparent' : theme.primary,
                boxShadow: `0 8px 20px ${theme.primary}30`,
              }}
              title={siteName}
            >
              {siteData.logoImage ? (
                <img src={siteData.logoImage} alt={siteName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-amber-400 text-xl sm:text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] group-hover:scale-110 transition-transform">{siteData.logoLetter || siteName.charAt(0)}</span>
              )}
            </button>
            <EditTrigger 
              target={{ 
                id: 'logoImage', 
                field: 'logoImage', 
                type: 'image', 
                title: 'লোগো ছবি পরিবর্তন করুন', 
                label: 'লোগো ইমেজ', 
                value: siteData.logoImage || '', 
                adminTabShortcut: 'settings_general' 
              }} 
              variant="image" 
              className="!-top-1.5 !-right-1.5 !p-1 !rounded-lg"
            />
          </div>
          <div className="block">
            <div className="flex items-center gap-1.5">
              <a href="#" className="block group">
                {renderStyledStoreName(siteName)}
              </a>
              <EditTrigger 
                target={{ 
                  id: 'storeName', 
                  field: 'storeName', 
                  type: 'text', 
                  title: 'স্টোরের নাম পরিবর্তন করুন', 
                  label: 'স্টোরের নাম', 
                  value: siteName, 
                  adminTabShortcut: 'settings_general' 
                }} 
              />
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: theme.primary }} />
              <span className="text-[10px] sm:text-[11px] font-black tracking-[0.12em] uppercase block text-neutral-600">
                {siteData.storeBadgeBn || (isBn ? 'প্রিমিয়াম স্টোর' : 'Premium Store')}
              </span>
              <EditTrigger 
                target={{ 
                  id: 'storeBadgeBn', 
                  field: 'storeBadgeBn', 
                  type: 'text', 
                  title: 'স্টোর ব্যাজ/সাব-টাইটেল এডিট করুন', 
                  label: 'স্টোর সাব-টাইটেল', 
                  value: siteData.storeBadgeBn || (isBn ? 'প্রিমিয়াম স্টোর' : 'Premium Store'), 
                  adminTabShortcut: 'settings_general' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* 2. Search Bar (একদম মাঝে একটি বড় সার্চ বক্স) */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden md:block">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors group-focus-within:text-emerald-700" style={{ color: theme.primary }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={isBn ? 'যেকোনো পণ্য, বাদাম, খেজুর বা পোশাক খুঁজুন...' : 'Search products, dry fruits, dates, apparel...'}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm font-medium rounded-2xl border border-neutral-200/90 bg-neutral-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700/60 transition-all shadow-inner placeholder:text-neutral-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Live Search Dropdown */}
          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden z-50 max-h-96 overflow-y-auto divide-y divide-neutral-100">
              <div className="p-2.5 bg-neutral-50 flex items-center justify-between text-xs text-neutral-500 font-bold border-b border-neutral-100">
                <span>অনুসন্ধান ফলাফল ({searchResults.length}টি পাওয়া গেছে)</span>
                <span className="text-[10px] text-neutral-400">Esc চেপে বন্ধ করুন</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-500">
                  <p className="font-semibold text-neutral-700">"{searchQuery}" এর জন্য কোনো পণ্য পাওয়া যায়নি</p>
                  <p className="text-[11px] mt-1 text-neutral-400">বানান সঠিক আছে কিনা দেখুন অথবা ভিন্ন শব্দ দিয়ে চেষ্টা করুন</p>
                </div>
              ) : (
                searchResults.map((item) => {
                  const isAdded = !!addedItemIds[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSearchProduct(item)}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-emerald-50/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative">
                          {item.image ? (
                            <img src={item.image} alt={item.nameBn} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-xs text-neutral-400">HB</div>
                          )}
                          {item.inStock === false && (
                            <div className="absolute inset-0 bg-rose-950/70 flex items-center justify-center">
                              <span className="text-[7.5px] font-black text-white px-1 py-0.5 rounded bg-rose-700">OUT</span>
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-neutral-900 truncate">
                              {isBn ? item.nameBn : item.nameEn}
                            </h4>
                            {item.inStock === false && (
                              <span className="shrink-0 px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 text-[9px] font-bold border border-rose-300">
                                {item.stockStatusText || 'স্টক আউট'}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-neutral-500 mt-0.5">
                            <span className="text-emerald-800 font-semibold">{item.categoryBn}</span>
                            <span>•</span>
                            <span className="font-bold text-neutral-900 font-mono">৳{item.price.toLocaleString()}</span>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <span className="line-through text-neutral-400 font-mono text-[10px]">
                                ৳{item.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Add Button in Search Item */}
                      {item.inStock !== false ? (
                        <button
                          type="button"
                          onClick={(e) => handleAddSearchItem(item, e)}
                          className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all shadow-2xs cursor-pointer ${
                            isAdded
                              ? 'bg-emerald-700 text-white'
                              : 'bg-neutral-900 hover:bg-emerald-800 text-white active:scale-95'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>যোগ হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>ব্যাগে নিন</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="shrink-0 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md">
                          স্টক শেষ
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* 3. Action Icons/Menu (ডান পাশে Track Order, FB, WhatsApp, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Track Order Button (অর্ডার ট্র্যাক) */}
          {onOpenTracker && (
            <button
              type="button"
              onClick={onOpenTracker}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300/90 font-bold text-xs shadow-2xs transition-all hover:scale-102 active:scale-95 cursor-pointer whitespace-nowrap"
              title={isBn ? 'আপনার অর্ডারের বর্তমান অবস্থা ট্র্যাক করুন' : 'Track Order Status'}
            >
              <Truck className="w-3.5 h-3.5 text-amber-800" />
              <span className="hidden sm:inline">{isBn ? 'অর্ডার ট্র্যাক' : 'Track Order'}</span>
            </button>
          )}

          {/* Facebook Page Button */}
          <a
            href={siteData.facebookUrl || "https://facebook.com/halalbazarbd"}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1877F2] text-white flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-2xs"
            title={isBn ? 'আমাদের ফেসবুক পেইজ' : 'Visit our Facebook Page'}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* WhatsApp Button */}
          <a
            href={`https://wa.me/${cleanPhoneForWhatsapp(siteData.whatsappNumber || siteData.contactPhone || '01711-889900')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#25D366] text-white flex items-center justify-center hover:scale-108 active:scale-95 transition-all shadow-2xs"
            title={isBn ? 'হোয়াটসঅ্যাপে সরাসরি চ্যাট করুন' : 'Chat on WhatsApp'}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>

          {/* Cart Icon (কার্ট বাটন) */}
          {isShop && onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
              title={isBn ? 'শপিং ব্যাগ দেখুন' : 'View Shopping Cart'}
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">{isBn ? 'ব্যাগ' : 'Cart'}</span>
              {cartCount > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-[11px] font-black text-white flex items-center justify-center tabular-nums ring-2 ring-white"
                  style={{ backgroundColor: theme.primary }}
                >
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 md:hidden border border-neutral-200"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (Phone screens) */}
      <div className="md:hidden px-3 pb-3">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: theme.primary }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={isBn ? 'পণ্য, বাদাম বা পোশাক খুঁজুন...' : 'Search items...'}
            className="w-full pl-9 pr-8 py-2 text-xs font-medium rounded-xl border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none transition-all"
            style={{
              outlineColor: theme.primary,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Search Dropdown */}
        {isSearchOpen && searchQuery.trim().length > 0 && (
          <div className="mt-1.5 bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-neutral-100">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-500">কোনো পণ্য মেলেনি</div>
            ) : (
              searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchProduct(item)}
                  className="p-2.5 flex items-center justify-between gap-2 hover:bg-emerald-50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={item.image || ''} alt={item.nameBn} className="w-9 h-9 rounded-lg object-cover border border-neutral-200 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-neutral-900 truncate">{item.nameBn}</p>
                      <p className="font-bold text-[11px] text-emerald-800 font-mono">৳{item.price}</p>
                    </div>
                  </div>
                  {item.inStock !== false ? (
                    <button
                      type="button"
                      onClick={(e) => handleAddSearchItem(item, e)}
                      className="px-2.5 py-1 rounded-md bg-neutral-900 text-white text-[10px] font-bold shrink-0"
                    >
                      + ব্যাগে
                    </button>
                  ) : (
                    <span className="text-[9.5px] text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded">স্টক শেষ</span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white px-4 py-3 space-y-2">
          {siteData.navItems.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={(e) => {
                setMobileMenuOpen(false);
                handleNavClick(e, item.href);
              }}
              className="block py-2 text-sm font-bold text-neutral-800 hover:text-emerald-800 transition-colors border-b border-neutral-100 last:border-none"
            >
              {isBn ? item.labelBn : item.labelEn}
            </a>
          ))}
        </div>
      )}
    </header>
  );
};
