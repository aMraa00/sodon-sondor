import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';
import { serviceService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import { formatCurrency, cn } from '@/lib/utils';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'diagnosis', label: 'Оношилгоо' },
  { value: 'cleaning', label: 'Цэвэрлэгээ' },
  { value: 'whitening', label: 'Цайруулалт' },
  { value: 'filling', label: 'Пломб' },
  { value: 'extraction', label: 'Авалт' },
  { value: 'orthodontics', label: 'Ортодонт' },
  { value: 'surgery', label: 'Мэс засал' },
  { value: 'other', label: 'Бусад' },
];

const EMPTY_FORM = { name: '', category: 'diagnosis', price: '', duration: 30, description: '', isActive: true };

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const load = () => {
    setLoading(true);
    serviceService.getAll({ limit: 50 }).then(({ data }) => setServices(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (s) => { setEditing(s._id); setForm({ name: s.name, category: s.category, price: s.price, duration: s.duration, description: s.description || '', isActive: s.isActive }); setShowForm(true); };

  const handleSubmit = async () => {
    if (!form.name || !form.price) return toast.error('Нэр болон үнийг оруулна уу');
    setSaving(true);
    try {
      if (editing) {
        await serviceService.update(editing, { ...form, price: Number(form.price) });
        toast.success('Үйлчилгээ шинэчлэгдлээ');
      } else {
        await serviceService.create({ ...form, price: Number(form.price) });
        toast.success('Үйлчилгээ нэмэгдлээ');
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Үйлчилгээг устгах уу?')) return;
    try {
      await serviceService.delete(id);
      toast.success('Устгагдлаа');
      load();
    } catch { toast.error('Алдаа гарлаа'); }
  };

  const catLabel = (val) => CATEGORIES.find((c) => c.value === val)?.label || val;

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Үйлчилгээнүүд</h1>
        <button onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Нэмэх
        </button>
      </div>

      {loading ? <SkeletonList count={6} /> : services.length === 0 ? <Empty icon="🦷" title="Үйлчилгээ байхгүй" /> : (
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{s.name}</p>
                  <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 rounded-full">
                    {catLabel(s.category)}
                  </span>
                  {!s.isActive && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Идэвхгүй</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold text-brand-600">{formatCurrency(s.price)}</span>
                  <span className="text-xs text-muted-foreground">{s.duration} мин</span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
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
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 right-0 bottom-0 z-[60] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg">{editing ? 'Үйлчилгээ засах' : 'Үйлчилгээ нэмэх'}</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1 block">Үйлчилгээний нэр</label>
                  <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Үйлчилгээний нэр" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Ангилал</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1 block">Үнэ (₮)</label>
                    <input value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                      type="number" placeholder="0" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block">Хугацаа (мин)</label>
                    <input value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                      type="number" placeholder="30" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Тайлбар</label>
                  <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-brand-600" />
                  <span className="text-sm">Идэвхтэй</span>
                </label>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                  className="w-full py-3.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                  {saving ? 'Хадгалж байна...' : editing ? 'Хадгалах' : 'Нэмэх'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
