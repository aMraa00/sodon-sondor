import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CalendarClock, Wallet, ChevronRight } from 'lucide-react';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { SkeletonList } from '@/components/common/Loader';
import { toast } from 'sonner';

export default function ReceptionDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    const today = new Date().toISOString().split('T')[0];
    appointmentService.getAll({ date: today, limit: 20, sort: 'startTime' })
      .then(({ data }) => setAppointments(data.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleConfirm = async (id) => {
    try { await appointmentService.updateStatus(id, { status: 'confirmed' }); toast.success('Цаг батлагдлаа'); load(); }
    catch { toast.error('Алдаа гарлаа'); }
  };

  const QUICK_LINKS = [
    { to: '/reception/patients', Icon: UserPlus, label: 'Өвчтөн нэмэх', color: 'from-brand-500 to-brand-600' },
    { to: '/reception/appointments', Icon: CalendarClock, label: 'Цаг захиалга', color: 'from-blue-500 to-blue-600' },
    { to: '/reception/payments', Icon: Wallet, label: 'Төлбөр', color: 'from-emerald-500 to-emerald-600' },
  ];

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-6">Рецепцийн самбар</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {QUICK_LINKS.map((l, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={l.to} className={`flex flex-col items-center justify-center gap-2 py-5 bg-gradient-to-br ${l.color} text-white rounded-2xl shadow-md btn-spring`}>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <l.Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center">{l.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Өнөөдрийн цаг захиалга</h2>
        <Link to="/reception/appointments" className="text-sm text-brand-600 flex items-center gap-1">Бүгд <ChevronRight className="w-4 h-4" /></Link>
      </div>

      {loading ? <SkeletonList count={4} /> : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 brand-gradient rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {appt.startTime}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{appt.patient?.lastName} {appt.patient?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{appt.service?.name} · Эмч: {appt.doctor?.lastName} {appt.doctor?.firstName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusColor(appt.status))}>
                    {statusLabel(appt.status)}
                  </span>
                  {appt.status === 'pending' && (
                    <button onClick={() => handleConfirm(appt._id)} className="text-xs px-3 py-1 brand-gradient text-white rounded-lg font-medium btn-spring">
                      Батлах
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {appointments.length === 0 && <p className="text-center text-muted-foreground py-8">Өнөөдөр цаг захиалга байхгүй байна</p>}
        </div>
      )}
    </div>
  );
}
