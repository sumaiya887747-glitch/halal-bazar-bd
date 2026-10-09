import React, { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Clock, X, AlertCircle } from 'lucide-react';
import { AdminOrder } from '../../types/admin';
import { ColorTheme, Language } from '../../types/website';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: AdminOrder[];
  language: Language;
  theme: ColorTheme;
  initialQuery?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  language,
  theme,
  initialQuery,
}) => {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrders, setFoundOrders] = useState<AdminOrder[]>([]);

  // Auto-search if initialQuery is provided when opening
  React.useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      const q = initialQuery.trim().toLowerCase();
      const results = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
          (o.serialNo && String(o.serialNo) === q) ||
          o.customerPhone.includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
      setFoundOrders(results);
      setSearched(true);
    }
  }, [isOpen, initialQuery, orders]);

  // Automatically refresh foundOrders when orders state updates in real-time
  React.useEffect(() => {
    if (searched && query.trim()) {
      const q = query.trim().toLowerCase();
      const results = orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
          (o.serialNo && String(o.serialNo) === q) ||
          o.customerPhone.includes(q) ||
          o.customerName.toLowerCase().includes(q)
      );
      setFoundOrders(results);
    }
  }, [orders, searched, query]);

  if (!isOpen) return null;

  const isBn = language === 'bn';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;

    const results = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.invoiceNumber && o.invoiceNumber.toLowerCase().includes(q)) ||
        (o.serialNo && String(o.serialNo) === q) ||
        o.customerPhone.includes(q) ||
        o.customerName.toLowerCase().includes(q)
    );
    setFoundOrders(results);
    setSearched(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {isBn ? 'অপেক্ষমান (Pending)' : 'Pending'}
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {isBn ? 'নিশ্চিত করা হয়েছে (Confirmed)' : 'Confirmed'}
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
            <Truck className="w-3.5 h-3.5" />
            {isBn ? 'ডেলিভারির জন্য পথে আছে (On the Way)' : 'Shipped'}
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {isBn ? 'সফলভাবে ডেলিভারি সম্পন্ন (Delivered)' : 'Delivered'}
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {isBn ? 'বাতিল করা হয়েছে (Cancelled)' : 'Cancelled'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Colorful Gradient Header */}
        <div 
          className="p-6 text-white transition-colors duration-500"
          style={{
            background: theme.id === 'sky-blue-cyan'
              ? 'linear-gradient(to right, #0284c7, #0369a1, #0c4a6e)'
              : 'linear-gradient(to right, #064e3b, #065f46, #022c22)'
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Package className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {isBn ? 'লাইভ অর্ডার স্ট্যাটাস ট্র্যাক করুন' : 'Live Order Tracker'}
                </h3>
                <p className="text-xs text-white/90">
                  {isBn ? 'অর্ডার নম্বর বা মোবাইল নম্বর দিয়ে আপনার অর্ডারের বর্তমান অবস্থা জানুন' : 'Enter order ID or phone number to check status'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mt-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isBn ? 'যেমন: HB-8421 বা মোবাইল নম্বর...' : 'Enter HB-8421 or phone...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-neutral-900 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md placeholder:text-neutral-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-md shrink-0 active:scale-95 cursor-pointer hover:opacity-95"
              style={{ backgroundColor: theme.primary }}
            >
              {isBn ? 'খুঁজুন' : 'Search'}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 bg-neutral-50/50">
          {!searched ? (
            <div className="text-center py-10 text-neutral-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-700" />
              <p className="text-xs font-medium">
                {isBn ? 'আপনার অর্ডার নম্বর বা ফোন নম্বর লিখে সার্চ করুন' : 'Search with your order number or phone number'}
              </p>
              <div className="mt-3 inline-block bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-[11px] font-semibold">
                💡 টিপস: ডেমো অর্ডার দেখতে <span className="font-mono font-bold">HB-8421</span> লিখে সার্চ করুন।
              </div>
            </div>
          ) : foundOrders.length === 0 ? (
            <div className="text-center py-10 text-neutral-600">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-amber-500 opacity-80" />
              <p className="text-sm font-bold text-neutral-900">
                {isBn ? 'কোনো অর্ডার পাওয়া যায়নি' : 'No order found'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                {isBn ? 'সঠিক অর্ডার নম্বর বা ফোন নম্বর দিয়ে আবার চেষ্টা করুন।' : 'Please check your order number and try again.'}
              </p>
            </div>
          ) : (
            foundOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                      অর্ডার / ইনভয়েস নং: <span className="font-mono text-neutral-900 font-extrabold">#{ord.invoiceNumber || ord.orderNumber}</span>
                    </span>
                    <span className="text-xs text-neutral-500">{ord.createdAt}</span>
                  </div>
                  <div>{getStatusBadge(ord.status)}</div>
                </div>

                <div className="text-xs space-y-1 text-neutral-700">
                  <p><span className="font-semibold text-neutral-900">গ্রাহক:</span> {ord.customerName} ({ord.customerPhone})</p>
                  <p><span className="font-semibold text-neutral-900">ঠিকানা:</span> {ord.customerAddress}</p>
                </div>

                <div className="pt-2 border-t border-neutral-100 space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-600 block">অর্ডারকৃত পণ্যসমূহ:</span>
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-neutral-700 bg-neutral-50 p-2 rounded-lg">
                      <span>{item.productName} × {item.quantity}</span>
                      <span className="font-mono font-semibold">৳{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 font-bold text-sm text-neutral-900 border-t border-neutral-100">
                  <span>মোট বিল:</span>
                  <span className="font-mono text-emerald-800 text-base">৳{ord.total}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
