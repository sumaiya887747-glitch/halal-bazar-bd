import React, { useState } from 'react';
import {
  AlertTriangle,
  X,
  Package,
  Plus,
  Minus,
  Check,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowRight,
  Sliders,
  RefreshCw,
} from 'lucide-react';
import { ProductItem } from '../../types/website';
import { StoreSettings } from '../../types/admin';
import { getProductStockQty, getStockStatusDisplay } from '../../utils/stock';

interface LowStockAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  settings: StoreSettings;
  onUpdateProducts: (newProducts: ProductItem[]) => void;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onOpenEditProduct?: (product: ProductItem) => void;
}

export const LowStockAlertModal: React.FC<LowStockAlertModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  onUpdateProducts,
  onUpdateSettings,
  onOpenEditProduct,
}) => {
  const currentThreshold = settings.lowStockThreshold ?? 5;
  const [thresholdInput, setThresholdInput] = useState<number>(currentThreshold);
  const [isSavingThreshold, setIsSavingThreshold] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [quickRestockAmount, setQuickRestockAmount] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  // Filter low stock products
  const lowStockProducts = products.filter((p) => {
    if (p.inStock === false) return true;
    const threshold = p.lowStockThreshold ?? currentThreshold;
    return getProductStockQty(p) <= threshold;
  });

  // Sort: 0 units first (out of stock), then lowest stock to highest
  const sortedLowStock = [...lowStockProducts].sort((a, b) => {
    const qtyA = getProductStockQty(a);
    const qtyB = getProductStockQty(b);
    return qtyA - qtyB;
  });

  const handleSaveThreshold = (newVal?: number) => {
    const val = newVal !== undefined ? newVal : thresholdInput;
    if (val < 1 || val > 100) return;
    setIsSavingThreshold(true);
    const updatedSettings = {
      ...settings,
      lowStockThreshold: val,
    };
    onUpdateSettings(updatedSettings);
    setThresholdInput(val);
    setTimeout(() => {
      setIsSavingThreshold(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }, 300);
  };

  const handleQuickAddStock = (productId: string, amount: number) => {
    const updated = products.map((p) => {
      if (p.id === productId) {
        const currentQty = getProductStockQty(p);
        const newQty = currentQty + amount;
        return {
          ...p,
          stockQuantity: newQty,
          inStock: true,
          stockStatusText: undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  const handleSetExactStock = (productId: string, exactQty: number) => {
    const qty = Math.max(0, exactQty);
    const updated = products.map((p) => {
      if (p.id === productId) {
        return {
          ...p,
          stockQuantity: qty,
          inStock: qty > 0 ? (p.inStock !== false) : false,
          stockStatusText: qty === 0 ? (p.stockStatusText || 'স্টক আউট') : undefined,
        };
      }
      return p;
    });
    onUpdateProducts(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-neutral-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-white flex items-center justify-between shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  লো-স্টক ইনভেন্টরি সতর্কবার্তা (Low Stock Alerts)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs border border-white/20">
                  {lowStockProducts.length}টি পণ্য অ্যালার্টে
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5 font-medium">
                যেসব পণ্যের মজুদ নির্ধারিত থ্রেশহোল্ড ({currentThreshold} ইউনিট) এর নিচে রয়েছে তাদের তালিকা ও দ্রুত রিস্টক ব্যবস্থা
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors relative z-10 cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configurable Threshold Bar */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Sliders className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <span className="font-bold text-neutral-900 block">
                কনফিগারেবল লো-স্টক থ্রেশহোল্ড (Alert Threshold):
              </span>
              <span className="text-[11px] text-neutral-600">
                এই সংখ্যার নিচে মজুদ নামলে সিস্টেমে সতর্কবার্তা দেখাবে
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Quick Presets */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200 shadow-2xs">
              {[3, 5, 8, 10, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    setThresholdInput(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    thresholdInput === preset
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  title={`${preset} ইউনিট থ্রেশহোল্ড নির্বাচন করুন`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Custom Input & Update Button */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-white rounded-xl border border-amber-300 px-2.5 py-1 shadow-2xs">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={thresholdInput}
                  onChange={(e) => setThresholdInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-12 text-center font-mono font-bold text-neutral-900 text-xs focus:outline-none"
                />
                <span className="text-[11px] font-semibold text-neutral-500 ml-1">ইউনিট</span>
              </div>

              <button
                type="button"
                onClick={() => handleSaveThreshold()}
                disabled={isSavingThreshold || thresholdInput === currentThreshold}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1 cursor-pointer shadow-2xs ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed'
                }`}
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>সংরক্ষিত!</span>
                  </>
                ) : (
                  <span>আপডেট</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Auto-Deduct Control */}
        <div className="px-4 py-2.5 bg-neutral-50/90 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-800">অর্ডারে অটো স্টক হ্রাস:</span>
            <span className="text-[11px] text-neutral-500">
              {settings.autoDeductStockOnOrder
                ? 'অন (গ্রাহক অর্ডার করলে স্বয়ংক্রিয়ভাবে স্টক হ্রাস পাবে)'
                : 'বন্ধ / ম্যানুয়াল (অ্যাডমিন নিজেই যাচাই করে স্টক পরিবর্তন করবেন)'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const nextVal = !settings.autoDeductStockOnOrder;
              onUpdateSettings({ ...settings, autoDeductStockOnOrder: nextVal });
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer self-start sm:self-auto flex items-center gap-1.5 ${
              settings.autoDeductStockOnOrder
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            <span>{settings.autoDeductStockOnOrder ? '🟢 অটো হ্রাস চালু' : '⚪ ম্যানুয়াল স্টক কন্ট্রোল (ডিফল্ট)'}</span>
          </button>
        </div>

        {/* Modal Body / Low Stock Products List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {sortedLowStock.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-neutral-900">
                অভিনন্দন! কোনো পণ্যের লো-স্টক সতর্কতা নেই
              </h4>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                আপনার স্টোরের সকল পণ্যের মজুদ নির্ধারিত থ্রেশহোল্ড ({currentThreshold} ইউনিট) এর উপরে রয়েছে।
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-500 pb-1">
                <span className="font-semibold">
                  মোট {sortedLowStock.length}টি পণ্যে জরুরি রিস্টক প্রয়োজন:
                </span>
                <span className="text-[11px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-bold">
                  থ্রেশহোল্ড: ≤ {currentThreshold} ইউনিট
                </span>
              </div>

              <div className="grid gap-3">
                {sortedLowStock.map((prod) => {
                  const currentStock = getProductStockQty(prod);
                  const effectiveThreshold = prod.lowStockThreshold ?? currentThreshold;
                  const isOut = prod.inStock === false || currentStock === 0;
                  const percent = Math.min(100, Math.round((currentStock / effectiveThreshold) * 100));

                  return (
                    <div
                      key={prod.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isOut
                          ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                          : 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        {/* Product Info */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0 relative">
                            {prod.image ? (
                              <img
                                src={prod.image}
                                alt={prod.nameBn}
                                className={`w-full h-full object-cover ${isOut ? 'grayscale-50 opacity-80' : ''}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-neutral-400">
                                <Package className="w-6 h-6" />
                              </div>
                            )}
                            {isOut && (
                              <div className="absolute inset-0 bg-rose-950/60 flex items-center justify-center">
                                <span className="text-[8px] font-black text-white px-1 py-0.2 rounded bg-rose-700">
                                  EMPTY
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate">
                                {prod.nameBn}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                isOut
                                  ? 'bg-rose-200 text-rose-900 border border-rose-300'
                                  : 'bg-amber-200 text-amber-950 border border-amber-300'
                              }`}>
                                {isOut ? 'স্টক আউট' : `লো স্টক (${currentStock} বাকি)`}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 flex items-center gap-2 mt-0.5">
                              <span>ক্যাটাগরি: {prod.categoryBn}</span>
                              <span>•</span>
                              <span className="font-mono font-semibold text-neutral-800">৳{prod.price.toLocaleString()}</span>
                              <span>•</span>
                              <span>একক: {prod.quantity || '1'} {prod.unit || 'KG'}</span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-2 flex items-center gap-2 w-full max-w-xs">
                              <div className="flex-1 h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isOut
                                      ? 'bg-rose-600 w-0'
                                      : currentStock <= 2
                                      ? 'bg-rose-500'
                                      : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-mono font-bold text-neutral-600 whitespace-nowrap">
                                {currentStock} / {effectiveThreshold} ইউনিট
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quick Restock Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0 flex-wrap">
                          <span className="text-[10px] font-bold text-neutral-500 mr-1 hidden sm:inline">
                            রিস্টক করুন:
                          </span>

                          <button
                            type="button"
                            onClick={() => handleQuickAddStock(prod.id, 5)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                            title="৫ ইউনিট যোগ করুন"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>+৫</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAddStock(prod.id, 10)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                            title="১০ ইউনিট যোগ করুন"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>+১০</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickAddStock(prod.id, 20)}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                            title="২০ ইউনিট যোগ করুন"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                            <span>+২০</span>
                          </button>

                          {/* Inline exact count adjuster */}
                          <div className="flex items-center bg-white rounded-xl border border-neutral-300 px-1.5 py-1 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleSetExactStock(prod.id, currentStock - 1)}
                              disabled={currentStock <= 0}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-900 disabled:opacity-30 cursor-pointer"
                              title="১ ইউনিট কমান"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono font-black text-neutral-900 text-xs">
                              {currentStock}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleSetExactStock(prod.id, currentStock + 1)}
                              className="p-1 rounded text-neutral-500 hover:text-neutral-900 cursor-pointer"
                              title="১ ইউনিট বাড়ান"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {onOpenEditProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onOpenEditProduct(prod);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold transition-all shadow-2xs cursor-pointer ml-1"
                              title="পণ্যের পূর্ণ বিবরণ এডিট করুন"
                            >
                              এডিট
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-neutral-600">
            <Package className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              ইনভেন্টরি তথ্য কেবল অ্যাডমিন প্যানেল থেকেই সুরক্ষিতভাবে নিয়ন্ত্রণ ও ম্যানুয়ালি রিস্টক করা যাবে।
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold transition-all shadow-xs cursor-pointer self-end sm:self-auto"
          >
            সম্পন্ন (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
