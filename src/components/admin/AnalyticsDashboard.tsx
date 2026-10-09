import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Calendar,
  Filter,
  Download,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  Truck,
  CreditCard,
  Percent,
  CheckCircle2,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { AdminOrder, AdminTab, OrderStatus } from '../../types/admin';
import { ProductItem } from '../../types/website';
import { parseOrderDate } from '../../utils/date';

interface AnalyticsDashboardProps {
  orders: AdminOrder[];
  products: ProductItem[];
  themePrimaryColor?: string;
  onNavigateToTab?: (tab: AdminTab) => void;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';
type MetricView = 'revenue' | 'orders' | 'both';
type ProductSortBy = 'revenue' | 'quantity';

const PALETTE = [
  '#059669', // Emerald
  '#0284c7', // Sky Blue
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#10b981', // Teal
  '#6366f1', // Indigo
  '#f97316', // Orange
];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  orders,
  products,
  themePrimaryColor = '#064e3b',
  onNavigateToTab,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [metricView, setMetricView] = useState<MetricView>('both');
  const [productSortBy, setProductSortBy] = useState<ProductSortBy>('revenue');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [hoveredSlice, setHoveredSlice] = useState<any | null>(null);

  // 1. Filter Orders by Time Range
  const filteredOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return orders.filter((o) => {
      const orderDate = parseOrderDate(o.createdAt);
      return orderDate >= cutoff;
    });
  }, [orders, timeRange]);

  // 2. Aggregate KPI Metrics
  const kpis = useMemo(() => {
    const totalOrdersCount = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedOrders = filteredOrders.filter(
      (o) => o.status === 'delivered' || o.status === 'confirmed'
    );
    const confirmedRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const pendingCount = filteredOrders.filter((o) => o.status === 'pending').length;
    const deliveredCount = filteredOrders.filter((o) => o.status === 'delivered').length;
    const aov = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    let totalUnitsSold = 0;
    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        totalUnitsSold += it.quantity || 1;
      });
    });

    const dhakaOrders = filteredOrders.filter((o) => o.deliveryArea === 'dhaka').length;
    const outsideOrders = filteredOrders.filter((o) => o.deliveryArea === 'outside').length;
    const dhakaPercent = totalOrdersCount > 0 ? Math.round((dhakaOrders / totalOrdersCount) * 100) : 0;
    const outsidePercent = totalOrdersCount > 0 ? 100 - dhakaPercent : 0;

    return {
      totalOrdersCount,
      totalRevenue,
      confirmedRevenue,
      pendingCount,
      deliveredCount,
      aov,
      totalUnitsSold,
      dhakaOrders,
      outsideOrders,
      dhakaPercent,
      outsidePercent,
    };
  }, [filteredOrders]);

  // 3. Time-series Day Buckets
  const timeSeriesData = useMemo(() => {
    const map = new Map<
      string,
      {
        dateKey: string;
        dateLabel: string;
        revenue: number;
        ordersCount: number;
        deliveredCount: number;
        pendingCount: number;
      }
    >();

    const daysToGenerate = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 30;
    const now = new Date();

    for (let i = daysToGenerate - 1; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      const dayNames = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
      const monthNames = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];

      const label = daysToGenerate <= 7
        ? `${dayNames[d.getDay()]} (${dd})`
        : `${dd} ${monthNames[d.getMonth()]}`;

      map.set(key, {
        dateKey: key,
        dateLabel: label,
        revenue: 0,
        ordersCount: 0,
        deliveredCount: 0,
        pendingCount: 0,
      });
    }

    filteredOrders.forEach((o) => {
      const orderDate = parseOrderDate(o.createdAt);
      const yyyy = orderDate.getFullYear();
      const mm = String(orderDate.getMonth() + 1).padStart(2, '0');
      const dd = String(orderDate.getDate()).padStart(2, '0');
      const key = `${yyyy}-${mm}-${dd}`;

      const existing = map.get(key);
      if (existing) {
        existing.revenue += o.total || 0;
        existing.ordersCount += 1;
        if (o.status === 'delivered') existing.deliveredCount += 1;
        if (o.status === 'pending') existing.pendingCount += 1;
      } else {
        // Fallback for orders created on dates not in the initial map
        map.set(key, {
          dateKey: key,
          dateLabel: `${dd}/${mm}`,
          revenue: o.total || 0,
          ordersCount: 1,
          deliveredCount: o.status === 'delivered' ? 1 : 0,
          pendingCount: o.status === 'pending' ? 1 : 0,
        });
      }
    });

    return Array.from(map.values());
  }, [filteredOrders, timeRange]);

  // 4. Top Selling Products
  const topProducts = useMemo(() => {
    const productStats = new Map<
      string,
      {
        id: string;
        name: string;
        category: string;
        image?: string;
        totalUnits: number;
        totalRevenue: number;
        currentStock?: boolean;
      }
    >();

    filteredOrders.forEach((o) => {
      o.items?.forEach((it) => {
        const pName = it.productName || 'অন্যান্য পণ্য';
        const matchedProduct = products.find(
          (p) => p.nameBn === pName || p.nameEn === pName || pName.includes(p.nameBn)
        );

        const key = matchedProduct?.id || pName;
        const existing = productStats.get(key);
        const itemQty = it.quantity || 1;
        const itemRevenue = (it.price || 0) * itemQty;

        if (existing) {
          existing.totalUnits += itemQty;
          existing.totalRevenue += itemRevenue;
        } else {
          productStats.set(key, {
            id: key,
            name: matchedProduct ? matchedProduct.nameBn : pName,
            category: matchedProduct ? matchedProduct.categoryBn : 'সাধারণ',
            image: matchedProduct?.image,
            totalUnits: itemQty,
            totalRevenue: itemRevenue,
            currentStock: matchedProduct ? matchedProduct.inStock : true,
          });
        }
      });
    });

    const list = Array.from(productStats.values());
    if (productSortBy === 'revenue') {
      list.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } else {
      list.sort((a, b) => b.totalUnits - a.totalUnits);
    }
    return list.slice(0, 8);
  }, [filteredOrders, products, productSortBy]);

  // 5. Payment Method Distribution
  const paymentDistribution = useMemo(() => {
    const pMap = {
      cod: { name: 'ক্যাশ অন ডেলিভারি (COD)', count: 0, revenue: 0, color: '#059669' },
      bkash: { name: 'বিকাশ (bKash)', count: 0, revenue: 0, color: '#e11d48' },
      nagad: { name: 'নগদ (Nagad)', count: 0, revenue: 0, color: '#ea580c' },
    };

    filteredOrders.forEach((o) => {
      const method = (o.paymentMethod || 'cod') as 'cod' | 'bkash' | 'nagad';
      if (pMap[method]) {
        pMap[method].count += 1;
        pMap[method].revenue += o.total || 0;
      } else {
        pMap.cod.count += 1;
        pMap.cod.revenue += o.total || 0;
      }
    });

    return Object.values(pMap).filter((p) => p.count > 0);
  }, [filteredOrders]);

  // 6. SVG Math & Coordinate Calculations for Interactive Area/Line Chart
  const chartWidth = 700;
  const chartHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 30;
  const paddingTop = 25;
  const paddingBottom = 40;

  const maxRevenue = Math.max(...timeSeriesData.map((d) => d.revenue), 100);
  const maxOrders = Math.max(...timeSeriesData.map((d) => d.ordersCount), 5);

  const points = useMemo(() => {
    const count = timeSeriesData.length;
    if (count === 0) return [];
    const availableWidth = chartWidth - paddingLeft - paddingRight;
    const availableHeight = chartHeight - paddingTop - paddingBottom;

    return timeSeriesData.map((d, idx) => {
      const x = paddingLeft + (idx / Math.max(count - 1, 1)) * availableWidth;
      const yRev = paddingTop + availableHeight - (d.revenue / maxRevenue) * availableHeight;
      const yOrd = paddingTop + availableHeight - (d.ordersCount / maxOrders) * availableHeight;
      return { ...d, x, yRev, yOrd };
    });
  }, [timeSeriesData, maxRevenue, maxOrders]);

  // Path generators for SVG Area & Lines
  const revenueAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = chartHeight - paddingBottom;
    let path = `M ${points[0].x} ${bottomY} L ${points[0].x} ${points[0].yRev}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].yRev}`;
    }
    path += ` L ${points[points.length - 1].x} ${bottomY} Z`;
    return path;
  }, [points]);

  const revenueLinePath = useMemo(() => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].yRev}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].yRev}`;
    }
    return path;
  }, [points]);

  const ordersLinePath = useMemo(() => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x} ${points[0].yOrd}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].yOrd}`;
    }
    return path;
  }, [points]);

  // Donut Chart Math
  const donutCenter = { x: 90, y: 90, radius: 70, innerRadius: 46 };
  const totalDonutRevenue = paymentDistribution.reduce((sum, p) => sum + p.revenue, 0) || 1;

  let currentAngle = -Math.PI / 2;
  const donutSlices = paymentDistribution.map((p) => {
    const sliceAngle = (p.revenue / totalDonutRevenue) * (Math.PI * 2);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const x1 = donutCenter.x + donutCenter.radius * Math.cos(startAngle);
    const y1 = donutCenter.y + donutCenter.radius * Math.sin(startAngle);
    const x2 = donutCenter.x + donutCenter.radius * Math.cos(endAngle);
    const y2 = donutCenter.y + donutCenter.radius * Math.sin(endAngle);

    const x3 = donutCenter.x + donutCenter.innerRadius * Math.cos(endAngle);
    const y3 = donutCenter.y + donutCenter.innerRadius * Math.sin(endAngle);
    const x4 = donutCenter.x + donutCenter.innerRadius * Math.cos(startAngle);
    const y4 = donutCenter.y + donutCenter.innerRadius * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;
    const path = `M ${x1} ${y1} A ${donutCenter.radius} ${donutCenter.radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${donutCenter.innerRadius} ${donutCenter.innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;

    return {
      ...p,
      path,
      percent: Math.round((p.revenue / totalDonutRevenue) * 100),
    };
  });

  // Export CSV Handler
  const handleExportCSV = () => {
    const rows = [
      ['তারিখ (Date)', 'অর্ডার সংখ্যা (Orders)', 'রেভিনিউ (Revenue ৳)', 'ডেলিভার্ড (Delivered)', 'পেন্ডিং (Pending)'],
      ...timeSeriesData.map((d) => [d.dateKey, d.ordersCount, d.revenue, d.deliveredCount, d.pendingCount]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Halal_Bazar_Analytics_${timeRange}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxProductMetric = Math.max(
    ...topProducts.map((p) => (productSortBy === 'revenue' ? p.totalRevenue : p.totalUnits)),
    1
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-neutral-200/90 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center border border-emerald-500/20 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <span>অ্যানালিটিক্স ও সেলস রিপোর্ট</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                Live Insights
              </span>
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              অর্ডার ট্রেন্ড, শীর্ষ বিক্রিত পণ্য এবং রিয়েল-টাইম রেভিনিউ ডেটা ভিজ্যুয়ালাইজেশন
            </p>
          </div>
        </div>

        {/* Time Range Selector & CSV Export */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="inline-flex rounded-xl bg-neutral-100 p-1 border border-neutral-200 text-xs font-bold">
            {(['7d', '30d', '90d', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-white text-neutral-900 shadow-xs font-black'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {range === '7d' ? '৭ দিন' : range === '30d' ? '৩০ দিন' : range === '90d' ? '৩ মাস' : 'সব সময়'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
            title="CSV রিপোর্ট ডাউনলোড করুন"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV রিপোর্ট</span>
          </button>
        </div>
      </div>

      {/* 2. Key Performance Indicators Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/5 border border-emerald-300/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-black uppercase tracking-wider">মোট রেভিনিউ</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-emerald-950 mt-1.5">
            ৳{kpis.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>কনফার্মড: ৳{kpis.confirmedRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 via-white to-indigo-500/5 border border-blue-300/80 shadow-xs">
          <div className="flex items-center justify-between text-blue-800">
            <span className="text-[11px] font-black uppercase tracking-wider">মোট অর্ডার</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-blue-950 mt-1.5">
            {kpis.totalOrdersCount}টি
          </div>
          <div className="text-[10px] text-blue-700 font-bold mt-1">
            ডেলিভার্ড: {kpis.deliveredCount}টি ({kpis.totalOrdersCount > 0 ? Math.round((kpis.deliveredCount / kpis.totalOrdersCount) * 100) : 0}%)
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-orange-500/5 border border-amber-300/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-[11px] font-black uppercase tracking-wider">গড় অর্ডার মূল্য</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-amber-950 mt-1.5">
            ৳{kpis.aov.toLocaleString()}
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-1">
            প্রতি অর্ডারে গড় ক্রয়
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-white to-pink-500/5 border border-purple-300/80 shadow-xs">
          <div className="flex items-center justify-between text-purple-800">
            <span className="text-[11px] font-black uppercase tracking-wider">মোট আইটেম বিক্রি</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-purple-950 mt-1.5">
            {kpis.totalUnitsSold}টি
          </div>
          <div className="text-[10px] text-purple-700 font-bold mt-1">
            প্যাকেট / পণ্য ইউনিট
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-white to-amber-500/5 border border-rose-300/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[11px] font-black uppercase tracking-wider">পেন্ডিং অর্ডার</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tabular-nums text-rose-950 mt-1.5">
            {kpis.pendingCount}টি
          </div>
          <div className="text-[10px] text-rose-700 font-bold mt-1">
            প্রক্রিয়াধীন রয়েছে
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-white to-sky-500/5 border border-teal-300/80 shadow-xs">
          <div className="flex items-center justify-between text-teal-800">
            <span className="text-[11px] font-black uppercase tracking-wider">ডেলিভারি এরিয়া</span>
            <Truck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-teal-950 mt-1.5">
            ঢাকা {kpis.dhakaPercent}%
          </div>
          <div className="text-[10px] text-teal-700 font-bold mt-1">
            ঢাকার বাইরে: {kpis.outsidePercent}%
          </div>
        </div>
      </div>

      {/* 3. Interactive Order & Revenue Trend Area Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>সময়ভিত্তিক রেভিনিউ ও অর্ডার গ্রোথ ট্রেন্ড</span>
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              কার্সার রেখে প্রতিটি দিনের বিস্তারিত রেভিনিউ ও অর্ডার সংখ্যা দেখুন
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setMetricView('both')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'both' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-neutral-600'
              }`}
            >
              উভয় (Both)
            </button>
            <button
              type="button"
              onClick={() => setMetricView('revenue')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'revenue' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-neutral-600'
              }`}
            >
              রেভিনিউ (৳)
            </button>
            <button
              type="button"
              onClick={() => setMetricView('orders')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                metricView === 'orders' ? 'bg-white text-blue-800 shadow-xs font-black' : 'text-neutral-600'
              }`}
            >
              অর্ডার সংখ্যা
            </button>
          </div>
        </div>

        {/* Crisp Custom SVG Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-64 sm:h-72 select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = paddingTop + (chartHeight - paddingTop - paddingBottom) * ratio;
              const val = Math.round(maxRevenue * (1 - ratio));
              return (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={chartWidth - paddingRight}
                    y2={y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingLeft - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    fill="#94a3b8"
                    fontFamily="monospace"
                  >
                    ৳{val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {(metricView === 'both' || metricView === 'revenue') && (
              <path d={revenueAreaPath} fill="url(#areaGrad)" />
            )}

            {/* Revenue Line */}
            {(metricView === 'both' || metricView === 'revenue') && (
              <path
                d={revenueLinePath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Orders Line */}
            {(metricView === 'both' || metricView === 'orders') && (
              <path
                d={ordersLinePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2"
                strokeDasharray={metricView === 'both' ? '4 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Nodes */}
            {points.map((pt, i) => {
              // Show label on sample intervals to prevent crowding
              const showLabel = points.length <= 10 || i % Math.ceil(points.length / 8) === 0;
              return (
                <g key={i}>
                  {/* Revenue Dot */}
                  {(metricView === 'both' || metricView === 'revenue') && (
                    <circle
                      cx={pt.x}
                      cy={pt.yRev}
                      r={hoveredPoint?.dateKey === pt.dateKey ? 5 : 2.5}
                      fill="#059669"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all"
                    />
                  )}

                  {/* Orders Dot */}
                  {(metricView === 'both' || metricView === 'orders') && (
                    <circle
                      cx={pt.x}
                      cy={pt.yOrd}
                      r={hoveredPoint?.dateKey === pt.dateKey ? 4.5 : 2}
                      fill="#0284c7"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      className="transition-all"
                    />
                  )}

                  {/* X Axis Label */}
                  {showLabel && (
                    <text
                      x={pt.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize="9.5"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      {pt.dateLabel}
                    </text>
                  )}

                  {/* Hover Hitbox */}
                  <rect
                    x={pt.x - (chartWidth / points.length) / 2}
                    y={paddingTop}
                    width={chartWidth / points.length}
                    height={chartHeight - paddingTop - paddingBottom}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none bg-neutral-900 text-white px-3 py-2 rounded-xl shadow-2xl border border-neutral-700 text-xs z-30 transition-transform duration-75"
              style={{
                left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                top: '15%',
                transform: 'translate(-50%, 0)',
              }}
            >
              <div className="font-bold text-amber-300 border-b border-neutral-700 pb-1 mb-1">
                📅 {hoveredPoint.dateLabel} ({hoveredPoint.dateKey})
              </div>
              <div className="flex items-center justify-between gap-4 font-mono text-emerald-400">
                <span>বিক্রি (Revenue):</span>
                <span className="font-bold">৳{hoveredPoint.revenue.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono text-sky-400">
                <span>অর্ডার সংখ্যা:</span>
                <span className="font-bold">{hoveredPoint.ordersCount}টি</span>
              </div>
              <div className="flex items-center justify-between gap-4 font-mono text-neutral-400 text-[10px]">
                <span>ডেলিভার্ড:</span>
                <span>{hoveredPoint.deliveredCount}টি</span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 pt-2 text-xs font-bold text-neutral-600">
          {(metricView === 'both' || metricView === 'revenue') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>মোট রেভিনিউ (৳)</span>
            </div>
          )}
          {(metricView === 'both' || metricView === 'orders') && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-600" />
              <span>মোট অর্ডার সংখ্যা</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Two-Column Grid: Top Products & Payment/Delivery Share */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top-Selling Products Bar Graph */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>সর্বাধিক বিক্রিত শীর্ষ পণ্য (Top Products)</span>
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-0.5">
                কোন পণ্যের বিক্রয় ও রেভিনিউ সর্বাধিক
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl text-xs font-bold self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setProductSortBy('revenue')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  productSortBy === 'revenue' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-neutral-600'
                }`}
              >
                রেভিনিউ
              </button>
              <button
                type="button"
                onClick={() => setProductSortBy('quantity')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  productSortBy === 'quantity' ? 'bg-white text-emerald-800 shadow-xs font-black' : 'text-neutral-600'
                }`}
              >
                পরিমাণ (Qty)
              </button>
            </div>
          </div>

          {/* Interactive Horizontal Bar List */}
          <div className="space-y-3 pt-2">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-400 font-bold">
                কোনো পণ্য বিক্রির তথ্য পাওয়া যায়নি
              </div>
            ) : (
              topProducts.map((prod, idx) => {
                const metricVal = productSortBy === 'revenue' ? prod.totalRevenue : prod.totalUnits;
                const percent = Math.min(Math.round((metricVal / maxProductMetric) * 100), 100);
                const color = PALETTE[idx % PALETTE.length];

                return (
                  <div key={prod.id} className="space-y-1 group">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-neutral-900 truncate">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                            idx === 0
                              ? 'bg-amber-400 text-neutral-950'
                              : idx === 1
                              ? 'bg-neutral-300 text-neutral-800'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <span className="truncate">{prod.name}</span>
                        <span className="text-[10px] text-neutral-400 font-normal">({prod.category})</span>
                      </div>
                      <div className="font-mono font-bold text-neutral-900 shrink-0 text-right">
                        {productSortBy === 'revenue' ? `৳${prod.totalRevenue.toLocaleString()}` : `${prod.totalUnits}টি`}
                      </div>
                    </div>

                    {/* Bar progress track */}
                    <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Payment Method Donut Chart */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm sm:text-base font-black text-neutral-900 tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>পেমেন্ট মেথড অনুপাত</span>
              </h2>
              <p className="text-xs text-neutral-500 font-medium">ক্যাশ অন ডেলিভারি বনাম বিকাশ/নগদ</p>
            </div>
          </div>

          {/* SVG Donut Chart */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
            <svg width="180" height="180" viewBox="0 0 180 180" className="shrink-0">
              {donutSlices.map((slice, i) => (
                <path
                  key={i}
                  d={slice.path}
                  fill={slice.color}
                  className="transition-transform duration-200 hover:scale-105 origin-center cursor-pointer"
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              ))}
              <circle cx="90" cy="90" r="42" fill="#ffffff" />
              <text x="90" y="86" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="bold">
                মোট সেলস
              </text>
              <text
                x="90"
                y="102"
                textAnchor="middle"
                fontSize="11"
                fill="#0f172a"
                fontWeight="black"
                fontFamily="monospace"
              >
                ৳{kpis.totalRevenue >= 1000 ? `${(kpis.totalRevenue / 1000).toFixed(0)}k` : kpis.totalRevenue}
              </text>
            </svg>

            {/* Legend Breakdown List */}
            <div className="space-y-2 w-full">
              {donutSlices.map((slice, i) => (
                <div key={i} className="p-2 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                    <span className="font-bold text-neutral-800 truncate">{slice.name.split(' ')[0]}</span>
                  </div>
                  <div className="text-right shrink-0 font-mono">
                    <span className="font-black text-neutral-900">৳{slice.revenue.toLocaleString()}</span>
                    <span className="text-[10px] text-neutral-500 font-bold ml-1.5">({slice.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Region Progress */}
          <div className="pt-3 border-t border-neutral-100 space-y-2">
            <div className="flex justify-between text-xs font-bold text-neutral-800">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-purple-600" />
                <span>ঢাকা মেট্রো ({kpis.dhakaOrders}টি)</span>
              </span>
              <span className="font-mono text-purple-800">{kpis.dhakaPercent}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-neutral-100 overflow-hidden border border-neutral-200">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-700"
                style={{ width: `${kpis.dhakaPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-neutral-500 text-right font-medium">
              ঢাকার বাইরে সমগ্র বাংলাদেশ: {kpis.outsidePercent}% ({kpis.outsideOrders}টি)
            </div>
          </div>
        </div>
      </div>

      {/* 5. Order Pipeline & AI Smart Business Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h2 className="text-base font-black text-neutral-900 tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>অর্ডার স্ট্যাটাস পাইপলাইন</span>
            </h2>
            <span className="text-xs font-bold text-neutral-500">মোট: {kpis.totalOrdersCount}টি</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'পেন্ডিং', count: kpis.pendingCount, color: '#f59e0b' },
              {
                label: 'কনফার্মড',
                count: filteredOrders.filter((o) => o.status === 'confirmed').length,
                color: '#3b82f6',
              },
              { label: 'ডেলিভার্ড', count: kpis.deliveredCount, color: '#10b981' },
              {
                label: 'বাতিল',
                count: filteredOrders.filter((o) => o.status === 'cancelled').length,
                color: '#ef4444',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl border text-center space-y-1 transition-all hover:scale-102"
                style={{
                  backgroundColor: `${item.color}0D`,
                  borderColor: `${item.color}33`,
                }}
              >
                <div className="text-[11px] font-black" style={{ color: item.color }}>
                  {item.label}
                </div>
                <div className="text-2xl font-black font-mono tabular-nums text-neutral-950">
                  {item.count}
                </div>
                <div className="text-[10px] text-neutral-500 font-bold">
                  {kpis.totalOrdersCount > 0 ? Math.round((item.count / kpis.totalOrdersCount) * 100) : 0}% অংশ
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Insights Card */}
        <div className="lg:col-span-6 p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-emerald-950 text-white border border-emerald-900/40 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white">
                স্মার্ট বিজনেস ইনসাইটস
              </h2>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Auto Calculated
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-emerald-300">শীর্ষ বিক্রিত পণ্য: </span>
                <span className="text-neutral-300">
                  {topProducts[0]?.name || 'ড্রাই ফ্রুটস'} পণ্যটি সর্বাধিক বিক্রি ও রেভিনিউ আনছে।
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-blue-300">ক্যাশ অন ডেলিভারি প্রাধান্য: </span>
                <span className="text-neutral-300">
                  অধিকাংশ ক্রেতা ক্যাশ অন ডেলিভারি (COD) বেছে নিচ্ছেন, নিয়মিত ডেলিভারি কনফার্মেশন বজায় রাখুন।
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <span className="font-bold text-amber-300">গড় বাস্কেট সাইজ (AOV): </span>
                <span className="text-neutral-300">
                  বর্তমান গড় ক্রয় ৳{kpis.aov.toLocaleString()}। কম্বো অফার দিলে AOV আরও বাড়ানো সম্ভব।
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
