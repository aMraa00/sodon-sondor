import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Download, Wallet } from 'lucide-react';
import { paymentService, appointmentService, patientService } from '@/services/api';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import { toast } from 'sonner';
import { PAYMENT_METHODS } from '@/constants';

export default function ReceptionPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ appointment: '', patient: '', services: [], method: 'cash', discount: 0, notes: '' });

  const load = () => {
    setLoading(true);
    paymentService.getAll({ limit: 30 }).then(({ data }) => setPayments(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (showForm) {
      appointmentService.getAll({ status: 'confirmed', limit: 50 }).then(({ data }) => setAppointments(data.data || []));
    }
  }, [showForm]);

  const handleApptSelect = (apptId) => {
    const appt = appointments.find((a) => a._id === apptId);
    if (!appt) return;
    setForm((f) => ({
      ...f,
      appointment: apptId,
      patient: appt.patient?._id,
      services: [{ service: appt.service?._id, price: appt.service?.price || 0, qty: 1, name: appt.service?.name }],
    }));
  };

  const total = form.services.reduce((s, i) => s + i.price * i.qty, 0) - (Number(form.discount) || 0);

  const handleSubmit = async () => {
    if (!form.appointment || !form.patient || form.services.length === 0) {
      return toast.error('Захиалга болон үйлчилгээ сонгоно уу');
    }
    setSaving(true);
    try {
      await paymentService.create({ ...form, total, subtotal: form.services.reduce((s, i) => s + i.price * i.qty, 0) });
      toast.success('Төлбөр амжилттай бүртгэгдлээ!');
      setShowForm(false);
      setForm({ appointment: '', patient: '', services: [], method: 'cash', discount: 0, notes: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  const handleInvoice = async (id) => {
    try {
      const res = await paymentService.getInvoice(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `invoice-${id}.pdf`; a.click();
      URL.revokeObjectURL(url);
    } catch { toast.error('PDF татахад алдаа гарлаа'); }
  };

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Төлбөрийн бүртгэл</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring">
          <Plus className="w-4 h-4" /> Төлбөр бүртгэх
        </button>
      </div>

      {loading ? <SkeletonList count={5} /> : payments.length === 0 ? (
        <Empty icon={<Wallet className="w-8 h-8 text-white" />} title="Төлбөрийн бүртгэл байхгүй" />
      ) : (
        <div className="space-y-3">
          {payments.map((pay) => (
            <div key={pay._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
                      {pay.receiptNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(pay.paidAt)}</span>
                  </div>
                  <p className="font-semibold text-sm">{pay.patient?.lastName} {pay.patient?.firstName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {PAYMENT_METHODS.find((m) => m.value === pay.method)?.label} ·{' '}
                    {pay.collectedBy?.lastName} {pay.collectedBy?.firstName}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-600 text-lg">{formatCurrency(pay.total)}</p>
                  {pay.discount > 0 && <p className="text-xs text-muted-foreground">Хөнгөлөлт: -{formatCurrency(pay.discount)}</p>}
                  <button onClick={() => handleInvoice(pay._id)}
                    className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:underline ml-auto">
                    <Download className="w-3 h-3" /> Нэхэмжлэх
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payment Form Sheet */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)} className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 right-0 bottom-0 z-[60] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-bold text-lg">Төлбөр бүртгэх</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Цаг захиалга (батлагдсан)</label>
                  <select value={form.appointment} onChange={(e) => handleApptSelect(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Цаг захиалга сонгоно уу</option>
                    {appointments.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.patient?.lastName} {a.patient?.firstName} — {a.service?.name} ({formatDate(a.date)} {a.startTime})
                      </option>
                    ))}
                  </select>
                </div>

                {form.services.length > 0 && (
                  <div className="bg-brand-50 dark:bg-brand-900/20 rounded-xl p-4 space-y-2">
                    {form.services.map((s, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span>{s.name}</span>
                        <span className="font-semibold">{formatCurrency(s.price * s.qty)}</span>
                      </div>
                    ))}
                    <div className="border-t border-brand-200 dark:border-brand-700 pt-2">
                      <div className="flex justify-between text-sm">
                        <span>Хөнгөлөлт</span>
                        <input type="number" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                          className="w-24 text-right px-2 py-1 rounded-lg border border-input bg-white dark:bg-slate-800 text-sm" />
                      </div>
                      <div className="flex justify-between font-bold text-brand-600 mt-1">
                        <span>Нийт дүн</span>
                        <span>{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Төлбөрийн хэлбэр</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map((m) => (
                      <button key={m.value} onClick={() => setForm((f) => ({ ...f, method: m.value }))}
                        className={cn('py-2.5 rounded-xl border-2 text-xs font-medium transition-all',
                          form.method === m.value ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700' : 'border-slate-200 dark:border-slate-700')}>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Тайлбар</label>
                  <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    rows={2} placeholder="Нэмэлт тайлбар..."
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
                </div>
              </div>
              <div className="p-5 border-t border-slate-200 dark:border-slate-800">
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={saving}
                  className="w-full py-3.5 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                  {saving ? 'Бүртгэж байна...' : (
                    <span className="flex items-center justify-center gap-2">
                      <Wallet className="w-4 h-4" />
                      {formatCurrency(total)} Төлбөр бүртгэх
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
