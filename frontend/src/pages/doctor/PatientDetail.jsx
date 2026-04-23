import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, ClipboardList, Stethoscope, Pill, CreditCard } from 'lucide-react';
import { patientService } from '@/services/api';
import { formatDate, cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Loader';
import DentalChart from '@/components/patients/DentalChart';
import UserAvatar from '@/components/common/UserAvatar';

const TABS = [
  { key: 'info', label: 'Ерөнхий', icon: User },
  { key: 'chart', label: 'Шүдний зураглал', icon: Stethoscope },
  { key: 'history', label: 'Түүх', icon: ClipboardList },
  { key: 'prescriptions', label: 'Жор', icon: Pill },
];

export default function DoctorPatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');

  useEffect(() => {
    Promise.all([
      patientService.getById(id),
      patientService.getHistory(id),
    ]).then(([pd, hd]) => {
      setPatient(pd.data.data);
      setHistory(hd.data.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!patient) return <div className="page-container py-6 text-center text-muted-foreground">Өвчтөн олдсонгүй</div>;

  return (
    <div className="page-container py-6">
      <Link to="/doctor/patients" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-5 text-sm">
        <ArrowLeft className="w-4 h-4" /> Буцах
      </Link>

      {/* Patient header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-5 flex items-center gap-4">
        <UserAvatar user={patient} size="lg" />
        <div>
          <h2 className="text-lg font-bold">{patient.lastName} {patient.firstName}</h2>
          <p className="text-sm text-muted-foreground">{patient.email}</p>
          <p className="text-sm text-muted-foreground">{patient.phone}</p>
          {patient.patientRecord?.patientCode && (
            <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full font-medium">
              {patient.patientRecord.patientCode}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-5">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              tab === key ? 'brand-gradient text-white' : 'bg-slate-100 dark:bg-slate-800 text-muted-foreground')}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ['Төрсөн огноо', formatDate(patient.dateOfBirth)],
            ['Хүйс', patient.gender === 'male' ? 'Эрэгтэй' : patient.gender === 'female' ? 'Эмэгтэй' : '—'],
            ['Цусны бүлэг', patient.patientRecord?.bloodType || '—'],
            ['Даатгалын дугаар', patient.patientRecord?.insuranceNumber || '—'],
            ['Харшил', patient.patientRecord?.allergies?.join(', ') || '—'],
            ['Яаралтай холбоо', patient.patientRecord?.emergencyContact?.name || '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="text-xs text-muted-foreground mb-1">{label}</p>
              <p className="text-sm font-medium">{value || '—'}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'chart' && <DentalChart patientId={id} />}

      {tab === 'history' && (
        <div className="space-y-3">
          {history?.appointments?.map((a) => (
            <div key={a._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold text-sm">{a.service?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.date)} · {a.startTime}</p>
                </div>
                <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">{a.status}</span>
              </div>
            </div>
          ))}
          {!history?.appointments?.length && <p className="text-center text-muted-foreground py-8">Түүх байхгүй байна</p>}
        </div>
      )}

      {tab === 'prescriptions' && (
        <div className="space-y-3">
          {history?.prescriptions?.map((rx) => (
            <div key={rx._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <p className="font-semibold text-sm mb-2">Эмийн жор — {formatDate(rx.createdAt)}</p>
              {rx.medications?.map((m, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {m.name} — {m.dosage} {m.frequency} {m.duration}</p>
              ))}
            </div>
          ))}
          {!history?.prescriptions?.length && <p className="text-center text-muted-foreground py-8">Жор байхгүй байна</p>}
        </div>
      )}
    </div>
  );
}
