import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { patientService } from '@/services/api';
import api from '@/services/api';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';

const schema = z.object({
  patient: z.string().min(1, 'Өвчтөн сонгоно уу'),
  title: z.string().min(2, 'Оношлогооны нэр оруулна уу'),
  description: z.string().optional(),
  severity: z.enum(['mild', 'moderate', 'severe']),
});

const SEVERITIES = [{ value: 'mild', label: 'Хөнгөн', color: 'text-green-600' }, { value: 'moderate', label: 'Дунд', color: 'text-yellow-600' }, { value: 'severe', label: 'Хүнд', color: 'text-red-600' }];

export default function DoctorDiagnosis() {
  const [patients, setPatients] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'mild' },
  });

  useEffect(() => {
    patientService.getAll({ limit: 50 }).then(({ data }) => setPatients(data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedPatient) return;
    api.get(`/diagnoses/patient/${selectedPatient}`).then(({ data }) => setDiagnoses(data.data || []));
  }, [selectedPatient]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/diagnoses', data);
      toast.success('Оношлогоо амжилттай бүртгэгдлээ');
      reset();
      setShowForm(false);
      if (data.patient === selectedPatient) {
        api.get(`/diagnoses/patient/${selectedPatient}`).then(({ data: d }) => setDiagnoses(d.data || []));
      }
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Оношлогоо</h1>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Оношлогоо нэмэх
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-soft">
          <h2 className="font-semibold mb-4">Шинэ оношлогоо</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Өвчтөн</label>
              <select {...register('patient')} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Өвчтөн сонгоно уу</option>
                {patients.map((p) => <option key={p._id} value={p._id}>{p.lastName} {p.firstName}</option>)}
              </select>
              {errors.patient && <p className="text-red-500 text-xs mt-1">{errors.patient.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Оношлогоо</label>
              <input {...register('title')} placeholder="Оношлогооны нэр" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Тайлбар</label>
              <textarea {...register('description')} rows={3} placeholder="Нарийвчилсан тайлбар..." className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Хүнд байдал</label>
              <div className="flex gap-2">
                {SEVERITIES.map((s) => (
                  <label key={s.value} className="flex-1">
                    <input type="radio" {...register('severity')} value={s.value} className="sr-only" />
                    <span className={cn('block text-center py-2 border-2 rounded-xl text-sm font-medium cursor-pointer transition-all', s.color)}>
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Болих</button>
              <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="flex-1 py-2.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                {loading ? <Spinner size="sm" /> : 'Хадгалах'}
              </motion.button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Patient selector for viewing diagnoses */}
      <div className="mb-4">
        <select value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">Өвчтөний оношлогоо харах...</option>
          {patients.map((p) => <option key={p._id} value={p._id}>{p.lastName} {p.firstName}</option>)}
        </select>
      </div>

      {selectedPatient && (
        <div className="space-y-3">
          {diagnoses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Оношлогоо байхгүй байна</p>
          ) : diagnoses.map((d) => (
            <div key={d._id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{d.title}</p>
                  {d.description && <p className="text-xs text-muted-foreground mt-1">{d.description}</p>}
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                  d.severity === 'mild' ? 'bg-green-100 text-green-700' : d.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700')}>
                  {SEVERITIES.find((s) => s.value === d.severity)?.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{formatDate(d.createdAt)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
