import React, { useState } from 'react';
import { ColorTheme, ProductItem } from '../../types/website';
import { StoreSettings } from '../../types/admin';
import { X, ShoppingBag, Truck, ShieldCheck, CheckCircle2, Tag, ArrowRight, Zap } from 'lucide-react';

interface ExpressOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductItem | null;
  settings: StoreSettings;
  onSubmitOrder: (orderData: any) => void;
  language: 'bn' | 'en';
  theme?: ColorTheme;
}

export const ExpressOrderModal: React.FC<ExpressOrderModalProps> = ({
  isOpen,
  onClose,
  product,
  settings,
  onSubmitOrder,
  language,
  theme,
}) => {
  if (!isOpen || !product) return null;

  const isBn = language === 'bn';

  // Variant / Weight state
  const [selectedWeight, setSelectedWeight] = useState<string>(
    product.weightOptions?.[0]?.label || '১ কেজি'
  );

  // Price calculations based on selected weight
  const basePrice = product.price;
  const currentPrice = (() => {
    if (product.weightOptions && product.weightOptions.length > 0) {
      const match = product.weightOptions.find((w) => w.label === selectedWeight);
      if (match) return match.price;
    }
    if (selectedWeight.includes('৫০০ গ্রাম') || selectedWeight.includes('500g')) {
      return Math.round(basePrice * 0.52);
    }
    if (selectedWeight.includes('২৫০ গ্রাম') || selectedWeight.includes('250g')) {
      return Math.round(basePrice * 0.28);
    }
    if (selectedWeight.includes('২ কেজি') || selectedWeight.includes('2kg')) {
      return Math.round(basePrice * 1.95);
    }
    return basePrice;
  })();

  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [trxId, setTrxId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');

  // Coupon Code
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    discountPercent?: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');

  // Delivery Fees
  const deliveryFee = deliveryArea === 'dhaka' 
    ? (settings.deliveryFeeDhaka ?? 60) 
    : (settings.deliveryFeeOutside ?? 120);

  const subtotal = currentPrice * quantity;

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountAmount) {
      discountAmount = appliedCoupon.discountAmount;
    } else if (appliedCoupon.discountPercent) {
      discountAmount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    }
  }

  const finalSubtotal = Math.max(0, subtotal - discountAmount);
  const totalAmount = finalSubtotal + deliveryFee;

  const handleApplyCoupon = () => {
    setCouponError('');
    const trimmed = couponCode.trim().toUpperCase();
    if (!trimmed) {
      setCouponError(isBn ? 'কুপন কোড লিখুন' : 'Enter coupon code');
      return;
    }

    const availableCoupons = settings.coupons || [
      { id: 'c1', code: 'HALAL10', discountPercent: 10, active: true },
      { id: 'c2', code: 'FREE60', discountAmount: 60, active: true },
      { id: 'c3', code: 'DHAMAKA', discountPercent: 15, active: true },
    ];

    const match = availableCoupons.find((c) => c.code.toUpperCase() === trimmed && c.active);

    if (match) {
      if (match.minOrderAmount && subtotal < match.minOrderAmount) {
        setCouponError(
          isBn
            ? `কমপক্ষে ৳${match.minOrderAmount} টাকার অর্ডার প্রয়োজন`
            : `Minimum order amount is ৳${match.minOrderAmount}`
        );
        return;
      }
      setAppliedCoupon({
        code: match.code,
        discountAmount: match.discountAmount || 0,
        discountPercent: match.discountPercent,
      });
    } else {
      setCouponError(isBn ? 'অকার্যকর বা ভুল কুপন কোড!' : 'Invalid coupon code!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called', { name, phone, address });
    if (!name.trim()) {
      alert(isBn ? 'অনুগ্রহ করে আপনার নাম প্রদান করুন' : 'Please enter your name');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      alert(isBn ? 'অনুগ্রহ করে সঠিক মোবাইল নম্বর প্রদান করুন' : 'Please enter a valid mobile number');
      return;
    }
    if (!address.trim()) {
      alert(isBn ? 'অনুগ্রহ করে ডেলিভারি ঠিকানা প্রদান করুন' : 'Please enter delivery address');
      return;
    }

    const orderPayload = {
      type: 'express_order' as const,
      name,
      email: 'express@halalbazar.com',
      phone,
      message: `ঠিকানা: ${address}${orderNotes.trim() ? ` | নোট: ${orderNotes.trim()}` : ''}`,
      details: {
        address,
        orderNotes: orderNotes.trim() || undefined,
        deliveryArea: deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
        deliveryFee,
        paymentMethod,
        trxId: paymentMethod !== 'cod' ? trxId : undefined,
        senderNumber: paymentMethod !== 'cod' ? senderNumber : undefined,
        couponCode: appliedCoupon?.code,
        discountAmount,
        cartItems: [
          {
            productName: product.nameBn,
            quantity,
            price: currentPrice,
            originalPrice: product.originalPrice || product.price,
            discountPercent: product.discountPercent || 0,
            weightAmount: selectedWeight,
          },
        ],
        totalAmount,
      },
    };

    onSubmitOrder(orderPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-5 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-neutral-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <div 
          className="text-white p-4 md:p-5 flex items-center justify-between"
          style={{
            background: theme
              ? `linear-gradient(90deg, ${theme.primary} 0%, ${theme.primaryHover} 60%, ${theme.primary} 100%)`
              : 'linear-gradient(90deg, #064e3b 0%, #047857 60%, #022c22 100%)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-neutral-950 uppercase tracking-wider mb-0.5">
                {isBn ? '১-ক্লিক এক্সপ্রেস অর্ডার' : '1-Click Express Checkout'}
              </span>
              <h3 className="text-base md:text-lg font-bold text-white leading-tight">
                {isBn ? 'ক্যাশ অন ডেলিভারিতে অর্ডার কনফার্ম করুন' : 'Confirm Order via Cash on Delivery'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* Selected Product Summary Box */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={product.image}
                alt={product.nameBn}
                className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border border-emerald-200 shadow-sm"
              />
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  {product.categoryBn || 'প্রিমিয়াম কালেকশন'}
                </span>
                <h4 className="font-bold text-neutral-900 text-sm md:text-base leading-snug">
                  {isBn ? product.nameBn : product.nameEn}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg font-black text-emerald-700">
                    ৳{currentPrice}
                  </span>
                  {product.originalPrice && (
                    <span className="text-xs text-neutral-400 line-through">
                      ৳{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-emerald-100">
              <span className="text-xs font-medium text-neutral-600 sm:hidden">পরিমাণ:</span>
              <div className="flex items-center border border-neutral-300 rounded-xl bg-white shadow-sm overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 font-bold text-base transition-colors"
                >
                  -
                </button>
                <span className="px-3 py-1 text-sm font-bold text-neutral-900 min-w-[32px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 font-bold text-base transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Variant / Weight Choice Pill Options */}
          {product.weightOptions && product.weightOptions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
                {isBn ? 'প্যাকেজের ওজন / সাইজ নির্বাচন করুন:' : 'Select Weight / Size:'}
              </label>
              <div className="flex flex-wrap gap-2">
                {product.weightOptions.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setSelectedWeight(opt.label)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition-all border ${
                      selectedWeight === opt.label
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-600/20'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {opt.label} - ৳{opt.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Delivery Details Inputs */}
          <div className="space-y-3.5 pt-1">
            <h5 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-2">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? 'ডেলিভারির তথ্য প্রদান করুন' : 'Customer Shipping Information'}</span>
            </h5>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBn ? '' : ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  {isBn ? 'মোবাইল নম্বর (১১ ডিজিট) *' : 'Mobile Phone Number *'}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={isBn ? '' : ''}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isBn ? 'সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা) *' : 'Complete Delivery Address *'}
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={isBn ? 'যেমন: বাসা ১২, রোড ৪, ব্লক বি, মিরপুর ডিওএইচএস, ঢাকা' : 'Full street address...'}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-sm font-medium resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1 flex items-center justify-between">
                <span>{isBn ? 'অর্ডার নোট / বিশেষ নির্দেশাবলী (ঐচ্ছিক)' : 'Order Notes / Special Instructions (Optional)'}</span>
                <span className="text-[10px] text-neutral-400 font-normal">{isBn ? 'ঐচ্ছিক' : 'Optional'}</span>
              </label>
              <textarea
                rows={2}
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder={isBn ? 'পছন্দের রঙ, সাইজ, ডেলিভারির সময় বা অন্য কোনো বিশেষ নির্দেশাবলী লিখুন...' : 'Special instructions or notes for delivery...'}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-xs font-medium resize-none placeholder:text-neutral-400"
              />
            </div>

            {/* Delivery Area Radio Selector */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {isBn ? 'ডেলিভারি এলাকা নির্বাচন করুন:' : 'Select Delivery Area:'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryArea('dhaka')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    deliveryArea === 'dhaka'
                      ? 'font-bold ring-2'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                  style={deliveryArea === 'dhaka' ? {
                    borderColor: theme?.primary || '#064e3b',
                    backgroundColor: theme?.accentBg || '#f0fdf4',
                    color: theme?.primary || '#064e3b',
                    // @ts-ignore
                    '--tw-ring-color': `${theme?.primary || '#064e3b'}33`
                  } : undefined}
                >
                  <span className="text-xs md:text-sm">{isBn ? 'ঢাকার ভেতরে' : 'Inside Dhaka'}</span>
                  <span className="text-xs font-extrabold" style={{ color: theme?.primary || '#065f46' }}>৳{settings.deliveryFeeDhaka ?? 60}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryArea('outside')}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    deliveryArea === 'outside'
                      ? 'font-bold ring-2'
                      : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                  style={deliveryArea === 'outside' ? {
                    borderColor: theme?.primary || '#064e3b',
                    backgroundColor: theme?.accentBg || '#f0fdf4',
                    color: theme?.primary || '#064e3b',
                    // @ts-ignore
                    '--tw-ring-color': `${theme?.primary || '#064e3b'}33`
                  } : undefined}
                >
                  <span className="text-xs md:text-sm">{isBn ? 'ঢাকার বাইরে (সারাদেশ)' : 'Outside Dhaka'}</span>
                  <span className="text-xs font-extrabold" style={{ color: theme?.primary || '#065f46' }}>৳{settings.deliveryFeeOutside ?? 120}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Coupon Code Section */}
          <div 
            className="border rounded-2xl p-3 md:p-3.5 space-y-2"
            style={{ backgroundColor: `${theme?.accent || '#0284c7'}08`, borderColor: `${theme?.accent || '#0284c7'}30` }}
          >
            <label className="text-xs font-bold flex items-center gap-1.5" style={{ color: theme?.primary || '#064e3b' }}>
              <Tag className="w-3.5 h-3.5" style={{ color: theme?.accent || '#0284c7' }} />
              <span>{isBn ? 'কুপন কোড (যদি থাকে):' : 'Promo / Coupon Code:'}</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder={isBn ? 'কোড লিখুন (যেমন: HALAL10)' : 'e.g. HALAL10'}
                className="flex-1 px-3 py-1.5 rounded-xl border text-xs font-bold uppercase tracking-wider outline-none bg-white focus:ring-2"
                style={{ borderColor: `${theme?.accent || '#0284c7'}50` }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="px-4 py-1.5 rounded-xl text-white font-bold text-xs transition-colors shadow-sm"
                style={{ backgroundColor: theme?.accent || '#0284c7' }}
              >
                {isBn ? 'প্রয়োগ করুন' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="text-[11px] font-semibold text-rose-600">{couponError}</p>}
            {appliedCoupon && (
              <p className="text-[11px] font-bold flex items-center gap-1" style={{ color: theme?.primary || '#065f46' }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isBn
                    ? `কুপন '${appliedCoupon.code}' সফলভাবে প্রয়োগ করা হয়েছে!`
                    : `Coupon '${appliedCoupon.code}' applied!`}
                </span>
              </p>
            )}
          </div>

          {/* Price Breakdown Summary */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2 text-xs md:text-sm">
            <div className="flex justify-between text-neutral-600">
              <span>{isBn ? 'পণ্য মূল্য (মূল্য × পরিমাণ):' : 'Product Subtotal:'}</span>
              <span className="font-semibold text-neutral-900">৳{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="flex justify-between font-semibold" style={{ color: theme?.primary || '#059669' }}>
                <span>{isBn ? 'কুপন মূল্যছাড়:' : 'Coupon Discount:'}</span>
                <span>-৳{discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-neutral-600">
              <span>{isBn ? 'ডেলিভারি চার্জ:' : 'Delivery Charge:'}</span>
              <span className="font-semibold text-neutral-900">৳{deliveryFee}</span>
            </div>

            <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm md:text-base font-black text-neutral-900">
              <span>{isBn ? 'সর্বমোট প্রদেয় মূল্য:' : 'Total Amount Payable:'}</span>
              <span className="text-lg md:text-xl font-extrabold" style={{ color: theme?.primary || '#064e3b' }}>৳{totalAmount}</span>
            </div>
          </div>

          {/* Payment Method Option */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              {isBn ? 'পেমেন্ট পদ্ধতি:' : 'Payment Method:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'cod'
                    ? 'font-bold ring-2'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                style={paymentMethod === 'cod' ? {
                  borderColor: theme?.primary || '#064e3b',
                  backgroundColor: theme?.accentBg || '#f0fdf4',
                  color: theme?.primary || '#064e3b',
                  // @ts-ignore
                  '--tw-ring-color': `${theme?.primary || '#064e3b'}33`
                } : undefined}
              >
                <span className="text-xs block font-bold">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Delivery'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bkash')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'bkash'
                    ? 'font-bold ring-2'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                style={paymentMethod === 'bkash' ? {
                  borderColor: '#db2777',
                  backgroundColor: '#fdf2f8',
                  color: '#db2777',
                  // @ts-ignore
                  '--tw-ring-color': 'rgba(219, 39, 119, 0.2)'
                } : undefined}
              >
                <span className="text-xs block font-bold">{isBn ? 'বিকাশ পেমেন্ট' : 'bKash'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('nagad')}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  paymentMethod === 'nagad'
                    ? 'font-bold ring-2'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                }`}
                style={paymentMethod === 'nagad' ? {
                  borderColor: '#ea580c',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  // @ts-ignore
                  '--tw-ring-color': 'rgba(234, 88, 12, 0.2)'
                } : undefined}
              >
                <span className="text-xs block font-bold">{isBn ? 'নগদ পেমেন্ট' : 'Nagad'}</span>
              </button>
            </div>
          </div>

          {/* Mobile Payment Instructions if bKash or Nagad */}
          {paymentMethod !== 'cod' && (
            <div 
              className="p-3 border rounded-2xl text-xs space-y-2"
              style={{ backgroundColor: paymentMethod === 'bkash' ? '#fdf2f8' : '#fff7ed', borderColor: paymentMethod === 'bkash' ? '#fbcfe8' : '#fed7aa' }}
            >
              <p className="font-bold" style={{ color: paymentMethod === 'bkash' ? '#9d174d' : '#9a3412' }}>
                {paymentMethod === 'bkash' ? 'bKash Number: ' : 'Nagad Number: '}
                <span className="font-mono text-sm underline">
                  {paymentMethod === 'bkash' ? settings.bkashNumber || '01711-889900' : settings.nagadNumber || '01711-889900'}
                </span>
              </p>
              <p className="text-neutral-700 leading-relaxed">
                {settings.paymentInstructionsBn || 'টাকা পাঠানোর পর বিকাশ/নগদ নম্বর এবং ট্রানজেকশন আইডি নিচে লিখুন।'}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder={isBn ? 'প্রপ্রেরক নম্বর' : 'Sender Number'}
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border outline-none text-xs bg-white font-medium"
                  style={{ borderColor: paymentMethod === 'bkash' ? '#f9a8d4' : '#fdba74' }}
                />
                <input
                  type="text"
                  placeholder={isBn ? 'TrxID' : 'Transaction ID'}
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border outline-none text-xs bg-white font-medium"
                  style={{ borderColor: paymentMethod === 'bkash' ? '#f9a8d4' : '#fdba74' }}
                />
              </div>
            </div>
          )}

          {/* Guarantee Badge */}
          <div 
            className="flex items-center justify-center gap-2 text-xs font-semibold py-2 rounded-xl border"
            style={{
              backgroundColor: theme?.accentBg || '#ecfdf5',
              borderColor: theme?.borderLight || '#a7f3d0',
              color: theme?.primary || '#064e3b',
            }}
          >
            <ShieldCheck className="w-4 h-4" style={{ color: theme?.primary || '#059669' }} />
            <span>{isBn ? '১০০% অরিজিনাল কোয়ালিটি ও নিরাপদ হোম ডেলিভারির নিশ্চয়তা' : '100% Authentic Quality Guaranteed'}</span>
          </div>

          {/* Submit Order Button */}
          <button
            type="submit"
            className="w-full py-3.5 md:py-4 rounded-2xl active:scale-[0.99] text-white font-extrabold text-base md:text-lg shadow-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
            style={{
              backgroundColor: theme ? theme.primary : '#064e3b',
              boxShadow: theme ? `0 8px 25px ${theme.primary}45` : '0 8px 25px rgba(6,78,59,0.3)',
            }}
          >
            <CheckCircle2 className="w-5 h-5 text-amber-300" />
            <span>{isBn ? 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)' : 'Confirm Order Now'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
