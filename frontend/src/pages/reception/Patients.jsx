import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, User, Phone, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { patientService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import UserAvatar from '@/components/common/UserAvatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const schema = z.object({
  lastName:   z.string().min(2, 'Овог хамгийн багадаа 2 тэмдэгт'),
  firstName:  z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт'),
  email:      z.string().email('Зөв имэйл оруулна уу'),
  phone:      z.string().min(8, 'Утасны дугаар оруулна уу'),
  gender:     z.enum(['male', 'female', 'other']),
  dateOfBirth:z.string().optional(),
  address:    z.string().optional(),
  bloodType:  z.string().optional(),
  allergies:  z.string().optional(),
});

export default function ReceptionPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { gender: 'male' } });

  const load = (s = '') => {
    setLoading(true);
    patientService.getAll({ search: s, limit: 30 }).then(({ data }) => setPatients(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t); }, [search]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, allergies: data.allergies ? data.allergies.split(',').map((s) => s.trim()) : [] };
      await patientService.create(payload);
      toast.success('Өвчтөн амжилттай бүртгэгдлээ!');
      setShowForm(false);
      reset();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Өвчтөн нар</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Өвчтөн нэмэх
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэр, имэйл, утасны дугаараар хайх..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Patient list */}
      {loading ? <SkeletonList count={6} /> : patients.length === 0 ? (
        <Empty icon="👥" title="Өвчтөн олдсонгүй"
          action={<button onClick={() => setShowForm(true)} className="px-6 py-2.5 brand-gradient text-white rounded-xl font-medium">Өвчтөн нэмэх</button>} />
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <div key={p._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 transition-all">
              <UserAvatar user={p} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.lastName} {p.firstName}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {p.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{p.phone}</span>}
                  {p.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{p.email}</span>}
                </div>
                {p.patientRecord?.patientCode && (
                  <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full mt-1 inline-block">
                    {p.patientRecord.patientCode}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg">Өвчтөн бүртгэх</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    {[['lastName', 'Овог'], ['firstName', 'Нэр']].map(([key, label]) => (
                      <div key={key}>
                        <label className="text-xs font-medium mb-1 block">{label}</label>
                        <input {...register(key)} placeholder={label} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                        {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key].message}</p>}
                      </div>
                    ))}
                  </div>

                  {[['email', 'Имэйл', 'email'], ['phone', 'Утас', 'tel'], ['dateOfBirth', 'Төрсөн огноо', 'date'], ['address', 'Хаяг', 'text']].map(([key, label, type]) => (
                    <div key={key}>
                      <label className="text-xs font-medium mb-1 block">{label}</label>
                      <input {...register(key)} type={type} placeholder={label} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                      {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key].message}</p>}
                    </div>
                  ))}

                  <div>
                    <label className="text-xs font-medium mb-1 block">Хүйс</label>
                    <select {...register('gender')} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="male">Эрэгтэй</option>
                      <option value="female">Эмэгтэй</option>
                      <option value="other">Бусад</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Цусны бүлэг</label>
                    <select {...register('bloodType')} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Сонгоно уу</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bt) => <option key={bt} value={bt}>{bt}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium mb-1 block">Харшил (таслалаар тусгаарлах)</label>
                    <input {...register('allergies')} placeholder="Пенициллин, латекс..." className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>

                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 text-xs text-muted-foreground">
                    💡 Анхны нууц үг: <strong>Patient@123</strong> — өвчтөн нэвтэрсний дараа өөрчилнө.
                  </div>
                </form>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800">
                <motion.button whileTap={{ scale: 0.97 }} form="patient-form" type="submit" disabled={saving}
                  className="w-full py-3.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                  {saving ? 'Бүртгэж байна...' : 'Өвчтөн бүртгэх'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
