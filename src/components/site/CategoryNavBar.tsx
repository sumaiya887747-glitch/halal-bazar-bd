import React from 'react';
import { CategoryNavItem } from '../../types/admin';
import { ColorTheme, Language } from '../../types/website';
import { ChevronRight } from 'lucide-react';
import { EditTrigger } from '../editor/EditTrigger';

export const DEFAULT_CATEGORY_NAV_ITEMS: CategoryNavItem[] = [
  { id: 'cat-all', labelBn: 'সব ড্রাই ফ্রুটস ও নাড়ু', labelEn: 'All Dry Fruits & Naru', categoryKey: 'all', icon: '🥜' },
  { id: 'cat-nuts', labelBn: 'প্রিমিয়াম বাদাম', labelEn: 'Premium Nuts', categoryKey: 'nuts' },
  { id: 'cat-naru', labelBn: 'ঐতিহ্যবাহী নাড়ু ও মিষ্টি', labelEn: 'Traditional Naru & Sweets', categoryKey: 'naru', icon: '🥥', badge: 'স্পেশাল' },
  { id: 'cat-dates', labelBn: 'খেজুর ও আঞ্জির', labelEn: 'Dates & Figs', categoryKey: 'dates' },
  { id: 'cat-raisins', labelBn: 'কিসমিস ও বেরি', labelEn: 'Raisins & Berries', categoryKey: 'raisins' },
  { id: 'cat-mix', labelBn: 'মিক্সড ড্রাই ফ্রুটস', labelEn: 'Mixed Dry Fruits', categoryKey: 'mix' },
  { id: 'cat-dryfruits', labelBn: 'ড্রাই ফ্রুটস', labelEn: 'Dry Fruits', categoryKey: 'dryfruits' },
  { id: 'cat-dress', labelBn: 'পোশাক কালেকশন', labelEn: 'Apparel Collection', categoryKey: 'dress', icon: '👗', badge: 'হট' },
];

interface CategoryNavBarProps {
  categories?: CategoryNavItem[];
  activeCategory?: string;
  onSelectCategory?: (categoryKey: string) => void;
  language: Language;
  theme: ColorTheme;
}

export const CategoryNavBar: React.FC<CategoryNavBarProps> = ({
  categories = DEFAULT_CATEGORY_NAV_ITEMS,
  activeCategory = 'all',
  onSelectCategory,
  language,
  theme,
}) => {
  const isBn = language === 'bn';
  const navItems = categories && categories.length > 0 ? categories : DEFAULT_CATEGORY_NAV_ITEMS;

  const handleCategoryClick = (cat: CategoryNavItem) => {
    if (onSelectCategory) {
      onSelectCategory(cat.categoryKey);
    }

    // Scroll to products or clothing section
    const targetSection = cat.categoryKey === 'dress' || cat.categoryKey === 'clothing' || cat.categoryKey === 'panjabi' || cat.categoryKey === 'saree'
      ? (document.getElementById('clothing') || document.getElementById('products'))
      : (document.getElementById('products') || document.getElementById('spices'));

    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div 
      className="border-b sticky top-[60px] sm:top-[98px] z-30 transition-all bg-white/80 backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]"
      style={{
        borderColor: theme.borderLight || '#e2e8f0',
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-2.5 sm:py-3.5 no-scrollbar scroll-smooth">
          {/* Category Pills List matching exact image design */}
          <div className="flex items-center gap-2 shrink-0">
            {navItems.map((cat) => {
              const isActive = activeCategory === cat.categoryKey;
              return (
                <button
                  key={cat.id || cat.categoryKey}
                  type="button"
                  onClick={() => handleCategoryClick(cat)}
                  className={`group relative flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-[13px] font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-white font-extrabold shadow-lg scale-102 ring-2 ring-white/80'
                      : 'bg-white/90 hover:bg-white text-neutral-700 hover:text-neutral-900 border border-neutral-200/80 shadow-2xs hover:shadow-xs'
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: theme.primary,
                          borderColor: theme.primary,
                          boxShadow: `0 6px 20px ${theme.primary}45`,
                        }
                      : undefined
                  }
                >
                  {cat.icon && (
                    <span className="text-sm sm:text-base leading-none transition-transform group-hover:scale-110">
                      {cat.icon}
                    </span>
                  )}
                  <span>{isBn ? cat.labelBn : (cat.labelEn || cat.labelBn)}</span>
                  {cat.badge && (
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                        isActive
                          ? 'bg-amber-400 text-neutral-950'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
            <EditTrigger 
              target={{ 
                id: 'categories', 
                field: 'categoryNavItems', 
                type: 'text', 
                title: 'ক্যাটাগরি মেনু ও লিংক এডিট', 
                label: 'ক্যাটাগরি সেটিংস', 
                value: 'হেডার ও ফুটার ম্যানেজার থেকে ক্যাটাগরি কনফিগার করুন', 
                adminTabShortcut: 'settings_header_footer' 
              }} 
              variant="button" 
              label="ক্যাটাগরি এডিট" 
              className="!text-[11px] !py-1 !px-2.5 shrink-0"
            />
          </div>

          {/* Quick Wholesale Link on Right */}
          <div className="hidden xl:flex items-center shrink-0 ml-2">
            <a
              href="#contact"
              className="flex items-center gap-1 px-3.5 py-1.8 rounded-xl text-xs font-bold transition-colors shadow-2xs border"
              style={{
                backgroundColor: theme.accentBg,
                borderColor: theme.borderLight,
                color: theme.primary,
              }}
            >
              <span>📞 পাইকারি ও বাল্ক অর্ডার</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: theme.primary }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
