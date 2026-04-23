import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, ScrollText, Pill, Wallet, CalendarCheck2, Clock, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';

const QUICK_ACTIONS = [
  { to: '/book',                  Icon: CalendarPlus, label: 'Цаг захиалах', color: 'from-brand-500 to-brand-600',   bg: 'bg-brand-50 dark:bg-brand-900/20',   iconColor: 'text-brand-600' },
  { to: '/patient/history',       Icon: ScrollText,   label: 'Миний түүх',   color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', iconColor: 'text-purple-600' },
  { to: '/patient/prescriptions', Icon: Pill,         label: 'Жор',          color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', iconColor: 'text-orange-600' },
  { to: '/patient/payments',      Icon: Wallet,       label: 'Төлбөр',       color: 'from-emerald-500 to-emerald-600',bg: 'bg-emerald-50 dark:bg-emerald-900/20',iconColor: 'text-emerald-600' },
];

export default function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentService.getAll({ limit: 5, sort: 'date' })
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const upcoming = appointments.filter((a) => new Date(a.date) >= new Date() && a.status !== 'cancelled');
  const nextAppt = upcoming[0];

  return (
    <div className="page-container py-6">
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="brand-gradient rounded-2xl p-6 text-white mb-6 shadow-brand-lg relative overflow-hidden"
      >
        <div className="absolute right-5 top-4 opacity-10">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <path d="M40 8C28 8 18 16 18 28c0 8 4 14 10 18l-4 20c-1 4 2 6 5 4l11-8 11 8c3 2 6 0 5-4l-4-20c6-4 10-10 10-18 0-12-10-20-22-20z" fill="white"/>
          </svg>
        </div>
        <p className="text-brand-100 text-sm">Сайн уу,</p>
        <h2 className="text-2xl font-bold mt-0.5">{user?.lastName} {user?.firstName}</h2>
        <p className="text-brand-100 text-sm mt-1">Таны шүдний эрүүл мэнд манайд чухал!</p>
      </motion.div>

      {/* Next appointment */}
      {nextAppt && (
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 mb-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-brand-100 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
              <CalendarCheck2 className="w-4 h-4 text-brand-600" />
            </div>
            <span className="font-semibold text-sm">Дараагийн цаг захиалга</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 brand-gradient rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
              <span className="text-lg font-bold leading-tight">{new Date(nextAppt.date).getDate()}</span>
              <span className="text-xs">{new Date(nextAppt.date).toLocaleDateString('mn-MN', { month: 'short' })}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{nextAppt.service?.name}</p>
              <p className="text-sm text-muted-foreground">Эмч: {nextAppt.doctor?.lastName} {nextAppt.doctor?.firstName}</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{nextAppt.startTime}</span>
              </div>
            </div>
            <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', statusColor(nextAppt.status))}>
              {statusLabel(nextAppt.status)}
            </span>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {QUICK_ACTIONS.map((a, i) => (
          <motion.div key={a.to}
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + i * 0.05, type: 'spring', stiffness: 300 }}>
            <Link to={a.to}
              className={`flex flex-col items-center justify-center gap-3 py-5 ${a.bg} border border-transparent hover:border-brand-200 dark:hover:border-brand-700 rounded-2xl btn-spring transition-all`}>
              <div className={`w-12 h-12 bg-gradient-to-br ${a.color} rounded-2xl flex items-center justify-center shadow-sm`}>
                <a.Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-semibold text-foreground">{a.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Цаг захиалгууд</h3>
          <Link to="/patient/appointments" className="text-sm text-brand-600 flex items-center gap-0.5 hover:underline">
            Бүгдийг харах <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">{[1, 2, 3].map((i) => <SkeletonCard key={i} lines={2} />)}</div>
        ) : appointments.length === 0 ? (
          <Empty icon={<CalendarPlus className="w-8 h-8 text-brand-400" />}
            title="Цаг захиалга байхгүй" description="Эхний цаг захиалгаа хийгээрэй"
            action={<Link to="/book" className="px-6 py-2.5 brand-gradient text-white rounded-xl font-medium btn-spring">Цаг захиалах</Link>} />
        ) : (
          <div className="space-y-2">
            {appointments.slice(0, 5).map((appt) => (
              <div key={appt._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CalendarCheck2 className="w-5 h-5 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{appt.service?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(appt.date)} · {appt.startTime}</p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', statusColor(appt.status))}>
                  {statusLabel(appt.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
