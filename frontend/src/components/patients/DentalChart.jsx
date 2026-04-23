import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { dentalChartService } from '@/services/api';
import { TOOTH_STATUSES } from '@/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';

// Colors derived from TOOTH_STATUSES constant
const STATUS_COLORS = Object.fromEntries(TOOTH_STATUSES.map((s) => [s.value, s.color]));

// FDI numbering: patient's right on left side, patient's left on right side
const UPPER_ROW = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_ROW = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

function getToothType(n) {
  const d = n % 10;
  if (d >= 6) return 'molar';
  if (d === 4 || d === 5) return 'premolar';
  if (d === 3) return 'canine';
  return 'incisor';
}

// Pixel width per tooth type (used for consistent upper/lower column alignment)
const TOOTH_W = { molar: 28, premolar: 23, canine: 20, incisor: 22 };

/**
 * SVG tooth shape.
 * ViewBox: 0 0 26 40
 * Upper teeth (isUpper=true): root at top (y 1-18), crown at bottom (y 20-38)
 * Lower teeth (isUpper=false): crown at top (y 2-20), root at bottom (y 22-39)
 */
function ToothSVG({ number, isUpper, status }) {
  const type = getToothType(number);
  const isMissing = status === 'missing';
  const fill = isMissing ? 'none' : (STATUS_COLORS[status] || STATUS_COLORS.healthy);
  const crownStroke = isMissing ? '#94a3b8' : 'rgba(255,255,255,0.55)';
  const crownSW = isMissing ? '1' : '1.4';
  const crownDash = isMissing ? '3,2' : undefined;

  const rootFill = '#e2e8f0';
  const rootStroke = '#c1c9d2';

  // Crown paths
  const CROWNS = {
    molar: {
      upper: 'M2,22 Q2,20 13,20 Q24,20 24,22 L24,36 Q24,38 13,38 Q2,38 2,36 Z',
      lower: 'M2,4 Q2,2 13,2 Q24,2 24,4 L24,18 Q24,20 13,20 Q2,20 2,18 Z',
    },
    premolar: {
      upper: 'M5,22 Q5,20 13,20 Q21,20 21,22 L21,36 Q21,38 13,38 Q5,38 5,36 Z',
      lower: 'M5,4 Q5,2 13,2 Q21,2 21,4 L21,18 Q21,20 13,20 Q5,20 5,18 Z',
    },
    canine: {
      // Upper canine: pointed tip at bottom (toward lower jaw)
      upper: 'M9,21 Q9,20 13,20 Q17,20 17,21 L17,33 Q16.5,38 13,38 Q9.5,38 9,33 Z',
      // Lower canine: pointed tip at top (toward upper jaw)
      lower: 'M9,9 Q9.5,2 13,2 Q16.5,2 17,9 L17,19 Q16,20 13,20 Q10,20 9,19 Z',
    },
    incisor: {
      upper: 'M6,21 Q6,20 13,20 Q20,20 20,21 L20,36 Q20,38 18,38 L8,38 Q6,38 6,36 Z',
      lower: 'M6,4 Q6,2 8,2 L18,2 Q20,2 20,4 L20,18 Q20,20 18,20 L8,20 Q6,20 6,18 Z',
    },
  };

  const crownPath = CROWNS[type][isUpper ? 'upper' : 'lower'];

  // Root paths
  const singleRootUp = 'M11,20 L11,4 Q11,1 13,1 Q15,1 15,4 L15,20 Z';
  const doubleRootUp = (
    <>
      <path d="M7,20 L7,4 Q7,1 9.5,1 Q12,1 12,4 L12,20 Z" fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
      <path d="M14,20 L14,4 Q14,1 16.5,1 Q19,1 19,4 L19,20 Z" fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
    </>
  );
  const singleRootDown = 'M11,20 L11,36 Q11,39 13,39 Q15,39 15,36 L15,20 Z';
  const doubleRootDown = (
    <>
      <path d="M7,20 L7,36 Q7,39 9.5,39 Q12,39 12,36 L12,20 Z" fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
      <path d="M14,20 L14,36 Q14,39 16.5,39 Q19,39 19,36 L19,20 Z" fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
    </>
  );

  const isMolar = type === 'molar';

  return (
    <svg viewBox="0 0 26 40" width="100%" height="100%">
      {/* Roots */}
      {isUpper
        ? isMolar
          ? doubleRootUp
          : <path d={singleRootUp} fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
        : isMolar
          ? doubleRootDown
          : <path d={singleRootDown} fill={rootFill} stroke={rootStroke} strokeWidth="0.7" />
      }

      {/* Crown */}
      <path
        d={crownPath}
        fill={fill}
        stroke={crownStroke}
        strokeWidth={crownSW}
        strokeDasharray={crownDash}
        opacity={isMissing ? 1 : 0.92}
      />

      {/* Cusp detail lines — subtle grooves for molars/premolars */}
      {!isMissing && type === 'molar' && isUpper && (
        <>
          <line x1="9"  y1="21" x2="9"  y2="25" stroke="white" strokeWidth="0.8" opacity="0.35" />
          <line x1="13" y1="20" x2="13" y2="25" stroke="white" strokeWidth="0.8" opacity="0.35" />
          <line x1="17" y1="21" x2="17" y2="25" stroke="white" strokeWidth="0.8" opacity="0.35" />
        </>
      )}
      {!isMissing && type === 'molar' && !isUpper && (
        <>
          <line x1="9"  y1="16" x2="9"  y2="20" stroke="white" strokeWidth="0.8" opacity="0.35" />
          <line x1="13" y1="15" x2="13" y2="20" stroke="white" strokeWidth="0.8" opacity="0.35" />
          <line x1="17" y1="16" x2="17" y2="20" stroke="white" strokeWidth="0.8" opacity="0.35" />
        </>
      )}
      {!isMissing && type === 'premolar' && isUpper && (
        <line x1="13" y1="20" x2="13" y2="25" stroke="white" strokeWidth="0.8" opacity="0.35" />
      )}
      {!isMissing && type === 'premolar' && !isUpper && (
        <line x1="13" y1="15" x2="13" y2="20" stroke="white" strokeWidth="0.8" opacity="0.35" />
      )}
    </svg>
  );
}

function ToothCell({ number, status, onClick, isUpper }) {
  const type = getToothType(number);
  const w = TOOTH_W[type];

  return (
    <motion.div
      className={cn('flex items-center cursor-pointer select-none', isUpper ? 'flex-col' : 'flex-col-reverse')}
      whileHover={{ scale: 1.13 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      title={`#${number}`}
    >
      <span className={cn(
        'text-[8px] font-semibold text-muted-foreground leading-none',
        isUpper ? 'mb-0.5' : 'mt-0.5',
      )}>
        {number}
      </span>
      <div style={{ width: w, height: 50 }}>
        <ToothSVG number={number} isUpper={isUpper} status={status} />
      </div>
    </motion.div>
  );
}

export default function DentalChart({ patientId, readonly = false }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toothEdit, setToothEdit] = useState({ status: 'healthy', notes: '' });

  const load = () => {
    setLoading(true);
    dentalChartService.get(patientId).then(({ data }) => setChart(data.data)).finally(() => setLoading(false));
  };

  useEffect(() => { if (patientId) load(); }, [patientId]);

  const getStatus = (num) => chart?.teeth?.find((t) => t.toothNumber === num)?.status || 'healthy';

  const handleToothClick = (num) => {
    if (readonly) return;
    const existing = chart?.teeth?.find((t) => t.toothNumber === num);
    setToothEdit({ status: existing?.status || 'healthy', notes: existing?.notes || '' });
    setSelectedTooth(num);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dentalChartService.updateTooth(patientId, selectedTooth, toothEdit);
      await load();
      setSelectedTooth(null);
      toast.success(`Шүд #${selectedTooth} шинэчлэгдлээ`);
    } catch {
      toast.error('Хадгалах үед алдаа гарлаа');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 overflow-x-auto">
        {/* Side labels */}
        <div className="flex justify-between mb-1 min-w-[480px]">
          <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">← Баруун</span>
          <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wide">Зүүн →</span>
        </div>

        {/* Upper jaw */}
        <p className="text-[9px] text-center text-muted-foreground mb-1 min-w-[480px]">Дээд эрүү</p>
        <div className="flex justify-center gap-0.5 min-w-[480px]">
          {UPPER_ROW.map((n) => (
            <ToothCell key={n} number={n} status={getStatus(n)} onClick={() => handleToothClick(n)} isUpper />
          ))}
        </div>

        {/* Midline */}
        <div className="flex items-center gap-2 my-2 min-w-[480px]">
          <div className="flex-1 border-t-2 border-dashed border-brand-200 dark:border-brand-800" />
          <span className="text-[9px] text-brand-400 dark:text-brand-600 font-semibold uppercase tracking-widest whitespace-nowrap">Дунд шугам</span>
          <div className="flex-1 border-t-2 border-dashed border-brand-200 dark:border-brand-800" />
        </div>

        {/* Lower jaw */}
        <div className="flex justify-center gap-0.5 min-w-[480px]">
          {LOWER_ROW.map((n) => (
            <ToothCell key={n} number={n} status={getStatus(n)} onClick={() => handleToothClick(n)} isUpper={false} />
          ))}
        </div>
        <p className="text-[9px] text-center text-muted-foreground mt-1 min-w-[480px]">Доод эрүү</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
        {TOOTH_STATUSES.map((s) => (
          <div key={s.value} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-xs text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tooth edit modal */}
      <AnimatePresence>
        {selectedTooth && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTooth(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{selectedTooth}</span>
                  </div>
                  <h3 className="font-bold">Шүдний мэдээлэл</h3>
                </div>
                <button onClick={() => setSelectedTooth(null)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-5">
                <label className="text-sm font-medium block">Төлөв сонгох</label>
                <div className="grid grid-cols-3 gap-2">
                  {TOOTH_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setToothEdit((e) => ({ ...e, status: s.value }))}
                      className={cn(
                        'p-2 rounded-xl border-2 text-xs font-medium transition-all flex flex-col items-center gap-1.5',
                        toothEdit.status === s.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                      )}
                    >
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="leading-tight text-center">{s.label}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Тайлбар</label>
                  <textarea
                    value={toothEdit.notes}
                    onChange={(e) => setToothEdit((ed) => ({ ...ed, notes: e.target.value }))}
                    placeholder="Нэмэлт тайлбар..."
                    rows={2}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60"
              >
                {saving
                  ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Хадгалж байна...</span>
                  : 'Хадгалах'
                }
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
