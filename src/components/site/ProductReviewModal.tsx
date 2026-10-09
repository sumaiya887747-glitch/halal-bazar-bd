import React, { useState } from 'react';
import { ProductItem } from '../../types/website';
import { X, Star, Send, Heart, CheckCircle2 } from 'lucide-react';

interface ProductReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductItem[];
  onSubmitReview: (reviewData: {
    author: string;
    comment: string;
    rating: number;
    productName?: string;
    location?: string;
  }) => void;
  language: 'bn' | 'en';
}

export const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
  isOpen,
  onClose,
  products,
  onSubmitReview,
  language,
}) => {
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [location, setLocation] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const isBn = language === 'bn';

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      alert(isBn ? 'আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }
    if (!comment.trim()) {
      alert(isBn ? 'আপনার অভিজ্ঞতা ও মতামত লিখুন' : 'Please enter your feedback');
      return;
    }

    onSubmitReview({
      author,
      comment,
      rating,
      productName: selectedProduct || undefined,
      location: location || undefined,
    });

    setAuthor('');
    setComment('');
    setRating(5);
    setSelectedProduct('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 md:p-5 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto border border-neutral-100 transform transition-all animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isBn ? 'আপনার মতামত ও রিভিউ প্রদান করুন' : 'Write a Product Review'}
              </h3>
              <p className="text-xs text-emerald-200">
                {isBn ? 'আপনার অভিজ্ঞতা অন্য গ্রাহকদের সাহায্য করবে' : 'Your feedback matters to us'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-4">
          
          {/* Star Rating Picker */}
          <div className="text-center space-y-1.5 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
            <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              {isBn ? 'আপনার রেটিং সিলেক্ট করুন:' : 'Select Star Rating:'}
            </label>
            <div className="flex items-center justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transform hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                        : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-amber-800 block">
              {rating === 5 && (isBn ? '🌟 চমৎকার ও অসাধারণ!' : '5 Stars - Excellent')}
              {rating === 4 && (isBn ? '👍 খুব ভালো' : '4 Stars - Very Good')}
              {rating === 3 && (isBn ? '🙂 ভালো' : '3 Stars - Good')}
              {rating < 3 && (isBn ? 'মোটামুটি' : 'Below Average')}
            </span>
          </div>

          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {isBn ? 'কোন পণ্যটির রিভিউ দিচ্ছেন?' : 'Which Product did you buy?'}
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 outline-none text-sm font-medium bg-white"
            >
              <option value="">-- {isBn ? 'সাধারণ কেনাকাটার অভিজ্ঞতা' : 'General Store Experience'} --</option>
              {products.map((p) => (
                <option key={p.id} value={isBn ? p.nameBn : p.nameEn}>
                  {isBn ? p.nameBn : p.nameEn} (৳{p.price})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isBn ? 'আপনার নাম *' : 'Your Name *'}
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={isBn ? 'যেমন: মোহাম্মদ রফিক' : 'e.g. Mohammad Rafiq'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1">
                {isBn ? 'আপনার জেলা / এলাকা' : 'Your Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={isBn ? 'যেমন: ঢাকা / চট্টগ্রাম' : 'e.g. Dhaka'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              {isBn ? 'আপনার সুন্দর রিভিউ ও অনুভূতি লিখুন *' : 'Write your Review *'}
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={isBn ? 'পণ্যের কোয়ালিটি, প্যাকিং এবং ডেলিভারির ব্যাপারে আপনার অনুভূতি লিখুন...' : 'Write your thoughts about product quality and delivery...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-emerald-600 outline-none text-sm font-medium resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white font-extrabold text-base shadow-lg shadow-emerald-800/20 flex items-center justify-center gap-2 transition-all"
          >
            <Send className="w-4 h-4 text-amber-300" />
            <span>{isBn ? 'রিভিউ জমা দিন' : 'Submit Review'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
