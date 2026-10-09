import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Code2,
  Globe,
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { ColorTheme, Language, WebsiteData } from '../../types/website';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteData: WebsiteData;
  theme: ColorTheme;
  language: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  siteData,
  theme,
  language,
}) => {
  const [copied, setCopied] = useState(false);
  const [exportType, setExportType] = useState<'html' | 'react'>('html');
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const siteName = isBn ? siteData.nameBn : siteData.nameEn;
  const siteTagline = isBn ? siteData.taglineBn : siteData.taglineEn;
  const heroHeadline = isBn ? siteData.heroHeadlineBn : siteData.heroHeadlineEn;
  const heroSubheadline = isBn ? siteData.heroSubheadlineBn : siteData.heroSubheadlineEn;
  const ctaPrimary = isBn ? siteData.heroCtaPrimaryBn : siteData.heroCtaPrimaryEn;

  // Generate self-contained standalone HTML file
  const generatedHtml = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName} - ${siteTagline}</title>
  <meta name="description" content="${heroSubheadline}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif;
      scroll-behavior: smooth;
    }
  </style>
</head>
<body class="bg-neutral-50 text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white">

  <!-- Top Bar Navigation (Strict 3-Zone Contract) -->
  <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Zone 1: Single text element wordmark -->
      <a href="#" class="text-lg font-bold tracking-tight text-neutral-900">
        ${siteName}
      </a>

      <!-- Zone 2: Clean text navigation links -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
        ${siteData.navItems
          .map(
            (item) => `
        <a href="${item.href}" class="hover:text-neutral-900 transition-colors">${
              isBn ? item.labelBn : item.labelEn
            }</a>`
          )
          .join('')}
      </nav>

      <!-- Zone 3: 1-2 primary actions -->
      <div class="flex items-center gap-3">
        <a href="#contact" class="px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap" style="background-color: ${
          theme.primary
        }">
          ${ctaPrimary}
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden bg-white border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-12 gap-12 items-center">
        <div class="lg:col-span-7 space-y-6">
          <div class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            <span>${isBn ? siteData.aboutBadgeBn : siteData.aboutBadgeEn}</span>
          </div>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 leading-[1.15]" style="text-wrap: balance;">
            ${heroHeadline}
          </h1>
          <p class="text-base md:text-lg text-neutral-600 max-w-xl leading-relaxed">
            ${heroSubheadline}
          </p>
          <div class="pt-2 flex flex-wrap items-center gap-4">
            <a href="#contact" class="px-6 py-3 text-sm font-semibold text-white rounded-lg transition-transform active:scale-95 shadow-sm" style="background-color: ${
              theme.primary
            }">
              ${ctaPrimary}
            </a>
            <a href="#services" class="px-6 py-3 text-sm font-semibold text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors">
              ${isBn ? siteData.heroCtaSecondaryBn : siteData.heroCtaSecondaryEn}
            </a>
          </div>
        </div>
        <div class="lg:col-span-5">
          <div class="relative rounded-2xl overflow-hidden aspect-[4/3] bg-neutral-100 border border-neutral-200 shadow-xl">
            <img src="${siteData.heroImage}" alt="${siteName}" class="w-full h-full object-cover">
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Metrics Section -->
  <section class="py-12 bg-neutral-50 border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        ${siteData.metrics
          .map(
            (m) => `
        <div>
          <div class="text-3xl md:text-4xl font-bold text-neutral-900 font-mono tabular-nums tracking-tight">
            ${m.value}
          </div>
          <div class="text-xs md:text-sm text-neutral-600 mt-1">
            ${isBn ? m.labelBn : m.labelEn}
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Services Section -->
  <section id="services" class="py-20 bg-white border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="max-w-2xl mb-12">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          ${isBn ? siteData.servicesSectionTitleBn : siteData.servicesSectionTitleEn}
        </h2>
        <p class="text-sm md:text-base text-neutral-600 mt-2">
          ${isBn ? siteData.servicesSectionDescBn : siteData.servicesSectionDescEn}
        </p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${siteData.services
          .map(
            (srv) => `
        <div class="p-6 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
          <div class="text-xs font-mono font-bold text-neutral-400 mb-3">${srv.number}</div>
          <h3 class="text-lg font-bold text-neutral-900 mb-2">
            ${isBn ? srv.titleBn : srv.titleEn}
          </h3>
          <p class="text-xs md:text-sm text-neutral-600 leading-relaxed">
            ${isBn ? srv.descBn : srv.descEn}
          </p>
          ${
            srv.metric
              ? `
          <div class="mt-4 pt-4 border-t border-neutral-200/80 flex items-center justify-between">
            <span class="text-xs text-neutral-500">${
              isBn ? srv.metricLabelBn : srv.metricLabelEn
            }</span>
            <span class="text-xs font-mono font-bold text-neutral-900 tabular-nums">${
              srv.metric
            }</span>
          </div>`
              : ''
          }
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  ${
    siteData.products && siteData.products.length > 0
      ? `
  <!-- Products Section -->
  <section id="products" class="py-20 bg-white border-b border-neutral-200">
    <div class="max-w-7xl mx-auto px-6">
      <div class="max-w-2xl mb-12">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900">
          ${isBn ? siteData.productsSectionTitleBn || 'পণ্যসম্ভার' : siteData.productsSectionTitleEn || 'Products'}
        </h2>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${siteData.products
          .map(
            (prod) => `
        <div class="p-5 rounded-xl border border-neutral-200 flex flex-col justify-between">
          <div>
            ${
              prod.image
                ? `<div class="rounded-lg overflow-hidden aspect-[4/3] bg-neutral-100 mb-4 border border-neutral-200"><img src="${prod.image}" alt="${prod.nameBn}" class="w-full h-full object-cover"></div>`
                : ''
            }
            <div class="text-xs text-neutral-500 mb-1">${isBn ? prod.categoryBn : prod.categoryEn} · ★ ${prod.rating}</div>
            <h3 class="text-base font-bold text-neutral-900 mb-1">${isBn ? prod.nameBn : prod.nameEn}</h3>
            <p class="text-xs text-neutral-600 mb-4">${isBn ? prod.descBn : prod.descEn}</p>
          </div>
          <div class="pt-3 border-t border-neutral-100 flex items-center justify-between">
            <span class="text-lg font-bold font-mono text-neutral-900">${prod.currency} ${prod.price}</span>
            <button onclick="alert('${isBn ? 'পণ্যটি ব্যাগে যুক্ত হয়েছে!' : 'Added to bag!' }')" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800">
              ${isBn ? 'ব্যাগে নিন' : 'Add to Bag'}
            </button>
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>`
      : ''
  }

  <!-- Interactive Contact Section -->
  <section id="contact" class="py-20 bg-neutral-900 text-white">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid lg:grid-cols-12 gap-12">
        <div class="lg:col-span-5 space-y-6">
          <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
            ${isBn ? siteData.contactTitleBn : siteData.contactTitleEn}
          </h2>
          <p class="text-sm text-neutral-400 leading-relaxed">
            ${isBn ? siteData.contactDescBn : siteData.contactDescEn}
          </p>
          <div class="space-y-3 pt-4 text-xs md:text-sm text-neutral-300">
            <div><strong>Email:</strong> ${siteData.contactEmail}</div>
            <div><strong>Phone:</strong> ${siteData.contactPhone}</div>
            <div><strong>Address:</strong> ${
              isBn ? siteData.contactAddressBn : siteData.contactAddressEn
            }</div>
          </div>
        </div>
        <div class="lg:col-span-7 bg-neutral-800 p-8 rounded-2xl border border-neutral-700">
          <form onsubmit="event.preventDefault(); alert('${
            isBn ? 'আপনার বার্তা সফলভাবে পৌঁছেছে!' : 'Thank you! Your message has been sent.'
          }'); this.reset();" class="space-y-4">
            <div class="grid md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">${
                  isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'
                }</label>
                <input required type="text" class="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400">
              </div>
              <div>
                <label class="block text-xs font-medium text-neutral-300 mb-1">${
                  isBn ? 'ইমেইল অ্যাড্রেস' : 'Email Address'
                }</label>
                <input required type="email" class="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400">
              </div>
            </div>
            <div>
              <label class="block text-xs font-medium text-neutral-300 mb-1">${
                isBn ? 'বার্তা বা প্রজেক্ট বিবরণ' : 'Message or Project Scope'
              }</label>
              <textarea required rows="4" class="w-full px-4 py-2.5 rounded-lg bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-amber-400"></textarea>
            </div>
            <button type="submit" class="w-full py-3 px-6 rounded-lg font-semibold text-neutral-950 bg-amber-400 hover:bg-amber-300 transition-colors text-sm">
              ${isBn ? 'মেসেজ পাঠান' : 'Submit Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>

  <!-- Quiet Footer -->
  <footer class="py-8 bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800">
    <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="font-bold text-white tracking-tight">${siteName}</div>
      <div>${isBn ? siteData.footerTextBn : siteData.footerTextEn}</div>
      <div>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</div>
    </div>
  </footer>

</body>
</html>`;

  const handleDownload = () => {
    const blob = new Blob([generatedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${siteData.id}_website_index.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-500" />
              <span>{isBn ? 'ওয়েবসাইট কোড ও ফাইল এক্সপোর্ট' : 'Export Ready Website'}</span>
            </h2>
            <p className="text-xs text-neutral-500 mt-1">
              {isBn
                ? 'এক ক্লিকে সম্পূর্ণ এইচটিএমএল ফাইল ডাউনলোড করুন অথবা হোস্টিংয়ের জন্য কোড কপি করুন'
                : 'Download standalone HTML file or copy production-ready code'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Action Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={handleDownload}
              className="p-4 rounded-xl border-2 border-neutral-900 bg-neutral-900 text-white flex items-center gap-4 hover:bg-neutral-800 transition-all text-left shadow-sm group"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-bold shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm">
                  {isBn ? 'index.html ডাউনলোড করুন' : 'Download index.html'}
                </div>
                <div className="text-xs text-neutral-300 mt-0.5">
                  {isBn ? 'সম্পূর্ণ স্বয়ংসম্পূর্ণ ফাইল, ডাবল-ক্লিকেই চালু হবে' : 'Self-contained ready to deploy'}
                </div>
              </div>
            </button>

            <button
              onClick={handleCopy}
              className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-900 flex items-center gap-4 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-700 shrink-0">
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </div>
              <div>
                <div className="font-bold text-sm">
                  {copied
                    ? isBn ? 'কোড কপি হয়েছে!' : 'Copied to Clipboard!'
                    : isBn ? 'এইচটিএমএল কোড কপি করুন' : 'Copy HTML Code'}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {isBn ? 'ক্লিপবোর্ডে কপি করে যেকোনো ফাইলে পেস্ট করুন' : 'Paste into your code editor'}
                </div>
              </div>
            </button>
          </div>

          {/* Hosting Guide */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <Globe className="w-4 h-4 text-amber-600" />
              <span>{isBn ? 'কীভাবে ফ্রিতে আপনার ওয়েবসাইট লাইভ করবেন?' : 'How to host your website for free:'}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-amber-900/90 pl-1 leading-relaxed">
              <li>{isBn ? 'উপরের বাটনে ক্লিক করে index.html ফাইলটি ডাউনলোড করুন।' : 'Download index.html above.'}</li>
              <li>{isBn ? 'Netlify Drop (app.netlify.com/drop) বা Vercel এ যান।' : 'Open Netlify Drop (app.netlify.com/drop) or Vercel.'}</li>
              <li>{isBn ? 'ফাইলটি ড্রপ করলেই আপনার ওয়েবসাইট সরাসরি বিশ্বজুড়ে লাইভ হয়ে যাবে!' : 'Drag & drop the file to publish instantly with your own free link!'}</li>
            </ol>
          </div>

          {/* Code Preview Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span className="font-mono">{siteData.id}_website_index.html</span>
              <span>Tailwind CSS CDN + Mobile Responsive</span>
            </div>
            <pre className="p-4 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-xs overflow-x-auto max-h-60 border border-neutral-800 leading-relaxed">
              {generatedHtml}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {isBn ? 'ক্লিন ও পারফরম্যান্ট কোড আর্কিটেকচার' : 'Clean & high-performance architecture'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
