import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Calendar, Clock, CheckCircle2, ChevronRight, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [todayAppts, setTodayAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    appointmentService.getAll({ date: today, limit: 20 }).then(({ data }) => setTodayAppts(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success(`Төлөв: ${statusLabel(status)}`);
      load();
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const stats = [
    { Icon: CalendarClock, label: 'Өнөөдрийн цаг', value: todayAppts.length, color: 'from-brand-500 to-brand-600' },
    { Icon: CheckCircle2, label: 'Дууссан', value: todayAppts.filter((a) => a.status === 'completed').length, color: 'from-green-500 to-green-600' },
    { Icon: Clock, label: 'Хүлээгдэж буй', value: todayAppts.filter((a) => a.status === 'pending' || a.status === 'confirmed').length, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="page-container py-6">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Өглөөний мэнд, Эмч {user?.firstName}!</h1>
        <p className="text-muted-foreground text-sm mt-1">{formatDate(new Date(), 'yyyy оны MM сарын dd')} · Өнөөдрийн хуваарь</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={`bg-gradient-to-br ${s.color} text-white rounded-2xl p-4 shadow-brand`}>
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center mb-2">
              <s.Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{loading ? '—' : s.value}</p>
            <p className="text-xs text-white/80">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold">Өнөөдрийн хуваарь</h2>
        <Link to="/doctor/appointments" className="text-sm text-brand-600 flex items-center gap-1">
          Бүгд <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? <SkeletonList count={4} /> : todayAppts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>Өнөөдөр цаг захиалга байхгүй байна</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayAppts.map((appt) => (
            <div key={appt._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-brand-600" />
                  <span className="text-xs font-bold text-brand-600">{appt.startTime}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.patient?.lastName} {appt.patient?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{appt.service?.name}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(appt.status))}>
                    {statusLabel(appt.status)}
                  </span>
                </div>
                {(appt.status === 'confirmed' || appt.status === 'pending') && (
                  <button onClick={() => handleStatus(appt._id, 'completed')}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-colors" title="Дуусгах">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
              <Link to={`/doctor/patients/${appt.patient?._id}`} className="mt-2 text-xs text-brand-600 hover:underline block">
                Өвчтөний хаяг харах →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
