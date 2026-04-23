import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Star, Phone } from 'lucide-react';
import { doctorService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import UserAvatar from '@/components/common/UserAvatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SPECIALIZATIONS = ['Ерөнхий шүдний эмч', 'Ортодонтист', 'Хүүхдийн шүдний эмч', 'Мэс заслын эмч', 'Периодонтист', 'Эндодонтист'];

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ lastName: '', firstName: '', email: '', phone: '', specialization: SPECIALIZATIONS[0], licenseNumber: '', bio: '' });

  const load = (s = '') => {
    setLoading(true);
    doctorService.getAll({ search: s, limit: 30 }).then(({ data }) => setDoctors(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t); }, [search]);

  const handleSubmit = async () => {
    if (!form.lastName || !form.firstName || !form.email) return toast.error('Заавал талбаруудыг бөглөнө үү');
    setSaving(true);
    try {
      await doctorService.create(form);
      toast.success('Эмч амжилттай бүртгэгдлээ!');
      setShowForm(false);
      setForm({ lastName: '', firstName: '', email: '', phone: '', specialization: SPECIALIZATIONS[0], licenseNumber: '', bio: '' });
      load(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Эмч нар</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Эмч нэмэх
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Хайх..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading ? <SkeletonList count={5} /> : doctors.length === 0 ? <Empty icon="👨‍⚕️" title="Эмч олдсонгүй" /> : (
        <div className="space-y-3">
          {doctors.map((d) => (
            <div key={d._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <UserAvatar user={d.profile} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{d.profile?.lastName} {d.profile?.firstName}</p>
                  <p className="text-sm text-brand-600">{d.specialization}</p>
                  <div className="flex items-center gap-3 mt-1">
                    {d.profile?.phone && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="w-3 h-3" />{d.profile.phone}
                      </span>
                    )}
                    {d.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="w-3 h-3 fill-current" />{d.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={cn('text-xs px-2 py-1 rounded-full font-medium',
                  d.profile?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')}>
                  {d.profile?.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed right-0 top-0 bottom-0 z-[60] w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg">Эмч бүртгэх</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[['lastName', 'Овог'], ['firstName', 'Нэр']].map(([key, label]) => (
                    <div key={key}>
                      <label className="text-xs font-medium mb-1 block">{label}</label>
                      <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={label} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  ))}
                </div>
                {[['email', 'Имэйл', 'email'], ['phone', 'Утас', 'tel'], ['licenseNumber', 'Лицензийн дугаар', 'text']].map(([key, label, type]) => (
                  <div key={key}>
                    <label className="text-xs font-medium mb-1 block">{label}</label>
                    <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      type={type} placeholder={label} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-medium mb-1 block">Мэргэжил</label>
                  <select value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Товч танилцуулга</label>
                  <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-3 text-xs text-muted-foreground">
                  💡 Анхны нууц үг: <strong>Doctor@123</strong>
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                  className="w-full py-3.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                  {saving ? 'Бүртгэж байна...' : 'Эмч бүртгэх'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
