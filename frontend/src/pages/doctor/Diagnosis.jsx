import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { patientService, diagnosisService } from '@/services/api';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';

const schema = z.object({
  patient:     z.string().min(1, 'Өвчтөн сонгоно уу'),
  title:       z.string().min(2, 'Оношлогооны нэр оруулна уу'),
  icdCode:     z.string().optional(),
  description: z.string().optional(),
  severity:    z.enum(['mild', 'moderate', 'severe']),
});

const SEVERITIES = [
  { value: 'mild',     label: 'Хөнгөн', color: 'text-green-600',  ring: 'ring-green-400',  activeBg: 'bg-green-50 dark:bg-green-950/40'  },
  { value: 'moderate', label: 'Дунд',   color: 'text-yellow-600', ring: 'ring-yellow-400', activeBg: 'bg-yellow-50 dark:bg-yellow-950/40' },
  { value: 'severe',   label: 'Хүнд',   color: 'text-red-600',    ring: 'ring-red-400',    activeBg: 'bg-red-50 dark:bg-red-950/40'       },
];

export default function DoctorDiagnosis() {
  const [patients, setPatients]             = useState([]);
  const [diagnoses, setDiagnoses]           = useState([]);
  const [showForm, setShowForm]             = useState(false);
  const [loading, setLoading]               = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedPatientInfo, setSelectedPatientInfo] = useState(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { severity: 'mild' },
  });

  const watchedSeverity  = watch('severity');
  const watchedPatient   = watch('patient');

  useEffect(() => {
    patientService.getAll({ limit: 100 }).then(({ data }) => setPatients(data.data || []));
  }, []);

  useEffect(() => {
    if (!selectedPatient) { setDiagnoses([]); return; }
    diagnosisService.getByPatient(selectedPatient).then(({ data }) => setDiagnoses(data.data || []));
  }, [selectedPatient]);

  useEffect(() => {
    if (watchedPatient) {
      const p = patients.find((x) => x._id === watchedPatient);
      setSelectedPatientInfo(p || null);
    }
  }, [watchedPatient, patients]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await diagnosisService.create(data);
      toast.success('Оношлогоо амжилттай бүртгэгдлээ');
      reset();
      setShowForm(false);
      setSelectedPatientInfo(null);
      if (data.patient === selectedPatient) {
        diagnosisService.getByPatient(selectedPatient).then(({ data: d }) => setDiagnoses(d.data || []));
      }
    } catch { toast.error('Алдаа гарлаа'); }
    finally { setLoading(false); }
  };

  const handleAIApply = ({ title, icdCode, severity, description }) => {
    if (title)       setValue('title',       title,       { shouldValidate: true });
    if (icdCode)     setValue('icdCode',     icdCode);
    if (severity)    setValue('severity',    severity,    { shouldValidate: true });
    if (description) setValue('description', description);
  };

  const patientAge = selectedPatientInfo?.birthDate
    ? new Date().getFullYear() - new Date(selectedPatientInfo.birthDate).getFullYear()
    : undefined;

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Оношлогоо</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Болих' : 'Оношлогоо нэмэх'}
        </button>
      </div>

      <AnimatedForm show={showForm}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-6 shadow-soft space-y-5">
          <h2 className="font-semibold">Шинэ оношлогоо</h2>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Patient */}
            <div>
              <label className="text-sm font-medium mb-1 block">Өвчтөн</label>
              <select
                {...register('patient')}
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Өвчтөн сонгоно уу</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.lastName} {p.firstName}</option>
                ))}
              </select>
              {errors.patient && <p className="text-red-500 text-xs mt-1">{errors.patient.message}</p>}
            </div>

            {/* Title + ICD */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1 block">Оношлогоо</label>
                <input
                  {...register('title')}
                  placeholder="Оношлогооны нэр"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">ICD-10</label>
                <input
                  {...register('icdCode')}
                  placeholder="K02.1"
                  className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-1 block">Тайлбар</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Нарийвчилсан тайлбар..."
                className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Severity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Хүнд байдал</label>
              <div className="flex gap-2">
                {SEVERITIES.map((s) => (
                  <label key={s.value} className="flex-1 cursor-pointer">
                    <input type="radio" {...register('severity')} value={s.value} className="sr-only" />
                    <span className={cn(
                      'block text-center py-2 border-2 rounded-xl text-sm font-medium transition-all',
                      s.color,
                      watchedSeverity === s.value
                        ? cn('border-current ring-1', s.ring, s.activeBg)
                        : 'border-slate-200 dark:border-slate-700 hover:border-current/40'
                    )}>
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => { setShowForm(false); reset(); setSelectedPatientInfo(null); }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Болих
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60"
              >
                {loading ? <Spinner size="sm" /> : 'Хадгалах'}
              </motion.button>
            </div>
          </form>
        </div>
      </AnimatedForm>

      {/* Patient selector */}
      <div className="mb-4">
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Өвчтөний оношлогоо харах...</option>
          {patients.map((p) => (
            <option key={p._id} value={p._id}>{p.lastName} {p.firstName}</option>
          ))}
        </select>
      </div>

      {/* Diagnosis list */}
      {selectedPatient && (
        <div className="space-y-3">
          {diagnoses.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Оношлогоо байхгүй байна</p>
          ) : diagnoses.map((d) => (
            <DiagnosisCard key={d._id} diagnosis={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function AnimatedForm({ show, children }) {
  return (
    <motion.div
      initial={false}
      animate={{ height: show ? 'auto' : 0, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

function DiagnosisCard({ diagnosis: d }) {
  const sev = SEVERITIES.find((s) => s.value === d.severity);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{d.title}</p>
            {d.icdCode && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {d.icdCode}
              </span>
            )}
          </div>
          {d.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.description}</p>}
          {d.doctor && (
            <p className="text-xs text-muted-foreground mt-1">
              Эмч: {d.doctor.lastName} {d.doctor.firstName}
            </p>
          )}
        </div>
        {sev && (
          <span className={cn(
            'shrink-0 text-xs px-2 py-0.5 rounded-full font-medium',
            d.severity === 'mild'     ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400'  :
            d.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400'
          )}>
            {sev.label}
          </span>
        )}
      </div>
      {d.aiSuggestion?.title && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          AI: {d.aiSuggestion.title}
        </div>
      )}
      <p className="text-xs text-muted-foreground mt-2">{formatDate(d.createdAt)}</p>
    </div>
  );
}
