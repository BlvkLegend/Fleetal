import { useQuery } from '@tanstack/react-query';
import { Package, Users, Truck, TrendingUp, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { statsService, activityService, analyticsService } from '../services';
import { StatCard, Spinner, Skeleton, Avatar } from '../components/ui/primitives';
import { Badge } from '../components/ui/primitives';
import { fmtCurrency, fmtRelTime } from '../lib/utils';
import { useUIStore, DRIVER_SESSION } from '../store/ui';
import { WorkspaceBanner } from './WorkspaceBanner';

function ChartTip({ active, payload, label, currency }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-warm-800 border border-warm-200 dark:border-warm-700 rounded-xl p-3 shadow-xl text-xs">
      <p className="font-semibold text-warm-800 dark:text-warm-200 mb-1.5">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} className="text-warm-500 mt-0.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span>{p.name}:</span>
          <span className="font-semibold text-warm-700 dark:text-warm-300">
            {currency ? fmtCurrency(p.value, true) : p.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function Dashboard() {
  const role = useUIStore(s => s.role);
  const isDriver = role === 'driver';
  const scopeFilter = isDriver ? { driverId: DRIVER_SESSION.driverId } : {};

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', role],
    queryFn: () => statsService.get(scopeFilter),
  });

  const { data: activities, isLoading: actLoading } = useQuery({
    queryKey: ['activities', role],
    queryFn: () => activityService.getAll(scopeFilter),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: analyticsService.get,
    enabled: !isDriver,
  });

  const weeklyTrend = analytics?.weeklyTrend || [];
  const statusDist  = analytics?.statusDist  || [];

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-[1600px]">
      <WorkspaceBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-warm-900 dark:text-warm-100">
            {isDriver ? `Welcome, ${DRIVER_SESSION.driverName}` : 'Operations Overview'}
          </h2>
          <p className="text-xs sm:text-sm text-warm-500 mt-0.5">
            {isDriver
              ? 'Your personal delivery dashboard'
              : 'Real-time logistics metrics across the Lagos network'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-warm-400 self-start sm:self-auto">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse-dot" />
          Live
        </div>
      </div>

      {/* Stat cards */}
      {statsLoading ? <SkeletonStats /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            label="Total Deliveries"
            value={stats?.totalDeliveries}
            sub={`${stats?.todayDeliveries} added today`}
            icon={Package}
            color="teal"
            trend={8.2}
          />
          <StatCard
            label="In Transit"
            value={stats?.inTransit}
            sub={`${stats?.pending} pending`}
            icon={Activity}
            color="amber"
          />
          {!isDriver && (
            <StatCard
              label="Active Drivers"
              value={`${stats?.activeDrivers}/${stats?.totalDrivers}`}
              sub="On duty now"
              icon={Users}
              color="green"
            />
          )}
          {isDriver ? (
            <StatCard
              label="Completed"
              value={stats?.delivered}
              sub="Your deliveries"
              icon={CheckCircle2}
              color="green"
            />
          ) : (
            <StatCard
              label="Est. Revenue"
              value={fmtCurrency(stats?.revenue, true)}
              sub={`${stats?.onTimeRate}% on-time`}
              icon={TrendingUp}
              color="teal"
              trend={12.5}
            />
          )}
          <StatCard
            label="Failed / Returned"
            value={stats?.failed}
            sub="Needs attention"
            icon={AlertCircle}
            color="red"
          />
        </div>
      )}

      {/* Charts — only for admin/dispatcher */}
      {!isDriver && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend */}
          <div className="card p-5 lg:col-span-2">
            <div className="mb-5">
              <p className="text-sm font-semibold text-warm-900 dark:text-warm-100">Delivery Volume</p>
              <p className="text-xs text-warm-400 mt-0.5">14-day trend</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-warm-100 dark:stroke-warm-800" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  name="Deliveries"
                  stroke="#0d9488"
                  strokeWidth={2}
                  fill="url(#gradTeal)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#0d9488', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div className="card p-5">
            <p className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-0.5">Status Breakdown</p>
            <p className="text-xs text-warm-400 mb-4">All-time distribution</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={statusDist}
                  cx="50%" cy="50%"
                  innerRadius={44} outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-1.5 mt-3">
              {statusDist.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-warm-500 dark:text-warm-400">{s.name}</span>
                  </div>
                  <span className="font-semibold text-warm-700 dark:text-warm-300">{s.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity feed + quick stats */}
      <div className={`grid grid-cols-1 ${!isDriver ? 'lg:grid-cols-3' : ''} gap-4`}>
        {/* Activity */}
        <div className={`card ${!isDriver ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-warm-100 dark:border-warm-800">
            <p className="text-sm font-semibold text-warm-900 dark:text-warm-100">
              {isDriver ? 'Your Activity' : 'Activity Feed'}
            </p>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Recent</span>
          </div>
          {actLoading ? (
            <div className="p-5 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-warm-100 dark:divide-warm-800">
              {(activities || []).slice(0, 8).map(act => (
                <div key={act.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-warm-50/50 dark:hover:bg-warm-800/30 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity size={12} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-800 dark:text-warm-200 leading-snug">{act.title}</p>
                    <p className="text-xs text-warm-400 mt-0.5 truncate">{act.description}</p>
                  </div>
                  <span className="text-xs text-warm-400 flex-shrink-0 tabular-nums">{fmtRelTime(act.timestamp)}</span>
                </div>
              ))}
              {(!activities || activities.length === 0) && (
                <p className="text-center py-10 text-sm text-warm-400">No activity yet</p>
              )}
            </div>
          )}
        </div>

        {/* Quick metrics — admin/dispatcher only */}
        {!isDriver && (
          <div className="space-y-4">
            <div className="card p-5">
              <p className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-4">Fleet Health</p>
              <div className="space-y-3">
                {[
                  { label: 'Active vehicles',  value: `${stats?.activeVehicles}/${stats?.totalVehicles}`, icon: Truck },
                  { label: 'On-time rate',     value: `${stats?.onTimeRate}%`,                           icon: Clock },
                  { label: 'Completed today',  value: stats?.delivered,                                  icon: CheckCircle2 },
                  { label: 'Active customers', value: stats?.activeCustomers,                             icon: Users },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-warm-500 dark:text-warm-400">
                      <Icon size={13} />
                      {label}
                    </div>
                    <span className="text-xs font-bold text-warm-800 dark:text-warm-200 tabular-nums">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly bar mini chart */}
            {analytics?.monthly && (
              <div className="card p-5">
                <p className="text-sm font-semibold text-warm-900 dark:text-warm-100 mb-1">Monthly Volume</p>
                <p className="text-xs text-warm-400 mb-4">Deliveries per month</p>
                <ResponsiveContainer width="100%" height={100}>
                  <BarChart data={analytics.monthly.slice(-6)} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                    <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Bar dataKey="deliveries" name="Deliveries" fill="#0d9488" radius={[3,3,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
