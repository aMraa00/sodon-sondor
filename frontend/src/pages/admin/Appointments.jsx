import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import { toast } from 'sonner';

const STATUSES = [
  { value: '', label: 'Бүгд' },
  { value: 'pending', label: 'Хүлээгдэж буй' },
  { value: 'confirmed', label: 'Батлагдсан' },
  { value: 'completed', label: 'Дууссан' },
  { value: 'cancelled', label: 'Цуцлагдсан' },
  { value: 'no-show', label: 'Ирээгүй' },
];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const load = (s = '') => {
    setLoading(true);
    const params = { limit: 50, sort: '-date' };
    if (s) params.status = s;
    appointmentService.getAll(params).then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { load(statusFilter); }, [statusFilter]);

  const handleStatus = async (id, status) => {
    try {
      await appointmentService.updateStatus(id, { status });
      toast.success('Шинэчлэгдлээ');
      load(statusFilter);
    } catch { toast.error('Алдаа гарлаа'); }
  };

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Цаг захиалгууд</h1>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {STATUSES.map((s) => (
          <button key={s.value} onClick={() => setStatusFilter(s.value)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0',
              statusFilter === s.value
                ? 'brand-gradient text-white shadow-brand'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400')}>
            {s.label}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={6} /> : appointments.length === 0 ? <Empty icon="📅" title="Цаг захиалга байхгүй" /> : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 brand-gradient rounded-xl flex flex-col items-center justify-center text-white text-xs flex-shrink-0 font-bold">
                  <span>{new Date(appt.date).getDate()}</span>
                  <span>{new Date(appt.date).toLocaleDateString('mn-MN', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.patient?.lastName} {appt.patient?.firstName}</p>
                  <p className="text-xs text-muted-foreground">Эмч: {appt.doctor?.lastName} {appt.doctor?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{appt.service?.name} · {appt.startTime}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusColor(appt.status))}>
                      {statusLabel(appt.status)}
                    </span>
                    {appt.status === 'confirmed' && (
                      <button onClick={() => handleStatus(appt._id, 'completed')}
                        className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 rounded-full hover:bg-emerald-200 transition-colors">
                        Дууссан болгох
                      </button>
                    )}
                    {appt.status === 'confirmed' && (
                      <button onClick={() => handleStatus(appt._id, 'no-show')}
                        className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-800 rounded-full hover:bg-slate-200 transition-colors">
                        Ирээгүй
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
