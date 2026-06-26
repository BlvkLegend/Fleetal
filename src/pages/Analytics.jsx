import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { analyticsService } from '../services';
import { Skeleton } from '../components/ui/primitives';
import { fmtCurrency } from '../lib/utils';

function ChartTip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-warm-800 dark:text-warm-200 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-warm-500 mt-0.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          {p.name}: <span className="font-semibold text-warm-700 dark:text-warm-300 ml-0.5">
            {currency === p.dataKey ? fmtCurrency(p.value, true) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <div className="mb-4 sm:mb-5">
        <p className="text-sm font-semibold text-warm-900 dark:text-warm-100">{title}</p>
        {subtitle && <p className="text-xs text-warm-400 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, positive }) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-xs font-semibold text-warm-500 uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-bold text-warm-900 dark:text-warm-100">{value}</p>
      {sub && (
        <p className={`text-xs mt-1.5 font-medium ${positive ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

export function Analytics() {
  const { data: analytics, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: analyticsService.get });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }

  const { monthly = [], zonePerf = [], weeklyTrend = [] } = analytics;

  const ytdRevenue    = monthly.reduce((s, m) => s + m.revenue, 0);
  const ytdDeliveries = monthly.reduce((s, m) => s + m.deliveries, 0);
  const avgOnTime     = monthly.length ? (monthly.reduce((s, m) => s + m.onTime, 0) / monthly.length).toFixed(1) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1600px]">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">Analytics</h2>
        <p className="text-xs sm:text-sm text-warm-500 mt-0.5">Performance metrics for the current year</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <KpiCard label="YTD Revenue"     value={fmtCurrency(ytdRevenue, true)}    sub="+12.5% vs last year"              positive />
        <KpiCard label="YTD Deliveries"  value={ytdDeliveries.toLocaleString()}   sub="+8.2% vs same period"             positive />
        <KpiCard label="Avg. On-time"    value={`${avgOnTime}%`}                  sub="-0.6pp vs 95% target"             positive={false} />
      </div>

      {/* Revenue chart — full width */}
      <ChartCard title="Monthly Revenue" subtitle="Estimated earnings from completed deliveries">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthly} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-warm-100 dark:stroke-warm-800" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} tickFormatter={v => fmtCurrency(v, true)} />
            <Tooltip content={<ChartTip currency="revenue" />} />
            <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Volume + on-time / zone performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Volume vs On-time Rate" subtitle="Monthly comparison">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthly} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-warm-100 dark:stroke-warm-800" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="l" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="r" orientation="right" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} domain={[70, 100]} />
              <Tooltip content={<ChartTip />} />
              <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
              <Line yAxisId="l" type="monotone" dataKey="deliveries" name="Deliveries" stroke="#0d9488" strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
              <Line yAxisId="r" type="monotone" dataKey="onTime"     name="On-time %"  stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 3, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Zone Performance" subtitle="Deliveries by Lagos coverage area">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={zonePerf} layout="vertical" margin={{ top: 0, right: 8, left: 64, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-warm-100 dark:stroke-warm-800" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="zone" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="deliveries" name="Deliveries" fill="#14b8a6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 14-day trend */}
      <ChartCard title="14-Day Delivery Trend" subtitle="Recent daily volume with revenue overlay">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0d9488" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-warm-100 dark:stroke-warm-800" />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTip />} />
            <Area
              type="monotone" dataKey="deliveries" name="Deliveries"
              stroke="#0d9488" strokeWidth={2} fill="url(#tealGrad)"
              dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: '#0d9488' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
