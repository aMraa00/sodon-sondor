import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UsersRound, CalendarClock, TrendingUp, Stethoscope, ChevronRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportService, appointmentService } from '@/services/api';
import { formatCurrency, formatDate, statusLabel, statusColor, cn } from '@/lib/utils';

const KPI_CONFIG = [
  { key: 'totalPatients',     label: 'Нийт өвчтөн',   Icon: UsersRound,    color: 'from-brand-500 to-brand-600',     suffix: 'хүн' },
  { key: 'todayAppointments', label: 'Өнөөдрийн цаг',  Icon: CalendarClock, color: 'from-blue-500 to-blue-600',       suffix: 'захиалга' },
  { key: 'monthRevenue',      label: 'Сарын орлого',   Icon: TrendingUp,    color: 'from-emerald-500 to-emerald-600', suffix: '', isCurrency: true },
  { key: 'activeDoctors',     label: 'Идэвхтэй эмч',  Icon: Stethoscope,   color: 'from-purple-500 to-purple-600',   suffix: 'эмч' },
];

const MONTHS = ['1-р сар','2-р сар','3-р сар','4-р сар','5-р сар','6-р сар','7-р сар','8-р сар','9-р сар','10-р сар','11-р сар','12-р сар'];
const PIE_COLORS = { pending: '#f59e0b', confirmed: '#3b82f6', completed: '#10b981', cancelled: '#ef4444', 'no-show': '#94a3b8' };
const STATUS_MN = { pending: 'Хүлээгдэж буй', confirmed: 'Батлагдсан', completed: 'Дууссан', cancelled: 'Цуцлагдсан', 'no-show': 'Ирээгүй' };

export default function AdminDashboard() {
  const [kpi, setKpi] = useState(null);
  const [revenue, setRevenue] = useState([]);
  const [apptStats, setApptStats] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [recentAppts, setRecentAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      reportService.getDashboard(),
      reportService.getRevenue(),
      reportService.getAppointments(),
      reportService.getTopDoctors(),
      appointmentService.getAll({ limit: 5, sort: '-createdAt' }),
    ]).then(([kpiR, revR, apptR, docR, apptListR]) => {
      setKpi(kpiR.data.data);
      setRevenue((revR.data.data || []).map((d) => ({
        month: MONTHS[(d._id.month - 1)],
        орлого: d.total,
        тоо: d.count,
      })));
      setApptStats((apptR.data.data || []).map((d) => ({ name: STATUS_MN[d._id] || d._id, value: d.count, key: d._id })));
      setTopDoctors(docR.data.data || []);
      setRecentAppts(apptListR.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Хянах самбар</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{formatDate(new Date(), 'yyyy оны MM сарын dd')}</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {KPI_CONFIG.map((cfg, i) => (
          <motion.div key={cfg.key}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${cfg.color} text-white rounded-2xl p-5 shadow-brand relative overflow-hidden`}>
            {/* Icon container top-right */}
            <div className="absolute right-3 top-3 w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
              <cfg.Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-white/75 text-xs mb-2 pr-12">{cfg.label}</p>
            {loading ? (
              <div className="h-8 w-20 bg-white/20 rounded-lg animate-pulse" />
            ) : (
              <p className="text-3xl font-bold">
                {cfg.isCurrency
                  ? formatCurrency(kpi?.[cfg.key] || 0).replace('MNT', '').trim()
                  : kpi?.[cfg.key] || 0}
              </p>
            )}
            {cfg.isCurrency && <p className="text-white/70 text-xs mt-0.5">төгрөг</p>}
            {cfg.suffix && !cfg.isCurrency && <p className="text-white/70 text-xs mt-0.5">{cfg.suffix}</p>}
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Орлогын график</h2>
            <Link to="/admin/reports" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Дэлгэрэнгүй <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {revenue.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Өгөгдөл байхгүй</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenue} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [formatCurrency(v), 'Орлого']} />
                <Area type="monotone" dataKey="орлого" stroke="#14b8a6" strokeWidth={2.5} fill="url(#colorRev)" dot={{ fill: '#0d9488', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <h2 className="font-bold mb-4">Цаг захиалгын төлөв</h2>
          {apptStats.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">Өгөгдөл байхгүй</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={apptStats} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                  {apptStats.map((entry, i) => (
                    <Cell key={i} fill={PIE_COLORS[entry.key] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top doctors */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Шилдэг эмч нар</h2>
            <Link to="/admin/doctors" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Бүгд <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {topDoctors.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-6">Өгөгдөл байхгүй</p>
          ) : (
            <div className="space-y-3">
              {topDoctors.map((d, i) => (
                <div key={d._id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0',
                    i === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                    i === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                    i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 'brand-gradient'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.doctor?.lastName} {d.doctor?.firstName}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-brand-500" />
                    <span className="text-sm font-bold text-brand-600">{d.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent appointments */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Сүүлийн захиалгууд</h2>
            <Link to="/admin/appointments" className="text-xs text-brand-600 hover:underline flex items-center gap-1">
              Бүгд <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppts.map((a) => (
              <div key={a._id} className="flex items-center gap-3">
                <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
                  {a.startTime}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{a.patient?.lastName} {a.patient?.firstName}</p>
                  <p className="text-xs text-muted-foreground truncate">{a.service?.name}</p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0', statusColor(a.status))}>
                  {statusLabel(a.status)}
                </span>
              </div>
            ))}
            {recentAppts.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-4">Захиалга байхгүй</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
