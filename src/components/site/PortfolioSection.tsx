import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ColorTheme, Language, PortfolioItem } from '../../types/website';

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
  titleBn?: string;
  titleEn?: string;
  theme: ColorTheme;
  language: Language;
}

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({
  portfolio,
  titleBn = 'নির্বাচিত প্রজেক্ট ও অর্জন',
  titleEn = 'Selected Client Work',
  theme,
  language,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const isBn = language === 'bn';

  const categories = ['all', ...Array.from(new Set(portfolio.map(p => isBn ? p.categoryBn : p.categoryEn)))];

  const filteredItems = filter === 'all'
    ? portfolio
    : portfolio.filter(p => (isBn ? p.categoryBn : p.categoryEn) === filter);

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-neutral-50/60 border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-neutral-900"
              style={{ textWrap: 'balance' }}
            >
              {isBn ? titleBn : titleEn}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2">
              {isBn
                ? 'বাস্তব ব্যবসায়িক প্রভাব ও পরিমাপযোগ্য ফলাফল নিশ্চিত করা প্রজেক্ট'
                : 'Measurable impact and engineering precision delivered for clients'}
            </p>
          </div>

          {/* Segmented Filter Control (Allowed functional interactive button control) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-200/70 rounded-lg text-xs font-medium self-start md:self-auto">
            {categories.map((cat) => {
              const isActive = filter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-neutral-900 shadow-xs font-semibold'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {cat === 'all' ? (isBn ? 'সব প্রজেক্ট' : 'All Work') : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Portfolio Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-6 sm:p-7 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Clean unboxed metadata */}
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                  <span>{isBn ? item.categoryBn : item.categoryEn}</span>
                  <span aria-hidden="true">·</span>
                  <span>{isBn ? item.clientBn : item.clientEn}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{item.year}</span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-bold text-neutral-900 leading-snug group-hover:text-neutral-700 transition-colors">
                    {isBn ? item.titleBn : item.titleEn}
                  </h3>
                  <div className="w-7 h-7 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-400 group-hover:text-neutral-900 group-hover:border-neutral-400 transition-colors shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Concrete quantified outcome statement */}
              <div className="mt-6 pt-4 border-t border-neutral-100 text-xs text-neutral-600 leading-relaxed font-medium">
                <span className="text-neutral-900 font-semibold block mb-0.5">
                  {isBn ? 'ফলাফল ও প্রভাব:' : 'Measured Outcome:'}
                </span>
                {isBn ? item.outcomeBn : item.outcomeEn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
