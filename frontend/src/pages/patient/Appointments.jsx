import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';
import { appointmentService } from '@/services/api';
import { formatDate, statusLabel, statusColor, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';

const FILTER_TABS = [
  { key: '', label: 'Бүгд' },
  { key: 'pending', label: 'Хүлээгдэж буй' },
  { key: 'confirmed', label: 'Батлагдсан' },
  { key: 'completed', label: 'Дууссан' },
  { key: 'cancelled', label: 'Цуцлагдсан' },
];

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');

  const load = (status) => {
    setLoading(true);
    const params = { limit: 20, sort: '-date' };
    if (status) params.status = status;
    appointmentService.getAll(params).then(({ data }) => setAppointments(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(activeTab); }, [activeTab]);

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Цаг захиалгууд</h1>
        <Link to="/book" className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Захиалах
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-4">
        {FILTER_TABS.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0',
              activeTab === tab.key ? 'brand-gradient text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground hover:bg-brand-50 dark:hover:bg-brand-900/20')}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList count={5} /> : appointments.length === 0 ? (
        <Empty icon="📅" title="Цаг захиалга байхгүй"
          action={<Link to="/book" className="px-6 py-2.5 brand-gradient text-white rounded-xl font-medium">Цаг захиалах</Link>} />
      ) : (
        <div className="space-y-3">
          {appointments.map((appt) => (
            <div key={appt._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-soft">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 brand-gradient rounded-xl flex flex-col items-center justify-center text-white flex-shrink-0">
                  <span className="text-base font-bold leading-none">{new Date(appt.date).getDate()}</span>
                  <span className="text-[9px]">{new Date(appt.date).toLocaleDateString('mn-MN', { month: 'short' })}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{appt.service?.name}</p>
                  <p className="text-xs text-muted-foreground">Эмч: {appt.doctor?.lastName} {appt.doctor?.firstName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{appt.startTime} – {appt.endTime}</p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium flex-shrink-0', statusColor(appt.status))}>
                  {statusLabel(appt.status)}
                </span>
              </div>
              {appt.notes && <p className="text-xs text-muted-foreground mt-2 pl-15 ml-15 border-t border-slate-100 dark:border-slate-800 pt-2">{appt.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
