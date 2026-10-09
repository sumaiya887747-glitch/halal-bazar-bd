import React, { useState } from 'react';
import { Plus, Check, Star, Search, Sparkles, Shirt, Zap } from 'lucide-react';
import { ColorTheme, Language, ProductItem } from '../../types/website';
import { isSpiceItem } from './SpicesSection';
import { EditTrigger } from '../editor/EditTrigger';

export const isClothingItem = (p: ProductItem): boolean => {
  return !isSpiceItem(p);
};

interface ClothingSectionProps {
  products: ProductItem[];
  selectedCategory?: string;
  titleBn?: string;
  descBn?: string;
  theme: ColorTheme;
  language: Language;
  onAddToCart?: (product: ProductItem) => void;
  onExpressOrder?: (product: ProductItem) => void;
}

export const ClothingSection: React.FC<ClothingSectionProps> = ({
  products,
  selectedCategory: selectedCategoryProp,
  titleBn = '👗 প্রিমিয়াম পোশাক ও ট্রেন্ডি ফ্যাশন গ্যালারি',
  descBn = 'উৎসব ও দৈনন্দিন ব্যবহারের জন্য আমাদের নিজস্ব তাঁতি ও কারিগরদের বোনা রয়েল কটন এমব্রয়ডারি পাঞ্জাবি, ঐতিহ্যবাহী ঢাকাই জামদানি শাড়ি, বুটিক থ্রি-পিস, পোলো টি-শার্ট ও ইমপোর্টেড দুবাই বোরকা-হিজাব সেট।',
  theme,
  language,
  onAddToCart,
  onExpressOrder,
}) => {
  const clothingFeatures: any[] = [];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, number>>({});

  const isBn = language === 'bn';

  // Active category filter from parent prop or internal state
  const activeCategoryFilter = selectedCategoryProp || selectedCategory || 'all';

  // Filter ONLY clothing/apparel products
  const clothingProducts = products.filter(isClothingItem);

  const filteredClothing = clothingProducts.filter((p) => {
    const catKey = activeCategoryFilter.toLowerCase();
    const text = `${p.categoryBn} ${p.categoryEn || ''} ${p.nameBn} ${p.nameEn || ''}`.toLowerCase();

    let categoryMatch = true;

    if (catKey === 'all' || catKey === 'cat-all' || catKey === 'dress' || catKey === 'clothing') {
      categoryMatch = true;
    } else if (catKey === 'panjabi' || catKey.includes('পাঞ্জাবি')) {
      categoryMatch = text.includes('পাঞ্জাবি') || text.includes('panjabi') || text.includes('কুর্তা');
    } else if (catKey === 'saree' || catKey.includes('শাড়ি') || catKey.includes('থ্রি-পিস') || catKey.includes('৩-পিস')) {
      categoryMatch = text.includes('শাড়ি') || text.includes('saree') || text.includes('থ্রি-পিস') || text.includes('তিন-পিস') || text.includes('তিন পিস') || text.includes('জামদানি') || text.includes('লেহেঙ্গা');
    } else {
      categoryMatch =
        p.categoryBn === activeCategoryFilter ||
        p.categoryEn === activeCategoryFilter ||
        p.categoryBn.toLowerCase().includes(catKey) ||
        p.categoryEn?.toLowerCase().includes(catKey) ||
        text.includes(catKey);
    }

    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      p.nameBn.toLowerCase().includes(query) ||
      p.nameEn.toLowerCase().includes(query) ||
      p.descBn.toLowerCase().includes(query) ||
      p.descEn.toLowerCase().includes(query) ||
      p.categoryBn.toLowerCase().includes(query) ||
      p.categoryEn.toLowerCase().includes(query);

    return categoryMatch && searchMatch;
  });

  const handleAdd = (product: ProductItem) => {
    if (onAddToCart) {
      const sizeIdx = selectedSizes[product.id] || 0;
      const sizeOption = product.weightOptions?.[sizeIdx];

      const customProduct: ProductItem = {
        ...product,
        nameBn: sizeOption
          ? `${product.nameBn} (${sizeOption.label})`
          : product.nameBn,
        nameEn: sizeOption
          ? `${product.nameEn} (${sizeOption.label})`
          : product.nameEn,
        price: sizeOption ? sizeOption.price : product.price,
      };

      onAddToCart(customProduct);
      setAddedIds((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => {
        setAddedIds((prev) => ({ ...prev, [product.id]: false }));
      }, 1500);
    }
  };

  return (
    <section 
      id="clothing" 
      className="py-16 md:py-24 border-b transition-colors duration-300 relative"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div id="fashion" className="absolute -top-24 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header & Dedicated Description */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            {/* Dynamic Feature Points */}
            {clothingFeatures && clothingFeatures.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {clothingFeatures.map((feature: any, idx: number) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full inline-flex items-center gap-1.5 shadow-2xs border"
                    style={{
                      backgroundColor: theme.accentBg,
                      color: theme.primary,
                      borderColor: theme.borderLight,
                    }}
                  >
                    <Sparkles className="w-3 h-3" style={{ color: theme.primary }} />
                    {feature.title}
                  </span>
                ))}
              </div>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-neutral-950 flex items-center gap-2">
              <span>{isBn ? titleBn : titleBn}</span>
              <EditTrigger 
                target={{ 
                  id: 'clothingTitle', 
                  field: 'clothingTitleBn', 
                  type: 'text', 
                  title: 'পোশাক সেকশন শিরোনাম এডিট', 
                  label: 'শিরোনাম', 
                  value: titleBn || '👗 প্রিমিয়াম পোশাক ও ট্রেন্ডি ফ্যাশন গ্যালারি', 
                  adminTabShortcut: 'settings_sections' 
                }} 
              />
            </h2>
            <div className="flex items-start gap-2 mt-2.5">
              <p className="text-sm sm:text-base text-neutral-700 leading-relaxed font-medium">
                {isBn ? descBn : descBn}
              </p>
              <EditTrigger 
                target={{ 
                  id: 'clothingDesc', 
                  field: 'clothingDescBn', 
                  type: 'textarea', 
                  title: 'পোশাক সেকশন বিবরণ এডিট', 
                  label: 'বিবরণ', 
                  value: descBn || 'উৎসব ও দৈনন্দিন ব্যবহারের জন্য আমাদের নিজস্ব তাঁতি...', 
                  adminTabShortcut: 'settings_sections' 
                }} 
              />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredClothing.length === 0 ? (
          <div 
            className="text-center py-16 px-4 rounded-2xl border border-dashed bg-white/80"
            style={{ borderColor: theme.borderLight }}
          >
            <Shirt className="w-8 h-8 mx-auto mb-2" style={{ color: theme.primary }} />
            <p className="text-sm font-bold text-neutral-800">
              {isBn ? 'আপনার অনুসন্ধানের সাথে কোনো পোশাক মেলেনি' : 'No clothing items match your search'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isBn ? 'অন্য নাম বা সাইজ দিয়ে খুঁজুন বা ফিল্টার রিসেট করুন।' : 'Try searching for panjabi, saree, polo, or abaya.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl text-white text-xs font-bold hover:opacity-90 transition-opacity shadow-xs cursor-pointer"
              style={{ backgroundColor: theme.primary }}
            >
              {isBn ? 'সব পোশাক দেখুন' : 'Reset Clothing Filter'}
            </button>
          </div>
        ) : (
          /* Clothing Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClothing.map((product) => {
              const isAdded = !!addedIds[product.id];
              const sizeIdx = selectedSizes[product.id] || 0;
              const currentSizeOption = product.weightOptions?.[sizeIdx];
              const displayPrice = currentSizeOption
                ? currentSizeOption.price
                : product.price;

              return (
                <div
                  key={product.id}
                  className={`group flex flex-col justify-between p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden card-hover-effect ${
                    product.inStock === false
                      ? 'border-neutral-200/60 bg-neutral-50/80 shadow-2xs opacity-85'
                      : 'border-neutral-200/70 bg-white hover:border-emerald-600/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_35px_-8px_rgba(6,78,59,0.12)]'
                  }`}
                >
                  <div>
                    {/* Apparel Image Thumbnail */}
                    {product.image && (
                      <div 
                        className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4 border border-neutral-100/80 shadow-xs bg-neutral-100"
                      >
                        <img
                          src={product.image}
                          alt={product.nameBn}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                            product.inStock === false
                              ? 'grayscale-40 opacity-80'
                              : 'group-hover:scale-108'
                          }`}
                        />
                        {/* Product Edit Trigger Badge on Image */}
                        <EditTrigger 
                          target={{ 
                            id: `prod-img-${product.id}`, 
                            field: 'product', 
                            type: 'product', 
                            productId: product.id, 
                            title: `পোশাক এডিট করুন: ${product.nameBn}`, 
                            label: 'পোশাক', 
                            value: product, 
                            adminTabShortcut: 'products' 
                          }} 
                          variant="image" 
                          label="পণ্য এডিট" 
                          className="!top-2 !left-2 !z-30"
                        />

                        {/* Stock Out Overlay Badge */}
                        {product.inStock === false ? (
                          <div className="absolute top-2.5 right-2.5 bg-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 tracking-wider uppercase z-20">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}</span>
                          </div>
                        ) : product.badgeBn ? (
                          <div className="absolute top-2.5 right-2.5 bg-neutral-950/85 backdrop-blur-md text-amber-300 text-[10.5px] font-black px-2.5 py-0.5 rounded-full shadow-xs border border-amber-400/30 z-20">
                            {isBn ? product.badgeBn : product.badgeEn}
                          </div>
                        ) : null}

                        {product.originalPrice && displayPrice < product.originalPrice && product.inStock !== false && (
                          <div 
                            className="absolute bottom-2.5 right-2.5 text-white text-[10.5px] font-black px-2.5 py-0.5 rounded-full shadow-md z-20"
                            style={{ backgroundColor: theme.primary }}
                          >
                            {isBn ? `৳${product.originalPrice - displayPrice} ছাড়` : 'SAVE'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span 
                        className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border"
                        style={{
                          backgroundColor: theme.accentBg,
                          color: theme.primary,
                          borderColor: theme.borderLight,
                        }}
                      >
                        {isBn ? product.categoryBn : product.categoryEn}
                      </span>
                      <div className="flex items-center gap-1 font-mono tabular-nums bg-neutral-50 px-2 py-0.5 rounded-full border border-neutral-200/60">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="font-black text-[11px] text-neutral-800">{product.rating}</span>
                        <span className="text-neutral-400 text-[9.5px]">({product.reviewsCount})</span>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <h3 className="font-extrabold text-[15px] sm:text-base text-neutral-900 group-hover:text-emerald-800 transition-colors leading-snug">
                          {isBn ? product.nameBn : product.nameEn}
                        </h3>
                        <EditTrigger 
                          target={{ 
                            id: `prod-${product.id}`, 
                            field: 'product', 
                            type: 'product', 
                            productId: product.id, 
                            title: `পোশাক এডিট করুন: ${product.nameBn}`, 
                            label: 'পোশাক', 
                            value: product, 
                            adminTabShortcut: 'products' 
                          }} 
                          variant="icon-only" 
                          className="!w-5 !h-5"
                        />
                      </div>
                      {product.inStock === false && (
                        <span className="shrink-0 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[9.5px] font-bold border border-rose-300">
                          {product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                      {isBn ? product.descBn : product.descEn}
                    </p>

                    {/* Size & Fit Variant Selector */}
                    {product.weightOptions && product.weightOptions.length > 0 && (
                      <div 
                        className="mt-3.5 pt-3 border-t border-neutral-100 space-y-1.5"
                      >
                        <span 
                          className="text-[10px] font-black uppercase tracking-wider block"
                          style={{ color: theme.primary }}
                        >
                          {isBn ? 'সাইজ / ভ্যারিয়েন্ট বাছাই করুন:' : 'Select Size/Fit Variant:'}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {product.weightOptions.map((opt, idx) => {
                            const isSelected = sizeIdx === idx;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) => ({
                                    ...prev,
                                    [product.id]: idx,
                                  }))
                                }
                                className={`px-2.5 py-1 text-[11px] rounded-xl border font-bold transition-all cursor-pointer ${
                                  isSelected
                                    ? 'shadow-xs scale-102 ring-1 ring-emerald-700/30'
                                    : 'hover:border-neutral-300'
                                }`}
                                style={
                                  isSelected
                                    ? {
                                        backgroundColor: theme.primary,
                                        borderColor: theme.primary,
                                        color: '#ffffff',
                                      }
                                    : {
                                        backgroundColor: '#f8fafc',
                                        borderColor: '#e2e8f0',
                                        color: '#334155',
                                      }
                                }
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Price & Action Buttons */}
                  <div 
                    className="mt-5 pt-3.5 border-t border-neutral-100 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                          {isBn ? 'অফার মূল্য' : 'Offer Price'}
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-black font-mono tabular-nums tracking-tight" style={{ color: theme.primary }}>
                            ৳{displayPrice.toLocaleString()}
                          </span>
                          {product.originalPrice && displayPrice < product.originalPrice && (
                            <span className="text-xs text-neutral-400 line-through font-mono">
                              ৳{product.originalPrice.toLocaleString()}
                            </span>
                          )}
                          <EditTrigger 
                            target={{ 
                              id: `price-${product.id}`, 
                              field: 'product', 
                              type: 'product', 
                              productId: product.id, 
                              title: `মূল্য এডিট: ${product.nameBn}`, 
                              label: 'মূল্য', 
                              value: product, 
                              adminTabShortcut: 'products' 
                            }} 
                            variant="icon-only" 
                            className="!w-5 !h-5"
                          />
                        </div>
                      </div>

                      {product.inStock !== false && onExpressOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            const sizeOption = product.weightOptions?.[sizeIdx];
                            const customProduct: ProductItem = {
                              ...product,
                              nameBn: sizeOption ? `${product.nameBn} (${sizeOption.label})` : product.nameBn,
                              nameEn: sizeOption ? `${product.nameEn} (${sizeOption.label})` : product.nameEn,
                              price: displayPrice,
                            };
                            onExpressOrder(customProduct);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-all active:scale-95 shadow-sm hover:shadow-md cursor-pointer hover:brightness-105"
                          style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 4px 12px ${theme.accent}35`,
                          }}
                        >
                          <Zap className="w-3.5 h-3.5 fill-white" />
                          <span>{isBn ? '১-ক্লিক অর্ডার' : 'Express Order'}</span>
                        </button>
                      )}
                    </div>

                    {product.inStock === false ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-neutral-100 text-neutral-400 cursor-not-allowed border border-neutral-200"
                        title={isBn ? 'এই পণ্যটি বর্তমানে স্টক আউট' : 'This product is out of stock'}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAdd(product)}
                        className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:shadow-md active:scale-95 ${
                          isAdded
                            ? 'bg-emerald-700 text-white'
                            : 'text-white hover:brightness-105'
                        }`}
                        style={!isAdded ? { 
                          backgroundColor: theme.primary,
                          boxShadow: `0 4px 14px ${theme.primary}35`
                        } : undefined}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ব্যাগে যোগ হয়েছে' : 'Added!'}</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>{isBn ? 'কার্টে রাখুন' : 'Add to Cart'}</span>
                          </>
                        )}
                      </button>
                    )}
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
