import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { ColorTheme, Language, PricingPlan } from '../../types/website';

interface PricingSectionProps {
  pricing: PricingPlan[];
  titleBn?: string;
  titleEn?: string;
  theme: ColorTheme;
  language: Language;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  pricing,
  titleBn = 'স্বচ্ছ ও সাশ্রয়ী মূল্যতালিকা',
  titleEn = 'Transparent Pricing Plans',
  theme,
  language,
}) => {
  const [isYearly, setIsYearly] = useState(false);
  const isBn = language === 'bn';

  const handleCta = (plan: PricingPlan) => {
    const contactEl = document.getElementById('contact');
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-24 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"
            style={{ textWrap: 'balance' }}
          >
            {isBn ? titleBn : titleEn}
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 mt-2">
            {isBn
              ? 'লুকানো কোনো ফি নেই। আপনার প্রয়োজনের সাথে মানানসই প্ল্যান বেছে নিন।'
              : 'Predictable pricing without hidden fees. Upgrade or cancel anytime.'}
          </p>

          {/* Billing Frequency Toggle */}
          <div className="mt-6 inline-flex items-center p-1 bg-neutral-100 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                !isYearly ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isBn ? 'মাসিক বিলিং' : 'Monthly'}
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                isYearly ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              {isBn ? 'বার্ষিক বিলিং (২০% সাশ্রয়)' : 'Annual (Save 20%)'}
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {pricing.map((plan) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`p-6 sm:p-8 rounded-xl border flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'border-neutral-900 ring-1 ring-neutral-900 shadow-md bg-neutral-50/50'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-neutral-900">
                      {isBn ? plan.nameBn : plan.nameEn}
                    </h3>
                    {plan.isPopular && (
                      <span className="text-[11px] font-semibold tracking-wide uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {isBn ? 'সবচেয়ে জনপ্রিয়' : 'Recommended'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-600 mb-6">
                    {isBn ? plan.descBn : plan.descEn}
                  </p>

                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-neutral-900">
                      ${price}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {price === 0
                        ? ''
                        : isBn
                        ? isYearly ? '/প্রতি বছর' : '/প্রতি মাস'
                        : isYearly ? '/year' : '/month'}
                    </span>
                  </div>

                  {/* Feature List */}
                  <ul className="space-y-3 pt-6 border-t border-neutral-200/80 text-xs text-neutral-700">
                    {(isBn ? plan.featuresBn : plan.featuresEn).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 pt-6">
                  <button
                    onClick={() => handleCta(plan)}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      plan.isPopular
                        ? 'text-white shadow-sm'
                        : 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50'
                    }`}
                    style={plan.isPopular ? { backgroundColor: theme.primary } : undefined}
                  >
                    {isBn ? plan.ctaTextBn : plan.ctaTextEn}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
