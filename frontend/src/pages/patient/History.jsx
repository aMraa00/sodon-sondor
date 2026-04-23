import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { patientService } from '@/services/api';
import { formatDate, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import { ClipboardList, Pill, Calendar } from 'lucide-react';

const TABS = [
  { key: 'appointments', label: 'Цаг захиалга', icon: Calendar },
  { key: 'diagnoses', label: 'Оношлогоо', icon: ClipboardList },
  { key: 'prescriptions', label: 'Жор', icon: Pill },
];

export default function PatientHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState({ appointments: [], diagnoses: [], prescriptions: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('appointments');

  useEffect(() => {
    if (!user) return;
    patientService.getHistory(user._id).then(({ data }) => setHistory(data.data || {})).finally(() => setLoading(false));
  }, [user]);

  const items = history[tab] || [];

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-5">Эмнэлгийн түүх</h1>

      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              tab === key ? 'brand-gradient text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground')}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {loading ? <SkeletonList /> : items.length === 0 ? (
        <Empty icon="📋" title="Мэдээлэл байхгүй байна" />
      ) : (
        <div className="space-y-3">
          {tab === 'appointments' && items.map((a) => (
            <div key={a._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">{a.service?.name}</p>
                  <p className="text-xs text-muted-foreground">Эмч: {a.doctor?.lastName} {a.doctor?.firstName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{formatDate(a.date)} · {a.startTime}</p>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full', a.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')}>{a.status}</span>
              </div>
            </div>
          ))}
          {tab === 'diagnoses' && items.map((d) => (
            <div key={d._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="font-semibold text-sm">{d.title}</p>
              <p className="text-xs text-muted-foreground">{d.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Эмч: {d.doctor?.lastName} {d.doctor?.firstName} · {formatDate(d.createdAt)}</p>
            </div>
          ))}
          {tab === 'prescriptions' && items.map((rx) => (
            <div key={rx._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="font-semibold text-sm mb-2">Эмийн жор</p>
              {rx.medications?.map((m, i) => (
                <div key={i} className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{m.name}</span> — {m.dosage}, {m.frequency}, {m.duration}
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-2">Эмч: {rx.doctor?.lastName} {rx.doctor?.firstName} · {formatDate(rx.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
