import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Star, Stethoscope, Sparkles, Sun, Wrench, Scissors, Building2, Smile, HelpCircle, Banknote } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfToday } from 'date-fns';
import { mn } from 'date-fns/locale';
import { serviceService, doctorService, appointmentService } from '@/services/api';
import { cn, formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';
import 'react-day-picker/dist/style.css';

const STEPS = ['Үйлчилгээ', 'Эмч', 'Огноо & Цаг', 'Баталгаажуулах'];
const CATEGORIES_ICON = {
  diagnosis: Stethoscope,
  cleaning: Sparkles,
  whitening: Sun,
  filling: Wrench,
  extraction: Scissors,
  surgery: Building2,
  orthodontics: Smile,
  other: HelpCircle,
};
const CATEGORIES_COLOR = {
  diagnosis: { bg: 'bg-sky-100 dark:bg-sky-900/30', icon: 'text-sky-500' },
  cleaning:  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', icon: 'text-cyan-500' },
  whitening: { bg: 'bg-amber-100 dark:bg-amber-900/30', icon: 'text-amber-500' },
  filling:   { bg: 'bg-orange-100 dark:bg-orange-900/30', icon: 'text-orange-500' },
  extraction:{ bg: 'bg-rose-100 dark:bg-rose-900/30', icon: 'text-rose-500' },
  surgery:   { bg: 'bg-purple-100 dark:bg-purple-900/30', icon: 'text-purple-500' },
  orthodontics: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: 'text-emerald-500' },
  other:     { bg: 'bg-slate-100 dark:bg-slate-800', icon: 'text-slate-500' },
};

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ service: null, doctor: null, date: null, slot: null, notes: '' });

  useEffect(() => { serviceService.getAll().then(({ data }) => setServices(data.data || [])); }, []);
  useEffect(() => { if (step === 1) doctorService.getAll().then(({ data }) => setDoctors(data.data || [])); }, [step]);
  useEffect(() => {
    if (step === 2 && form.doctor && form.date) {
      setLoading(true);
      appointmentService.getSlots(form.doctor.user._id || form.doctor._id, format(form.date, 'yyyy-MM-dd'))
        .then(({ data }) => setSlots(data.data || []))
        .catch(() => setSlots([]))
        .finally(() => setLoading(false));
    }
  }, [step, form.doctor, form.date]);

  const canNext = [
    !!form.service,
    !!form.doctor,
    !!form.date && !!form.slot,
    true,
  ][step];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const [h, m] = form.slot.time.split(':').map(Number);
      const [eh, em] = form.slot.endTime.split(':').map(Number);
      await appointmentService.create({
        doctor:    form.doctor.user?._id || form.doctor._id,
        service:   form.service._id,
        date:      format(form.date, 'yyyy-MM-dd'),
        startTime: form.slot.time,
        endTime:   form.slot.endTime,
        notes:     form.notes,
      });
      toast.success('🦷 Цаг захиалга амжилттай!');
      navigate('/patient/appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container py-6 max-w-2xl">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className={cn('flex items-center gap-2', i < STEPS.length - 1 && 'flex-1')}>
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                i < step ? 'bg-brand-600 text-white' : i === step ? 'brand-gradient text-white shadow-brand' : 'bg-slate-200 dark:bg-slate-700 text-muted-foreground')}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('flex-1 h-1 rounded-full mx-1 transition-all', i < step ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700')} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          {STEPS.map((s, i) => <span key={i} className={cn(i === step && 'text-brand-600 font-medium')}>{s}</span>)}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>

          {/* Step 1: Services */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Үйлчилгээ сонгох</h2>
              <div className="grid grid-cols-2 gap-3">
                {services.map((svc) => (
                  <motion.button key={svc._id} whileTap={{ scale: 0.97 }}
                    onClick={() => setForm((f) => ({ ...f, service: svc }))}
                    className={cn('p-4 rounded-2xl border-2 text-left transition-all',
                      form.service?._id === svc._id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300')}>
                    {(() => {
                      const Icon = CATEGORIES_ICON[svc.category] || HelpCircle;
                      const clr = CATEGORIES_COLOR[svc.category] || CATEGORIES_COLOR.other;
                      return (
                        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-3', clr.bg)}>
                          <Icon size={24} className={clr.icon} strokeWidth={1.8} />
                        </div>
                      );
                    })()}
                    <p className="font-semibold text-sm">{svc.name}</p>
                    <p className="text-xs text-brand-600 mt-1 font-medium">{formatCurrency(svc.price)}</p>
                    <p className="text-xs text-muted-foreground">{svc.duration} мин</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Doctor */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Эмч сонгох</h2>
              <div className="space-y-3">
                {doctors.map((doc) => (
                  <motion.button key={doc._id} whileTap={{ scale: 0.98 }}
                    onClick={() => setForm((f) => ({ ...f, doctor: doc }))}
                    className={cn('w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition-all',
                      form.doctor?._id === doc._id
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300')}>
                    <div className="w-14 h-14 brand-gradient rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {doc.user?.firstName?.[0]}{doc.user?.lastName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{doc.user?.lastName} {doc.user?.firstName}</p>
                      <p className="text-sm text-brand-600">{doc.specialization}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < Math.round(doc.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />)}
                        </div>
                        <span className="text-xs text-muted-foreground">{doc.experience} жил</span>
                      </div>
                    </div>
                    {form.doctor?._id === doc._id && <Check className="w-5 h-5 text-brand-600 flex-shrink-0" />}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Огноо & Цаг сонгох</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4 flex justify-center">
                <DayPicker
                  mode="single"
                  selected={form.date}
                  onSelect={(d) => setForm((f) => ({ ...f, date: d, slot: null }))}
                  disabled={[{ before: startOfToday() }, { dayOfWeek: [0, 6] }]}
                  locale={mn}
                  classNames={{
                    day_selected: 'brand-gradient text-white rounded-lg',
                    day_today: 'border border-brand-500 rounded-lg font-bold',
                    day: 'hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition-colors',
                  }}
                />
              </div>
              {form.date && (
                <div>
                  <p className="text-sm font-medium mb-3">
                    {format(form.date, 'yyyy оны MM сарын dd', { locale: mn })} — боломжит цагууд
                  </p>
                  {loading ? (
                    <div className="flex justify-center py-8"><Spinner /></div>
                  ) : slots.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-6">Тухайн өдөр боломжит цаг байхгүй байна</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <motion.button key={slot.time} whileTap={{ scale: 0.93 }}
                          disabled={slot.isBooked}
                          onClick={() => setForm((f) => ({ ...f, slot }))}
                          className={cn('py-2.5 rounded-xl text-sm font-medium transition-all',
                            slot.isBooked ? 'bg-slate-100 dark:bg-slate-800 text-muted-foreground cursor-not-allowed line-through opacity-50'
                              : form.slot?.time === slot.time ? 'brand-gradient text-white shadow-brand'
                              : 'border border-slate-200 dark:border-slate-700 hover:border-brand-400')}>
                          {slot.time}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-4">Захиалга баталгаажуулах</h2>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-4 space-y-3">
                {[
                  ['🦷 Үйлчилгээ', form.service?.name],
                  ['👨‍⚕️ Эмч', `${form.doctor?.user?.lastName} ${form.doctor?.user?.firstName}`],
                  ['📅 Огноо', form.date ? format(form.date, 'yyyy-MM-dd') : ''],
                  ['🕐 Цаг', form.slot?.time],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-brand-500" /> Үнэ
                  </span>
                  <span className="text-base font-bold text-brand-600">{formatCurrency(form.service?.price)}</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Нэмэлт тайлбар (заавал биш)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={3}
                  placeholder="Ямар нэг тайлбар байвал бичнэ үү..."
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 sticky bottom-safe pb-4">
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-2 px-5 py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Буцах
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep((s) => s + 1)} disabled={!canNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-50">
            Үргэлжлүүлэх <ChevronRight className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
            {submitting ? <><Spinner size="sm" /> Захиалж байна...</> : '✅ Захиалга баталгаажуулах'}
          </motion.button>
        )}
      </div>
    </div>
  );
}
