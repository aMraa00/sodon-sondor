import { useState, useEffect } from 'react';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ReceptionAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    appointmentService.getAll({ limit: 30, sort: '-date' }).then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handle = async (id, status) => {
    try { await appointmentService.updateStatus(id, { status }); toast.success('Шинэчлэгдлээ'); load(); }
    catch { toast.error('Алдаа гарлаа'); }
  };

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-5">Цаг захиалгууд</h1>
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
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium inline-block mt-1', statusColor(appt.status))}>
                    {statusLabel(appt.status)}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {appt.status === 'pending' && (
                    <button onClick={() => handle(appt._id, 'confirmed')} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" title="Батлах">
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  {['pending', 'confirmed'].includes(appt.status) && (
                    <button onClick={() => handle(appt._id, 'cancelled')} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg" title="Цуцлах">
                      <XCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
