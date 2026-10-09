import React, { useState, useEffect } from 'react';
import { Plus, Check, Star, Search, Sparkles, Zap } from 'lucide-react';
import { ColorTheme, Language, ProductItem } from '../../types/website';

interface ProductsSectionProps {
  products: ProductItem[];
  titleBn?: string;
  titleEn?: string;
  theme: ColorTheme;
  language: Language;
  onAddToCart?: (product: ProductItem) => void;
  onExpressOrder?: (product: ProductItem) => void;
}

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  products,
  titleBn = 'আমাদের জনপ্রিয় ড্রাই ফ্রুটস ও পোশাক কালেকশন',
  titleEn = 'Premium Dry Fruits & Fashion Collection',
  theme,
  language,
  onAddToCart,
  onExpressOrder,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});
  const [selectedWeights, setSelectedWeights] = useState<Record<string, number>>({}); // index of selected weight

  const isBn = language === 'bn';

  const isClothingProduct = (p: ProductItem) => {
    const text = `${p.categoryBn} ${p.categoryEn || ''} ${p.nameBn} ${p.nameEn}`.toLowerCase();
    return (
      text.includes('পোশাক') ||
      text.includes('পাঞ্জাবি') ||
      text.includes('শাড়ি') ||
      text.includes('থ্রি-পিস') ||
      text.includes('টি-শার্ট') ||
      text.includes('বোরকা') ||
      text.includes('হিজাব') ||
      text.includes('panjabi') ||
      text.includes('saree') ||
      text.includes('t-shirt') ||
      text.includes('abaya') ||
      text.includes('clothing') ||
      text.includes('apparel')
    );
  };

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#clothing' || hash === '#fashion') {
        setSelectedCategory('clothing_all');
        const el = document.getElementById('clothing') || document.getElementById('products');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (hash === '#products') {
        setSelectedCategory('all');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Extract distinct categories
  const distinctCats = Array.from(new Set(products.map((p) => (isBn ? p.categoryBn : p.categoryEn))));
  const categories = [
    'all',
    'clothing_all',
    'spices_all',
    ...distinctCats,
  ];

  const filteredProducts = products.filter((p) => {
    const categoryMatch =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'clothing_all'
        ? isClothingProduct(p)
        : selectedCategory === 'spices_all'
        ? !isClothingProduct(p)
        : (isBn ? p.categoryBn : p.categoryEn) === selectedCategory;

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
      // Create product with chosen weight and price
      const weightIdx = selectedWeights[product.id] || 0;
      const weightOption = product.weightOptions?.[weightIdx];

      const customProduct: ProductItem = {
        ...product,
        nameBn: weightOption
          ? `${product.nameBn} (${weightOption.label})`
          : product.nameBn,
        nameEn: weightOption
          ? `${product.nameEn} (${weightOption.label})`
          : product.nameEn,
        price: weightOption ? weightOption.price : product.price,
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
      id="products" 
      className="py-16 md:py-24 border-b transition-colors duration-300 relative"
      style={{
        backgroundColor: theme.bgLight,
        borderColor: theme.borderLight,
      }}
    >
      <div id="clothing" className="absolute -top-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="max-w-2xl">
            <span 
              className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block mb-2 border"
              style={{
                backgroundColor: theme.accentBg,
                color: theme.primary,
                borderColor: theme.borderLight,
              }}
            >
              {isBn ? '১০০% খাঁটি ও প্রিমিয়াম কোয়ালিটি' : '100% Pure & Premium Quality'}
            </span>
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"
              style={{ textWrap: 'balance' }}
            >
              {isBn ? titleBn : titleEn}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              {isBn
                ? 'প্রিমিয়াম কাজুবাদাম, কাঠবাদাম, কিসমিস ও খেজুরের পাশাপাশি আকর্ষণীয় পাঞ্জাবি, শাড়ি, থ্রি-পিস ও পোশাক'
                : 'Pure premium dry fruits, nuts, dates alongside luxury panjabis, sarees, three-pieces, and apparel'}
            </p>
          </div>
        </div>

        {/* Category Tabs (Segmented Button Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-white shadow-xs font-semibold'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 hover:text-neutral-900'
                }`}
                style={isActive ? { backgroundColor: theme.primary } : undefined}
              >
                {cat === 'all'
                  ? (isBn ? 'সব পণ্য' : 'All Goods')
                  : cat === 'clothing_all'
                  ? (isBn ? '✨ পোশাক কালেকশন' : 'Apparel Collection')
                  : cat === 'spices_all'
                  ? (isBn ? '🥜 ড্রাই ফ্রুটস ও বাদাম' : 'Dry Fruits & Nuts')
                  : cat}
              </button>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-2xl border border-dashed border-neutral-200 bg-neutral-50">
            <p className="text-sm font-semibold text-neutral-700">
              {isBn ? 'আপনার অনুসন্ধানের সাথে কোনো পণ্য মেলেনি' : 'No items match your search'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {isBn
                ? 'অন্য কোনো নাম লিখে খুঁজুন বা ক্যাটাগরি ফিল্টার পরিবর্তন করুন।'
                : 'Try searching for cashews, almonds, dates, raisins, or apparel.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
            >
              {isBn ? 'সব পণ্য দেখুন' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const isAdded = !!addedIds[product.id];
              const weightIdx = selectedWeights[product.id] || 0;
              const currentWeightOption = product.weightOptions?.[weightIdx];
              const displayPrice = currentWeightOption
                ? currentWeightOption.price
                : product.price;

              return (
                <div
                  key={product.id}
                  className={`group flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
                    product.inStock === false
                      ? 'border-neutral-200 bg-neutral-50/70 shadow-2xs opacity-90'
                      : 'border-neutral-200/80 hover:border-emerald-700/40 bg-white shadow-2xs hover:shadow-xl hover:-translate-y-1'
                  }`}
                >
                  <div>
                    {/* Visual Asset Thumbnail */}
                    {product.image && (
                      <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-neutral-100 mb-4 border border-neutral-200/60 shadow-2xs">
                        <img
                          src={product.image}
                          alt={product.nameBn}
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition-transform duration-500 ${
                            product.inStock === false
                              ? 'grayscale-40 opacity-80'
                              : 'group-hover:scale-105'
                          }`}
                        />
                        {/* Stock Out Overlay Badge */}
                        {product.inStock === false ? (
                          <div className="absolute top-2.5 left-2.5 bg-rose-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 tracking-wider uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span>{product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}</span>
                          </div>
                        ) : product.badgeBn ? (
                          <div className="absolute top-2.5 left-2.5 bg-neutral-900/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            {isBn ? product.badgeBn : product.badgeEn}
                          </div>
                        ) : null}

                        {product.originalPrice && displayPrice < product.originalPrice && product.inStock !== false && (
                          <div className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                            {isBn ? `৳${product.originalPrice - displayPrice} ছাড়` : 'SAVE'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata line without pills */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-1.5">
                      <span className="font-medium text-emerald-800">{isBn ? product.categoryBn : product.categoryEn}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1 font-mono tabular-nums">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="font-bold text-neutral-800">{product.rating}</span>
                      </span>
                      {product.reviewsCount && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-neutral-400">
                            ({product.reviewsCount} রিভিউ)
                          </span>
                        </>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-900 transition-colors leading-snug">
                        {isBn ? product.nameBn : product.nameEn}
                      </h3>
                      {product.inStock === false && (
                        <span className="shrink-0 px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-300">
                          {product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}
                        </span>
                      )}
                    </div>

                    {/* Short Description */}
                    <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-4">
                      {isBn ? product.descBn : product.descEn}
                    </p>

                    {/* Weight Pack Selector (if available) */}
                    {product.weightOptions && product.weightOptions.length > 0 && (
                      <div className="mb-4">
                        <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">
                          {isBn ? 'প্যাকেটের সাইজ:' : 'Pack Size:'}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {product.weightOptions.map((opt, oIdx) => (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() =>
                                setSelectedWeights((prev) => ({
                                  ...prev,
                                  [product.id]: oIdx,
                                }))
                              }
                              className={`px-2.5 py-1 text-[11px] rounded-lg border transition-all ${
                                weightIdx === oIdx
                                  ? 'border-emerald-800 bg-emerald-900 text-white font-bold shadow-2xs'
                                  : 'border-neutral-200 hover:border-neutral-300 text-neutral-700 bg-neutral-50'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pricing and Action Block */}
                  <div className="pt-3 border-t border-neutral-100 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black font-mono tabular-nums" style={{ color: theme.primary }}>
                          {product.currency} {displayPrice.toLocaleString()}
                        </span>
                        {product.originalPrice && weightIdx === 0 && (
                          <span className="text-xs font-mono tabular-nums text-neutral-400 line-through">
                            {product.currency} {product.originalPrice}
                          </span>
                        )}
                      </div>

                      {product.inStock !== false && onExpressOrder && (
                        <button
                          type="button"
                          onClick={() => {
                            const weightOption = product.weightOptions?.[weightIdx];
                            const customProduct: ProductItem = {
                              ...product,
                              nameBn: weightOption ? `${product.nameBn} (${weightOption.label})` : product.nameBn,
                              nameEn: weightOption ? `${product.nameEn} (${weightOption.label})` : product.nameEn,
                              price: displayPrice,
                            };
                            onExpressOrder(customProduct);
                          }}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white flex items-center gap-1 transition-all active:scale-95 shadow-xs cursor-pointer"
                          style={{
                            backgroundColor: theme.accent,
                            boxShadow: `0 2px 8px ${theme.accent}40`,
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
                        className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-neutral-200 text-neutral-500 cursor-not-allowed border border-neutral-300 shadow-2xs"
                        title={isBn ? 'এই পণ্যটি বর্তমানে স্টক আউট' : 'This product is out of stock'}
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>{product.stockStatusText || (isBn ? 'স্টক আউট' : 'Stock Out')}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdd(product)}
                        className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs hover:shadow-md cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-600 text-white'
                            : 'text-white'
                        }`}
                        style={!isAdded ? { backgroundColor: theme.primary } : undefined}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>{isBn ? 'ব্যাগে যুক্ত হয়েছে' : 'Added to Bag'}</span>
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

        {/* Free Home Delivery / Trust Banner */}
        <div 
          className="mt-12 p-6 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-colors"
          style={{
            backgroundColor: theme.accentBg,
            borderColor: theme.borderLight,
            color: theme.textLight,
          }}
        >
          <div className="space-y-1">
            <h4 className="text-sm font-bold" style={{ color: theme.primary }}>
              {isBn ? '🚚 সারা দেশে ক্যাশ অন হোম ডেলিভারি' : '🚚 Cash on Delivery Nationwide'}
            </h4>
            <p className="max-w-xl opacity-90" style={{ color: theme.textMuted }}>
              {isBn
                ? 'পণ্য হাতে পেয়ে দেখে টাকা পরিশোধ করুন। ঢাকার ভেতর ২৪-৪৮ ঘণ্টা এবং ঢাকার বাইরে ২-৩ দিনে পৌঁছে যাবে।'
                : 'Inspect goods upon arrival before payment. Fast 24-48h delivery inside Dhaka and 2-3 days nationwide.'}
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <a
              href="#contact"
              className="px-4 py-2 rounded-xl font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap shadow-xs"
              style={{ backgroundColor: theme.primary }}
            >
              {isBn ? 'পাইকারি বা বাল্ক অর্ডার' : 'Wholesale Inquiry'}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
