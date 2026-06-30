import { useState, useEffect } from 'react';
import {
  Car, Calendar, BadgeDollarSign, AlertCircle, ClipboardCheck,
  Clock, ChevronRight, TrendingUp, Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import dashboardService, { ApiAppointment } from '../service/dashboardService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING:     '#f59e0b',
  CONFIRMED:   '#3b82f6',
  COMPLETED:   '#10b981',
  CANCELLED:   '#ef4444',
  IN_PROGRESS: '#8b5cf6',
  LIVE:        '#10b981',
  ACTIVE:      '#003B7E',
  SOLD:        '#6b7280',
};
const getStatusColor = (s: string) =>
  STATUS_COLORS[s?.toUpperCase()] ?? '#94a3b8';

const getRelativeTime = (iso: string) => {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const formatApptDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
};

const formatTime = (iso: string) => {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// ─── Skeleton ────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const StatSkeleton = () => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
    <div className="flex justify-between">
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-16" />
      </div>
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
    <Skeleton className="h-5 w-28 rounded-full" />
  </div>
);

// ─── Custom chart tooltip ─────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white shadow-xl rounded-xl px-4 py-2.5 border border-gray-100 text-sm">
      <p className="font-semibold text-gray-800">{payload[0].name}</p>
      <p className="text-gray-500">{payload[0].value} records</p>
    </div>
  );
};

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStats {
  carsCount: number;
  appointmentsCount: number;
  appointments: any[];
  cars: any[];
  auctionsCount: number;
  inspections: any[];
  inspectionsCount: number;
  inspectionStatuses: Record<string, number>;
  appointmentStatuses: Record<string, number>;
}

interface ActivityItem {
  id: string;
  label: string;
  time: string;
  rawTs: number;
  type: 'car' | 'appointment' | 'inspection';
}

interface ApptItem {
  id: string;
  user: string;
  time: string;
  date: string;
  rawTs: number;
  purpose: string;
  status: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [stats, setStats]                = useState<DashboardStats | null>(null);
  const [activities, setActivities]      = useState<ActivityItem[]>([]);
  const [appointments, setAppointments]  = useState<ApptItem[]>([]);
  const [loading, setLoading]            = useState(true);
  const [error, setError]                = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();

        // ── status breakdowns ────────────────────────────────────────────
        const inspStatuses: Record<string, number> = {};
        (data.inspections ?? []).forEach((ins: any) => {
          const s = ins.inspectionStatus ?? ins.status ?? 'Unknown';
          inspStatuses[s] = (inspStatuses[s] ?? 0) + 1;
        });

        const apptStatuses: Record<string, number> = {};
        (data.appointments ?? []).forEach((a: ApiAppointment) => {
          const s = a.status ?? 'Unknown';
          apptStatuses[s] = (apptStatuses[s] ?? 0) + 1;
        });


    

        setStats({
          carsCount:          data.carsCount  ?? 0,
          cars:               data.cars ?? [],
          auctionsCount:      data.auctionCars?.length  ?? 0,
          appointmentsCount:  data.appointmentsCount ?? 0,
          appointments:       data.appointments ?? [],
          inspectionsCount:   data.inspectionsCount ?? 0,
          inspections:        data.inspections ?? [],
          inspectionStatuses: inspStatuses,
          appointmentStatuses: apptStatuses,
        });


        // ── recent activity ──────────────────────────────────────────────
        const acts: ActivityItem[] = [];

        (data.cars ?? []).slice(0, 3).forEach((car: any) => {
          const name = `${car.make ?? ''} ${car.model ?? ''} ${car.modelYear ?? car.year ?? ''}`.trim();
          acts.push({
            id:    `car-${car.id}`,
            label: `${name} listed for sale`,
            time:  getRelativeTime(car.createdAt ?? new Date().toISOString()),
            rawTs: new Date(car.createdAt ?? Date.now()).getTime(),
            type:  'car',
          });
        });

        (data.appointments ?? []).slice(0, 3).forEach((a: ApiAppointment) => {
          console.log(a);
          acts.push({
            id:    `apt-${a.uid}`,
            label: `Appointment with ${a.userName ?? 'Customer'}`,
            time:  getRelativeTime(a.createdAt ?? a.date ?? new Date().toISOString()),
            rawTs: new Date(a.createdAt ?? a.date ?? Date.now()).getTime(),
            type:  'appointment',
          });
        });

        (data.inspections ?? []).slice(0, 3).forEach((ins: any) => {
          const make  = ins.Car?.make   ?? ins.carDetails?.make  ?? '';
          const model = ins.Car?.model  ?? ins.carDetails?.model ?? '';
          const st    = (ins.inspectionStatus ?? ins.status ?? '').toLowerCase();
          acts.push({
            id:    `ins-${ins.id}`,
            label: `Inspection ${st}${make ? ` — ${make} ${model}` : ''}`,
            time:  getRelativeTime(ins.date ?? new Date().toISOString()),
            rawTs: new Date(ins.date ?? Date.now()).getTime(),
            type:  'inspection',
          });
        });

        acts.sort((a, b) => b.rawTs - a.rawTs);
        setActivities(acts.slice(0, 8));

        // ── upcoming appointments ────────────────────────────────────────
        const now = Date.now();
        const upcoming: ApptItem[] = (data.appointments ?? [])
          .map((a: ApiAppointment) => ({
            id:     a.uid.toString(),
            user:   a.userName ?? 'Customer',
            time:   formatTime(a.appointmentTime),
            date:   formatApptDate(a.appointmentDate),
            rawTs:  new Date(a.appointmentDate).getTime(),
            purpose: a.purpose?.toLowerCase() ?? 'Appointment',
            status:  a.status ?? 'PENDING',
          }))
          .filter((a: ApptItem) => a.rawTs >= now)
          .sort((a: ApptItem, b: ApptItem) => a.rawTs - b.rawTs)
          .slice(0, 5);
        setAppointments(upcoming);
        setError(null);
      } catch (e: any) {
        console.log(e);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Chart data ─────────────────────────────────────────────────────────────
  const inspChartData = stats
    ? Object.entries(stats.inspectionStatuses).map(([name, value]) => ({ name, value }))
    : [];
  const apptChartData = stats
    ? Object.entries(stats.appointmentStatuses).map(([name, value]) => ({ name, value }))
    : [];

  // ── Stat card config ───────────────────────────────────────────────────────
  const statCards = stats ? [
    {
      label: 'Cars Listed',
      value: stats.carsCount,
      icon:  Car,
      grad:  'from-blue-500 to-blue-700',
      pill:  'bg-blue-50 text-blue-700',
      href:  '/cars',
    },
    {
      label: 'Live Auctions',
      value: stats.auctionsCount,
      icon:  BadgeDollarSign,
      grad:  'from-violet-500 to-violet-700',
      pill:  'bg-violet-50 text-violet-700',
      href:  '/cars',
    },
    {
      label: 'Appointments',
      value: stats.appointmentsCount,
      icon:  Calendar,
      grad:  'from-emerald-500 to-emerald-700',
      pill:  'bg-emerald-50 text-emerald-700',
      href:  '/appointments',
    },
    {
      label: 'Inspections',
      value: stats.inspectionsCount,
      icon:  ClipboardCheck,
      grad:  'from-amber-500 to-amber-600',
      pill:  'bg-amber-50 text-amber-700',
      href:  '/inspections',
    },
  ] : [];

  // ── Activity icons / styles ────────────────────────────────────────────────
  const actStyle = {
    car:         { bg: 'bg-blue-50',    icon: <Car className="h-4 w-4 text-blue-600" /> },
    appointment: { bg: 'bg-emerald-50', icon: <Calendar className="h-4 w-4 text-emerald-600" /> },
    inspection:  { bg: 'bg-amber-50',   icon: <ClipboardCheck className="h-4 w-4 text-amber-600" /> },
  };

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-6">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getGreeting()}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today}</p>
        </div>
        <Link
          to="/inspections"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm"
        >
          <TrendingUp className="h-4 w-4" />
          View Reports
        </Link>
      </div>

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ── KPI Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
          : statCards.map((card) => (
              <Link
                key={card.label}
                to={card.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100
                           hover:shadow-md hover:border-gray-200 transition-all duration-200 overflow-hidden"
              >
                {/* subtle gradient glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.grad} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1 tabular-nums tracking-tight">
                      {card.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`h-12 w-12 bg-gradient-to-br ${card.grad} rounded-xl flex items-center justify-center shadow-sm`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="relative mt-4">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${card.pill}`}>
                    <Activity className="h-3 w-3" />
                    View all
                    <ChevronRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform duration-150" />
                  </span>
                </div>
              </Link>
            ))
        }
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      {!loading && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Inspection Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900">Inspection Breakdown</h3>
              <div className="h-8 w-8 bg-amber-50 rounded-xl flex items-center justify-center">
                <ClipboardCheck className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">{stats.inspectionsCount} total inspections</p>

            {inspChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={inspChartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {inspChartData.map((entry, i) => (
                      <Cell key={i} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(v) => (
                      <span className="text-xs text-gray-600 capitalize">{v.toLowerCase()}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-gray-400">No inspection data</p>
              </div>
            )}
          </div>

          {/* Appointment Status */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-gray-900">Appointment Breakdown</h3>
              <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-4">{stats.appointmentsCount} total appointments</p>

            {apptChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={apptChartData}
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {apptChartData.map((entry, i) => (
                      <Cell key={i} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    formatter={(v) => (
                      <span className="text-xs text-gray-600 capitalize">{v.toLowerCase()}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-sm text-gray-400">No appointment data</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Bottom row ───────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* activity skeleton */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <Skeleton className="h-5 w-40" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
          {/* upcoming skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <Skeleton className="h-5 w-32" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {activities.length} events
              </span>
            </div>

            <div className="flex-1 divide-y divide-gray-50">
              {activities.length > 0 ? activities.map((act) => {
                const style = actStyle[act.type];
                return (
                  <div key={act.id} className="px-6 py-3.5 flex items-start gap-3 hover:bg-gray-50/60 transition-colors">
                    <div className={`h-9 w-9 ${style.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{act.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                  No recent activity
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100">
              <Link
                to="/"
                className="text-sm font-medium text-primary hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
              >
                View all activity
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Upcoming</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>

            <div className="flex-1 divide-y divide-gray-50">
              {appointments.length > 0 ? appointments.map((apt: any) => {
                const statusColor = getStatusColor(apt.status);
                const isSpecial   =  false;
                return (
                  <Link
                    key={apt.id}
                    to={`/appointments/${apt.id}`}
                    className="flex items-start gap-3 px-6 py-3.5 hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-12 text-center bg-primary/5 rounded-xl py-1.5 px-1">
                      {isSpecial ? (
                        <p className="text-[10px] font-bold text-primary leading-none uppercase">{apt.date}</p>
                      ) : (
                        <>
                          <p className="text-lg font-bold text-primary leading-none">
                            {apt.date.split(' ')[0]}
                          </p>
                          <p className="text-[10px] font-semibold text-primary/60 uppercase mt-0.5">
                            {apt.date.split(' ')[1]}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm font-semibold text-gray-800 truncate">{apt.user}</p>
                      <p className="text-xs text-gray-400 capitalize mt-0.5">{apt.purpose}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-xs text-gray-400">{apt.appointmentTime}</span>
                        <span
                          className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: statusColor }}
                        />
                        <span className="text-xs font-medium capitalize" style={{ color: statusColor }}>
                          {apt.status.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                  No upcoming appointments
                </div>
              )}
            </div>

            <div className="px-6 py-3 border-t border-gray-100">
              <Link
                to="/appointments"
                className="text-sm font-medium text-primary hover:text-primary-700 inline-flex items-center gap-1 transition-colors"
              >
                View all appointments
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Dashboard;
