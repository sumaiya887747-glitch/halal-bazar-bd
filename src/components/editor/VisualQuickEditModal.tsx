import React, { useState, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { QuickEditTarget, AdminTab } from '../../types/admin';
import { ProductItem } from '../../types/website';

interface VisualQuickEditModalProps {
  target: QuickEditTarget | null;
  onClose: () => void;
  onSave: (field: string, newValue: any, productId?: string) => Promise<void> | void;
  onNavigateToAdminTab?: (tab: AdminTab) => void;
  products?: ProductItem[];
}

export const VisualQuickEditModal: React.FC<VisualQuickEditModalProps> = ({
  target,
  onClose,
  onSave,
  onNavigateToAdminTab,
  products = [],
}) => {
  const [textValue, setTextValue] = useState<string>('');
  const [secondaryTextValue, setSecondaryTextValue] = useState<string>('');
  const [numberValue, setNumberValue] = useState<number>(0);
  const [toggleValue, setToggleValue] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [faqData, setFaqData] = useState<{
    questionBn: string;
    answerBn: string;
  }>({
    questionBn: '',
    answerBn: '',
  });
  const [productData, setProductData] = useState<{
    nameBn: string;
    nameEn: string;
    price: number;
    originalPrice: number;
    inStock: boolean;
    image: string;
  }>({
    nameBn: '',
    nameEn: '',
    price: 0,
    originalPrice: 0,
    inStock: true,
    image: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!target) return;
    setErrorMsg(null);
    setIsSaving(false);

    if (target.type === 'faq' || target.field === 'faqItem' || target.field === 'faqQuestion' || target.field === 'faqAnswer') {
      setFaqData({
        questionBn: typeof target.value === 'string' ? target.value : (target.value?.questionBn || ''),
        answerBn: typeof target.secondaryValue === 'string' ? target.secondaryValue : (target.value?.answerBn || ''),
      });
    } else if (target.type === 'product' && target.productId) {
      const prod = products.find((p) => p.id === target.productId);
      if (prod) {
        setProductData({
          nameBn: prod.nameBn || '',
          nameEn: prod.nameEn || '',
          price: prod.price || 0,
          originalPrice: prod.originalPrice || prod.price || 0,
          inStock: prod.inStock !== false,
          image: prod.image || '',
        });
        setImagePreview(prod.image || '');
      }
    } else if (target.type === 'image') {
      setImagePreview(typeof target.value === 'string' ? target.value : '');
      setTextValue(typeof target.value === 'string' ? target.value : '');
    } else if (target.type === 'number') {
      setNumberValue(typeof target.value === 'number' ? target.value : Number(target.value) || 0);
    } else if (target.type === 'toggle') {
      setToggleValue(Boolean(target.value));
    } else {
      setTextValue(typeof target.value === 'string' ? target.value : String(target.value || ''));
      if (target.secondaryValue !== undefined) {
        setSecondaryTextValue(String(target.secondaryValue || ''));
      }
    }
  }, [target, products]);

  if (!target) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setImagePreview(base64);
          setTextValue(base64);
          if (target.type === 'product') {
            setProductData((prev) => ({ ...prev, image: base64 }));
          }
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);

    try {
      const itemIdentifier = target.productId || (target.slideIndex !== undefined ? String(target.slideIndex) : undefined);
      if (target.type === 'faq' || target.field === 'faqItem' || target.field === 'faqQuestion' || target.field === 'faqAnswer') {
        await onSave('faqItem', faqData, target.productId || itemIdentifier);
      } else if (target.type === 'product' && target.productId) {
        await onSave(target.field, productData, target.productId);
      } else if (target.type === 'image') {
        await onSave(target.field, imagePreview || textValue, itemIdentifier);
      } else if (target.type === 'number') {
        await onSave(target.field, Number(numberValue), itemIdentifier);
      } else if (target.type === 'toggle') {
        await onSave(target.field, toggleValue, itemIdentifier);
      } else {
        if (target.secondaryValue !== undefined) {
          await onSave(target.field, { primary: textValue, secondary: secondaryTextValue }, itemIdentifier);
        } else {
          await onSave(target.field, textValue, itemIdentifier);
        }
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving quick edit:', err);
      setErrorMsg('সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-sm font-bold">
              <Sparkles className="w-4 h-4 text-neutral-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-neutral-900 text-sm sm:text-base leading-tight">
                {target.title}
              </h3>
              <p className="text-[11px] text-neutral-500 font-medium">
                সরাসরি লাইভ প্রিভিউতে পরিবর্তন করুন
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PRODUCT EDITING */}
          {target.type === 'product' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  পণ্যের নাম (বাংলা)
                </label>
                <input
                  type="text"
                  value={productData.nameBn}
                  onChange={(e) => setProductData({ ...productData, nameBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm outline-none font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    বিক্রয় মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    value={productData.price}
                    onChange={(e) => setProductData({ ...productData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-bold font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1">
                    পূর্বের/রেগুলার মূল্য (টাকা)
                  </label>
                  <input
                    type="number"
                    value={productData.originalPrice}
                    onChange={(e) => setProductData({ ...productData, originalPrice: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={productData.inStock}
                    onChange={(e) => setProductData({ ...productData, inStock: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-neutral-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-bold text-neutral-900 text-xs block">স্টক স্ট্যাটাস</span>
                    <span className="text-[11px] text-neutral-500">
                      {productData.inStock ? '✅ ইন স্টক (গ্রাহক অর্ডার করতে পারবে)' : '❌ স্টক আউট (অর্ডার বন্ধ)'}
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  পণ্যের ছবি
                </label>
                {imagePreview && (
                  <div className="mb-2 relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productData.image}
                    onChange={(e) => {
                      setProductData({ ...productData, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="ছবির লিংক (URL) অথবা ফাইল দিন"
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>আপলোড</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* IMAGE EDITING */}
          {target.type === 'image' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-700">
                {target.label || 'ছবি পরিবর্তন'}
              </label>

              {imagePreview ? (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 flex items-center justify-center group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-full h-32 rounded-2xl border-2 border-dashed border-neutral-300 flex flex-col items-center justify-center text-neutral-400">
                  <ImageIcon className="w-8 h-8 mb-1" />
                  <span className="text-xs">কোনো ছবি নির্বাচিত নেই</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-neutral-600">
                  ডিভাইস থেকে নতুন ছবি আপলোড করুন:
                </label>
                <label className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>ফোন বা কম্পিউটার থেকে ছবি সিলেক্ট করুন</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  অথবা সরাসরি ওয়েব লিংক (Image URL):
                </label>
                <input
                  type="text"
                  value={textValue}
                  onChange={(e) => {
                    setTextValue(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-xs outline-none"
                />
              </div>

              {/* Ready-made High Quality Presets for Hero Banner */}
              {(target.field === 'heroImage' || target.field === 'heroSlideImage') && (
                <div className="pt-2 border-t border-neutral-100 space-y-2">
                  <label className="block text-[11px] font-bold text-neutral-800">
                    ✨ অথবা প্রস্তুতকৃত প্রিমিয়াম ব্যানার থেকে এক-ক্লিকে সিলেক্ট করুন:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        title: '🥜 কাজুবাদাম ও ড্রাই ফ্রুটস',
                        url: 'https://images.unsplash.com/photo-1536591375315-1b836890327b?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        title: '👗 এক্সক্লুসিভ ফ্যাশন ও পোশাক',
                        url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        title: '🍯 খাঁটি মধু ও ঘি',
                        url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        title: '🌶️ প্রিমিয়াম গুঁড়া মসলা',
                        url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        title: '🌴 প্রিমিয়াম খেজুর ও নাটস',
                        url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80',
                      },
                      {
                        title: '🌿 অর্গানিক ফ্রেশ গ্রোসারি',
                        url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
                      },
                    ].map((preset, pIdx) => {
                      const isSelected = (imagePreview || textValue) === preset.url;
                      return (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => {
                            setImagePreview(preset.url);
                            setTextValue(preset.url);
                            setErrorMsg(null);
                          }}
                          className={`p-1.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-400'
                              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <span className="text-[10px] font-bold text-neutral-800 line-clamp-2">
                            {preset.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FAQ Q&A EDITING */}
          {(target.type === 'faq' || target.field === 'faqItem' || target.field === 'faqQuestion' || target.field === 'faqAnswer') && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-amber-900 font-medium">
                💡 প্রশ্ন এবং উত্তর উভয়টিই পরিবর্তন করে এক ক্লিকে সংরক্ষণ করুন।
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  প্রশ্ন (Question)
                </label>
                <input
                  type="text"
                  value={faqData.questionBn}
                  onChange={(e) => setFaqData({ ...faqData, questionBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-bold outline-none"
                  placeholder="প্রশ্ন লিখুন..."
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  উত্তর (Answer)
                </label>
                <textarea
                  rows={4}
                  value={faqData.answerBn}
                  onChange={(e) => setFaqData({ ...faqData, answerBn: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium outline-none leading-relaxed"
                  placeholder="বিস্তারিত উত্তর লিখুন..."
                  required
                />
              </div>
            </div>
          )}

          {/* TEXT EDITING */}
          {target.type === 'text' && !['faqQuestion', 'faqAnswer', 'faqItem'].includes(target.field) && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {target.label}
              </label>
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium outline-none"
                required
                autoFocus
              />
            </div>
          )}

          {/* TEXTAREA EDITING */}
          {target.type === 'textarea' && !['faqQuestion', 'faqAnswer', 'faqItem'].includes(target.field) && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {target.label}
              </label>
              <textarea
                rows={4}
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-medium outline-none leading-relaxed"
                required
                autoFocus
              />
            </div>
          )}

          {/* NUMBER EDITING */}
          {target.type === 'number' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {target.label}
              </label>
              <input
                type="number"
                value={numberValue}
                onChange={(e) => setNumberValue(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm font-mono font-bold outline-none"
                required
                autoFocus
              />
            </div>
          )}

          {/* TOGGLE EDITING */}
          {target.type === 'toggle' && (
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={toggleValue}
                  onChange={(e) => setToggleValue(e.target.checked)}
                  className="w-5 h-5 text-amber-500 rounded border-neutral-300 focus:ring-amber-400"
                />
                <div>
                  <span className="font-bold text-neutral-900 text-sm block">{target.label}</span>
                  <span className="text-xs text-neutral-500">
                    {toggleValue ? 'সক্রিয় (ওয়েবসাইটে প্রদর্শিত হবে)' : 'নিষ্ক্রিয় (ওয়েবসাইটে লুকানো থাকবে)'}
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {target.adminTabShortcut && onNavigateToAdminTab ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToAdminTab(target.adminTabShortcut!);
                }}
                className="text-[11px] font-bold text-neutral-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>সম্পূর্ণ এডমিন সেটিংসে যান</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 text-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-neutral-950 text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
