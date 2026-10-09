import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AdminOrder } from '../../types/admin';
import { parseOrderDate as parseAnyOrderDate } from '../../utils/date';
import {
  TrendingUp,
  Calendar,
  ShoppingBag,
  CircleDollarSign,
  ArrowUpRight,
  Sparkles,
  BarChart2,
  Layers,
} from 'lucide-react';

interface SalesOverviewSectionProps {
  orders: AdminOrder[];
  primaryColor?: string;
}

// Parses different date formats including DD-MM-YYYY, hh:mm AM/PM, ISO, etc.
function parseOrderDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  try {
    const d = parseAnyOrderDate(dateStr);
    if (!d || isNaN(d.getTime())) return null;
    return d;
  } catch {
    return null;
  }
}

export const SalesOverviewSection: React.FC<SalesOverviewSectionProps> = ({
  orders,
  primaryColor = '#059669',
}) => {
  const [chartMode, setChartMode] = useState<'both' | 'revenue' | 'orders'>('both');

  // Compute 30-day timeline series
  const { chartData, total30DayRevenue, total30DayOrders, maxDaySales, avgOrderValue } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map orders by YYYY-MM-DD
    const dateMap = new Map<string, { count: number; rev: number }>();

    orders.forEach((ord) => {
      const d = parseOrderDate(ord.createdAt);
      if (!d) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const prev = dateMap.get(key) || { count: 0, rev: 0 };
      prev.count += 1;
      if (ord.status !== 'cancelled') {
        prev.rev += Number(ord.total) || 0;
      }
      dateMap.set(key, prev);
    });

    const series: {
      dateKey: string;
      dateLabel: string;
      dayNum: string;
      ordersCount: number;
      revenue: number;
      avgValue: number;
    }[] = [];

    let totalRev = 0;
    let totalOrd = 0;
    let maxDay = { date: '', amount: 0 };

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let i = 29; i >= 0; i--) {
      const target = new Date(today);
      target.setDate(today.getDate() - i);
      const key = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
      const dayNum = String(target.getDate()).padStart(2, '0');
      const monthStr = monthNames[target.getMonth()];

      const stats = dateMap.get(key) || { count: 0, rev: 0 };
      const avg = stats.count > 0 ? Math.round(stats.rev / stats.count) : 0;

      totalRev += stats.rev;
      totalOrd += stats.count;

      if (stats.rev > maxDay.amount) {
        maxDay = { date: `${dayNum} ${monthStr}`, amount: stats.rev };
      }

      series.push({
        dateKey: key,
        dateLabel: `${dayNum} ${monthStr}`,
        dayNum,
        ordersCount: stats.count,
        revenue: stats.rev,
        avgValue: avg,
      });
    }

    const aov = totalOrd > 0 ? Math.round(totalRev / totalOrd) : 0;

    return {
      chartData: series,
      total30DayRevenue: totalRev,
      total30DayOrders: totalOrd,
      maxDaySales: maxDay,
      avgOrderValue: aov,
    };
  }, [orders]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0]?.payload;
      return (
        <div className="bg-neutral-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-neutral-700/80 backdrop-blur-md text-xs min-w-[210px] space-y-2">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="font-bold flex items-center gap-1.5 text-neutral-300">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{label}</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-400 font-semibold">
              গত ৩০ দিন
            </span>
          </div>

          <div className="space-y-1.5 pt-0.5">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                মোট রেভিনিউ:
              </span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm">
                ৳{(dataPoint?.revenue || 0).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-sky-300 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                অর্ডার সংখ্যা:
              </span>
              <span className="font-mono font-extrabold text-sky-300 text-sm">
                {dataPoint?.ordersCount || 0} টি
              </span>
            </div>

            {dataPoint?.avgValue > 0 && (
              <div className="flex items-center justify-between gap-3 border-t border-neutral-800/80 pt-1 text-[11px] text-neutral-400">
                <span>গড় অর্ডার মূল্য:</span>
                <span className="font-mono text-neutral-300 font-bold">
                  ৳{dataPoint.avgValue.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 p-4 sm:p-6 shadow-xs space-y-5">
      {/* Header and Toggle Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
                <span>Sales Overview (গত ৩০ দিনের সেলস ট্রেন্ড)</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Recharts Visual
                </span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                দৈনিক অর্ডারের পরিমাণ ও মোট রেভিনিউ প্রবৃদ্ধির লাইভ অ্যানালিটিক্স
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-neutral-100/90 p-1 rounded-xl self-start sm:self-auto border border-neutral-200/70">
          <button
            type="button"
            onClick={() => setChartMode('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'both'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>উভয়ই (Both)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('revenue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'revenue'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <CircleDollarSign className="w-3.5 h-3.5" />
            <span>রেভিনিউ (৳)</span>
          </button>
          <button
            type="button"
            onClick={() => setChartMode('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              chartMode === 'orders'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>অর্ডার সংখ্যা</span>
          </button>
        </div>
      </div>

      {/* 30-Day Quick Metric Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            ৩০ দিনের মোট বিক্রি
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-950 mt-1">
            ৳{total30DayRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
            বাতিলকৃত অর্ডার ব্যতীত
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200/70">
          <span className="text-[11px] font-bold text-sky-800 uppercase tracking-wider block">
            ৩০ দিনের মোট অর্ডার
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-sky-950 mt-1">
            {total30DayOrders} টি
          </div>
          <span className="text-[10px] text-sky-700 font-semibold mt-0.5 block">
            সকল সফল ও পেন্ডিং অর্ডার
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            গড় অর্ডার মূল্য (AOV)
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-amber-950 mt-1">
            ৳{avgOrderValue.toLocaleString()}
          </div>
          <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
            প্রতি অর্ডারে গড় রেভিনিউ
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/70">
          <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">
            সর্বোচ্চ একদিনের সেলস
          </span>
          <div className="text-xl sm:text-2xl font-black font-mono text-purple-950 mt-1">
            ৳{maxDaySales.amount.toLocaleString()}
          </div>
          <span className="text-[10px] text-purple-700 font-semibold mt-0.5 block truncate">
            {maxDaySales.date ? `তারিখ: ${maxDaySales.date}` : 'রেকর্ড হয়নি'}
          </span>
        </div>
      </div>

      {/* Main Interactive Recharts Graph */}
      <div className="w-full h-72 sm:h-80 md:h-96 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="orderBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0369a1" stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="dateLabel"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              interval="preserveStartEnd"
              minTickGap={20}
            />

            {/* Left Axis: Revenue (BDT) */}
            {(chartMode === 'both' || chartMode === 'revenue') && (
              <YAxis
                yAxisId="revenueAxis"
                orientation="left"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#059669', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(val) => (val >= 1000 ? `৳${val / 1000}k` : `৳${val}`)}
              />
            )}

            {/* Right Axis: Order Count */}
            {(chartMode === 'both' || chartMode === 'orders') && (
              <YAxis
                yAxisId="ordersAxis"
                orientation={chartMode === 'orders' ? 'left' : 'right'}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#0284c7', fontSize: 11, fontWeight: 600 }}
                allowDecimals={false}
                tickFormatter={(val) => `${val}`}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="top"
              align="right"
              height={36}
              iconType="circle"
              formatter={(value) => {
                if (value === 'revenue') return <span className="text-xs font-bold text-emerald-800">মোট রেভিনিউ (টাকা)</span>;
                if (value === 'ordersCount') return <span className="text-xs font-bold text-sky-800">দৈনিক অর্ডার সংখ্যা</span>;
                return value;
              }}
            />

            {/* Bars for Daily Order Count */}
            {(chartMode === 'both' || chartMode === 'orders') && (
              <Bar
                yAxisId="ordersAxis"
                dataKey="ordersCount"
                name="ordersCount"
                fill="url(#orderBarGradient)"
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
            )}

            {/* Gradient Area for Revenue Trend */}
            {(chartMode === 'both' || chartMode === 'revenue') && (
              <Area
                yAxisId="revenueAxis"
                type="monotone"
                dataKey="revenue"
                name="revenue"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
                activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#059669' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Subtext info */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-100 gap-2">
        <span className="flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>দৈনিক অর্ডারের গ্রাফটি রিয়েল-টাইমে ফায়ারবেস ডাটার সাথে সমন্বয় হয়</span>
        </span>
        <span className="font-mono text-neutral-400">
          রেভিনিউ এবং অর্ডারের অনুপাত বিশ্লেষণে সহায়ক
        </span>
      </div>
    </div>
  );
};
