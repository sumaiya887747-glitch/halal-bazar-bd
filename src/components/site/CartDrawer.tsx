import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck, Copy, Check, Smartphone } from 'lucide-react';
import { CartItem, ColorTheme, FormSubmission, Language } from '../../types/website';
import { StoreSettings } from '../../types/admin';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  theme: ColorTheme;
  language: Language;
  settings?: StoreSettings;
  onCheckoutComplete: (submission: Omit<FormSubmission, 'id' | 'timestamp'>) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  theme,
  language,
  settings,
  onCheckoutComplete,
}) => {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [deliveryArea, setDeliveryArea] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedType, setCopiedType] = useState<'bkash' | 'nagad' | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const isBn = language === 'bn';

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const feeDhaka = settings?.deliveryFeeDhaka ?? 60;
  const feeOutside = settings?.deliveryFeeOutside ?? 120;
  const deliveryFee = cartItems.length > 0 ? (deliveryArea === 'dhaka' ? feeDhaka : feeOutside) : 0;
  const total = subtotal + deliveryFee;

  const bkashNumber = settings?.bkashNumber || settings?.phone || '01711-889900';
  const bkashType = settings?.bkashType || 'personal';
  const nagadNumber = settings?.nagadNumber || settings?.phone || '01711-889900';
  const nagadType = settings?.nagadType || 'personal';

  const handleCopyNumber = (num: string, type: 'bkash' | 'nagad') => {
    navigator.clipboard.writeText(num.replace(/[^0-9]/g, ''));
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) return;

    if ((paymentMethod === 'bkash' || paymentMethod === 'nagad') && (!trxId.trim() || !senderPhone.trim())) {
      alert(isBn ? 'অনুগ্রহ করে পেমেন্ট প্রেরকের নম্বর এবং TrxID (ট্রানজেকশন আইডি) প্রদান করুন।' : 'Please provide your Sender Number and TrxID.');
      return;
    }

    const paymentLabel =
      paymentMethod === 'cod'
        ? 'ক্যাশ অন ডেলিভারি (COD)'
        : paymentMethod === 'bkash'
        ? `বিকাশ (TrxID: ${trxId}, প্রেরক: ${senderPhone})`
        : `নগদ (TrxID: ${trxId}, প্রেরক: ${senderPhone})`;

    onCheckoutComplete({
      name: customerName,
      email: 'order@halalbazarbd.com',
      phone: customerPhone,
      message: `অর্ডার তালিকা: ${cartItems
        .map((i) => `${i.product.nameBn} x${i.quantity} (৳${i.product.price * i.quantity})`)
        .join(', ')} | এলাকা: ${
        deliveryArea === 'dhaka' ? `ঢাকার ভেতরে (৳${feeDhaka})` : `ঢাকার বাইরে (৳${feeOutside})`
      } | পেমেন্ট: ${paymentLabel} | ঠিকানা: ${customerAddress} | সর্বমোট: ৳${total}`,
      type: 'order',
      details: {
        totalAmount: `৳${total.toLocaleString()}`,
        itemsCount: cartItems.reduce((acc, i) => acc + i.quantity, 0),
        deliveryArea: deliveryArea === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod === 'bkash' ? 'bKash' : 'Nagad',
        trxId: paymentMethod !== 'cod' ? trxId.trim() : undefined,
        senderNumber: paymentMethod !== 'cod' ? senderPhone.trim() : undefined,
        address: customerAddress,
        orderNotes: orderNotes.trim() || undefined,
        cartItemsJson: JSON.stringify(
          cartItems.map((i) => ({
            productName: i.product.nameBn,
            quantity: i.quantity,
            price: i.product.price,
            originalPrice: i.product.originalPrice || (i.product.discountPercent ? Math.round(i.product.price / (1 - i.product.discountPercent / 100)) : i.product.price),
            discountPercent: i.product.discountPercent || (i.product.originalPrice && i.product.originalPrice > i.product.price ? Math.round(((i.product.originalPrice - i.product.price) / i.product.originalPrice) * 100) : 0),
            unit: i.product.unit || (i.product.nameBn.toLowerCase().includes('গ্রাম') || i.product.nameBn.toLowerCase().includes('gm') ? 'GM' : i.product.nameBn.toLowerCase().includes('কেজি') || i.product.nameBn.toLowerCase().includes('kg') ? 'KG' : 'Pcs'),
            weightAmount: i.product.quantity || (i.product.nameBn.toLowerCase().includes('গ্রাম') ? '500' : '1'),
          }))
        ),
      },
    });

    setIsSuccess(true);
    setTimeout(() => {
      onClearCart();
      setIsSuccess(false);
      setIsCheckingOut(false);
      setTrxId('');
      setSenderPhone('');
      setOrderNotes('');
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-neutral-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-neutral-900">
              {isBn ? 'আপনার শপিং ব্যাগ' : 'Shopping Bag'}
            </h2>
            <span className="text-xs font-mono tabular-nums text-neutral-500">
              ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} {isBn ? 'টি পণ্য' : 'items'})
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isSuccess ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {isBn ? 'অর্ডার সফলভাবে গৃহীত হয়েছে!' : 'Order Placed Successfully!'}
              </h3>
              <p className="text-xs text-neutral-600 max-w-xs mx-auto leading-relaxed">
                {isBn
                  ? `ধন্যবাদ ${customerName}! আপনার অর্ডারটি কনফার্ম হয়েছে। দ্রুত ডেলিভারি করার জন্য আমাদের টিম থেকে কল দেওয়া হবে।`
                  : `Thank you ${customerName}! Your order has been placed into the Studio Inbox.`}
              </p>
            </div>
          ) : isCheckingOut ? (
            <form onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  {isBn ? 'ডেলিভারি তথ্য ও ঠিকানা' : 'Delivery & Address'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline"
                >
                  {isBn ? 'ব্যাগে ফিরে যান' : 'Back to Cart'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isBn ? 'আপনার পূর্ণ নাম *' : 'Full Name *'}
                </label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isBn ? 'মোবাইল নম্বর *' : 'Phone Number *'}
                </label>
                <input
                  required
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder=""
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-800"
                />
              </div>

              {/* Delivery Zone Selector */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{isBn ? 'ডেলিভারি এলাকা নির্বাচন করুন:' : 'Delivery Location:'}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryArea('dhaka')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      deliveryArea === 'dhaka'
                        ? 'text-white font-semibold shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                    style={deliveryArea === 'dhaka' ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
                  >
                    <div className="font-semibold">{isBn ? 'ঢাকা শহর' : 'Inside Dhaka'}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">৳{feeDhaka} {isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryArea('outside')}
                    className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                      deliveryArea === 'outside'
                        ? 'text-white font-semibold shadow-sm'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                    }`}
                    style={deliveryArea === 'outside' ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined}
                  >
                    <div className="font-semibold">{isBn ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">৳{feeOutside} {isBn ? 'ডেলিভারি চার্জ' : 'Delivery Fee'}</div>
                  </button>
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  {isBn ? 'সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/জেলা) *' : 'Delivery Address *'}
                </label>
                <textarea
                  required
                  rows={2}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder={
                    isBn
                      ? 'বাড়ি নং, রোড নং, এলাকা, থানা, জেলা...'
                      : 'Apartment, road, area, district...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none"
                />
              </div>

              {/* Order Notes / Special Instructions */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1 flex items-center justify-between">
                  <span>{isBn ? 'অর্ডার নোট / বিশেষ নির্দেশাবলী (ঐচ্ছিক)' : 'Order Notes / Special Instructions (Optional)'}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">{isBn ? 'ঐচ্ছিক' : 'Optional'}</span>
                </label>
                <textarea
                  rows={2}
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder={
                    isBn
                      ? 'বিশেষ নির্দেশাবলী বা পছন্দের রঙ/সাইজ লিখে দিন...'
                      : 'Note about your order, e.g. special delivery instructions...'
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 focus:outline-none focus:ring-1 focus:ring-amber-800 resize-none placeholder:text-neutral-400"
                />
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                  {isBn ? 'পেমেন্ট মেথড নির্বাচন করুন:' : 'Payment Method:'}
                </label>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-bold shadow-2xs ring-1 ring-emerald-700'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold">{isBn ? 'ক্যাশ অন ডেলিভারি' : 'Cash on Del.'}</span>
                    <span className="text-[9px] text-neutral-500 font-normal">{isBn ? 'পণ্য হাতে পেয়ে টাকা' : 'COD'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bkash')}
                    className={`py-2 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-600 bg-pink-50 text-pink-950 font-bold shadow-2xs ring-1 ring-pink-600'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-pink-600">বিকাশ (bKash)</span>
                    <span className="text-[9px] text-pink-800/80 font-normal">{bkashType === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('nagad')}
                    className={`py-2 px-1.5 rounded-lg border text-center transition-all cursor-pointer ${
                      paymentMethod === 'nagad'
                        ? 'border-orange-600 bg-orange-50 text-orange-950 font-bold shadow-2xs ring-1 ring-orange-600'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="block text-[11px] font-bold text-orange-600">নগদ (Nagad)</span>
                    <span className="text-[9px] text-orange-800/80 font-normal">{nagadType === 'merchant' ? 'মার্চেন্ট' : 'পার্সোনাল'}</span>
                  </button>
                </div>
              </div>

              {/* bKash Payment Details & TrxID Input Box */}
              {paymentMethod === 'bkash' && (
                <div className="p-3 rounded-xl bg-pink-50/70 border border-pink-200 space-y-2.5 text-xs text-neutral-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-pink-200/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-pink-600 animate-pulse" />
                      <span className="font-bold text-pink-900">বিকাশ পেমেন্ট তথ্য</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-200/80 text-pink-900 uppercase">
                      {bkashType === 'merchant' ? 'Payment (মার্চেন্ট)' : 'Send Money (পার্সোনাল)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-2 rounded-lg border border-pink-200">
                    <div>
                      <div className="text-[10px] text-neutral-500">বিকাশ নম্বর ({bkashType}):</div>
                      <div className="font-mono font-black text-sm text-pink-700 tracking-wider">
                        {bkashNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(bkashNumber, 'bkash')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-pink-600 hover:bg-pink-700 text-white text-[10.5px] font-semibold transition-colors cursor-pointer"
                    >
                      {copiedType === 'bkash' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10.5px] text-pink-900/90 leading-tight">
                    👉 উপরের নম্বরে মোট <strong>৳{total.toLocaleString()}</strong> টাকা {bkashType === 'merchant' ? 'Make Payment' : 'Send Money'} করে নিচের দুটি তথ্য দিন:
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-0.5">
                        যে বিকাশ নম্বর থেকে টাকা পাঠিয়েছেন *
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder=""
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-pink-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-pink-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-0.5">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder=""
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-pink-300 bg-white font-mono uppercase font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-pink-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Nagad Payment Details & TrxID Input Box */}
              {paymentMethod === 'nagad' && (
                <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200 space-y-2.5 text-xs text-neutral-800 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-orange-200/80 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
                      <span className="font-bold text-orange-900">নগদ পেমেন্ট তথ্য</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-200/80 text-orange-900 uppercase">
                      {nagadType === 'merchant' ? 'Payment (মার্চেন্ট)' : 'Send Money (পার্সোনাল)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-white px-2.5 py-2 rounded-lg border border-orange-200">
                    <div>
                      <div className="text-[10px] text-neutral-500">নগদ নম্বর ({nagadType}):</div>
                      <div className="font-mono font-black text-sm text-orange-700 tracking-wider">
                        {nagadNumber}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyNumber(nagadNumber, 'nagad')}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-[10.5px] font-semibold transition-colors cursor-pointer"
                    >
                      {copiedType === 'nagad' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>কপি হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>কপি</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-[10.5px] text-orange-900/90 leading-tight">
                    👉 উপরের নম্বরে মোট <strong>৳{total.toLocaleString()}</strong> টাকা {nagadType === 'merchant' ? 'Payment' : 'Send Money'} করে নিচের দুটি তথ্য দিন:
                  </p>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-0.5">
                        যে নগদ নম্বর থেকে টাকা পাঠিয়েছেন *
                      </label>
                      <input
                        type="tel"
                        required
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="যেমন: 018XXXXXXXX"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-orange-300 bg-white font-mono focus:outline-none focus:ring-1 focus:ring-orange-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-800 mb-0.5">
                        Transaction ID (TrxID) *
                      </label>
                      <input
                        type="text"
                        required
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                        placeholder="যেমন: 7K92M4L1P"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-orange-300 bg-white font-mono uppercase font-bold text-neutral-900 focus:outline-none focus:ring-1 focus:ring-orange-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Cost Summary Box */}
              <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>{isBn ? 'পণ্য মূল্য:' : 'Subtotal:'}</span>
                  <span className="font-mono tabular-nums">৳{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>{isBn ? 'হোম ডেলিভারি চার্জ:' : 'Delivery Fee:'}</span>
                  <span className="font-mono tabular-nums">৳{deliveryFee}</span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 pt-1.5 border-t border-neutral-200 text-sm">
                  <span>{isBn ? 'সর্বমোট প্রদেয় বিল:' : 'Total Amount:'}</span>
                  <span className="font-mono tabular-nums">৳{total.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-transform active:scale-98 cursor-pointer hover:brightness-105"
                style={{ 
                  backgroundColor: theme.primary,
                  boxShadow: `0 8px 24px ${theme.primary}40`
                }}
              >
                {isBn ? `অর্ডার নিশ্চিত করুন (৳${total.toLocaleString()})` : `Confirm Order (৳${total.toLocaleString()})`}
              </button>
            </form>
          ) : cartItems.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-300 mx-auto" />
              <p className="text-xs text-neutral-500 font-medium">
                {isBn ? 'আপনার শপিং ব্যাগ বর্তমানে খালি' : 'Your bag is empty'}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition-colors"
              >
                {isBn ? 'ড্রাই ফ্রুটস ও পোশাক পছন্দ করুন' : 'Browse Dry Fruits & Goods'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product.id}
                  className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-neutral-900 truncate">
                      {isBn ? product.nameBn : product.nameEn}
                    </h4>
                    <div className="text-neutral-500 font-mono tabular-nums mt-0.5">
                      {product.currency} {product.price.toLocaleString()}
                    </div>
                  </div>

                  {/* Quantity control */}
                  <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(product.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 font-bold"
                    >
                      -
                    </button>
                    <span className="w-5 text-center font-mono tabular-nums font-semibold text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(product.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-neutral-600 hover:text-neutral-900 font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                    title={isBn ? 'মুছে ফেলুন' : 'Remove'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Subtotal / Proceed to Checkout Footer */}
        {!isCheckingOut && !isSuccess && cartItems.length > 0 && (
          <div className="p-6 border-t border-neutral-200 bg-neutral-50 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>{isBn ? 'পণ্য মূল্য:' : 'Subtotal:'}</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900">
                  ৳{subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{isBn ? 'আনুমানিক ডেলিভারি:' : 'Est. Delivery:'}</span>
                <span className="font-mono tabular-nums font-semibold text-neutral-900">
                  ৳{deliveryFee}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>{isBn ? 'মোট প্রদেয়:' : 'Total:'}</span>
                <span className="font-mono tabular-nums">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckingOut(true)}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer hover:brightness-105"
              style={{ 
                backgroundColor: theme.primary,
                boxShadow: `0 8px 24px ${theme.primary}40`
              }}
            >
              <span>{isBn ? 'অর্ডার করতে এগিয়ে যান' : 'Proceed to Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
