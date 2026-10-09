import React from 'react';
import { AlertTriangle, Plus, ChevronRight, Package, Sliders, ArrowUpRight } from 'lucide-react';
import { ProductItem } from '../../types/website';
import { StoreSettings } from '../../types/admin';
import { getProductStockQty } from '../../utils/stock';

interface LowStockAlertBannerProps {
  products: ProductItem[];
  settings: StoreSettings;
  onOpenLowStockModal: () => void;
  onQuickRestock: (productId: string, amount: number) => void;
  onNavigateToProducts?: () => void;
}

export const LowStockAlertBanner: React.FC<LowStockAlertBannerProps> = ({
  products,
  settings,
  onOpenLowStockModal,
  onQuickRestock,
  onNavigateToProducts,
}) => {
  const threshold = settings.lowStockThreshold ?? 5;

  const lowStockProducts = products.filter((p) => {
    if (p.inStock === false) return true;
    const limit = p.lowStockThreshold ?? threshold;
    return getProductStockQty(p) <= limit;
  });

  if (lowStockProducts.length === 0) return null;

  const outOfStockCount = lowStockProducts.filter(
    (p) => p.inStock === false || getProductStockQty(p) === 0
  ).length;

  return (
    <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/60 to-rose-50/50 p-4 sm:p-5 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <span>⚠️ লো-স্টক ইনভেন্টরি সতর্কবার্তা (Low Stock Alert)</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-200 uppercase tracking-wider">
                {lowStockProducts.length}টি পণ্য লিমিটের নিচে
              </span>
              {outOfStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                  {outOfStockCount}টি সম্পূর্ণ স্টক আউট
                </span>
              )}
            </div>

            <p className="text-xs text-neutral-600 mt-1">
              বর্তমান অ্যালার্ট সীমা: <strong className="text-amber-900 font-bold">{threshold} ইউনিট</strong>। গ্রাহকদের নিরবচ্ছিন্ন অর্ডারের সুবিধার্থে দ্রুত রিস্টক করুন।
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onOpenLowStockModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold transition-all shadow-xs hover:shadow active:scale-95 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>অ্যালার্ট তালিকা ও রিস্টক ({lowStockProducts.length})</span>
          </button>

          {onNavigateToProducts && (
            <button
              type="button"
              onClick={onNavigateToProducts}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <span>পণ্য তালিকায় দেখুন</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Preview Chips for top low stock items */}
      <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-amber-900 shrink-0">জরুরি রিস্টক:</span>
        <div className="flex items-center gap-2">
          {lowStockProducts.slice(0, 4).map((p) => {
            const qty = getProductStockQty(p);
            return (
              <div
                key={p.id}
                className="inline-flex items-center gap-2 bg-white/90 border border-amber-300/80 px-2.5 py-1 rounded-xl shadow-2xs shrink-0"
              >
                <span className="font-semibold text-neutral-900 text-[11px] max-w-[140px] truncate">
                  {p.nameBn}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-black ${
                  qty === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  {qty} বাকি
                </span>
                <button
                  type="button"
                  onClick={() => onQuickRestock(p.id, 10)}
                  className="px-1.5 py-0.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-0.5"
                  title="দ্রুত ১০ ইউনিট যোগ করুন"
                >
                  <Plus className="w-2.5 h-2.5" />
                  <span>১০</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
