import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { dentalChartService } from '@/services/api';
import { TOOTH_STATUSES } from '@/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';

const STATUS_COLORS = Object.fromEntries(TOOTH_STATUSES.map((s) => [s.value, s.color]));
const STATUS_GLOW   = {
  healthy:            '0 0 8px rgba(34,197,94,0.6)',
  caries:             '0 0 8px rgba(234,179,8,0.7)',
  filling:            '0 0 8px rgba(59,130,246,0.7)',
  missing:            'none',
  crown:              '0 0 8px rgba(168,85,247,0.7)',
  'root-canal':       '0 0 8px rgba(249,115,22,0.7)',
  implant:            '0 0 8px rgba(6,182,212,0.7)',
  bridge:             '0 0 8px rgba(236,72,153,0.7)',
  'extraction-needed':'0 0 10px rgba(239,68,68,0.8)',
};

const UPPER_ROW = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_ROW = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

function getToothType(n) {
  const d = n % 10;
  if (d >= 6) return 'molar';
  if (d === 4 || d === 5) return 'premolar';
  if (d === 3) return 'canine';
  return 'incisor';
}

const TOOTH_W = { molar: 30, premolar: 25, canine: 22, incisor: 22 };

// ── SVG Дишүүс (анатомийн хэлбэр + 3D gradient) ───────────────────────────
function ToothSVG({ number, isUpper, status, hovered }) {
  const type    = getToothType(number);
  const missing = status === 'missing';
  const color   = STATUS_COLORS[status] || STATUS_COLORS.healthy;
  const gid     = `g${number}`;   // unique gradient id
  const cgid    = `c${number}`;   // clip id
  const fgid    = `f${number}`;   // filter id

  // Crown paths — анатомийн хэлбэр
  // viewBox: 0 0 34 60.  Midline y=30.  Upper: crown y29-48, root y2-29. Lower: crown y12-31, root y31-58
  const CROWN = {
    molar: {
      upper: 'M3,46 C3,38 4,32 6,30 L28,30 C30,32 31,38 31,46 C31,50 28,52 17,52 C6,52 3,50 3,46 Z',
      lower: 'M3,14 C3,10 6,8 17,8 C28,8 31,10 31,14 C31,22 30,28 28,30 L6,30 C4,28 3,22 3,14 Z',
    },
    premolar: {
      upper: 'M6,46 C6,38 7,32 9,30 L25,30 C27,32 28,38 28,46 C28,50 25,52 17,52 C9,52 6,50 6,46 Z',
      lower: 'M6,14 C6,10 9,8 17,8 C25,8 28,10 28,14 C28,22 27,28 25,30 L9,30 C7,28 6,22 6,14 Z',
    },
    canine: {
      upper: 'M11,44 C11,38 12,33 14,30 Q17,27 17,27 Q17,27 20,30 C22,33 23,38 23,44 C23,50 21,53 17,53 C13,53 11,50 11,44 Z',
      lower: 'M11,16 C11,10 13,7 17,7 C21,7 23,10 23,16 C23,22 22,27 20,30 Q17,33 17,33 Q17,33 14,30 C12,27 11,22 11,16 Z',
    },
    incisor: {
      upper: 'M8,46 C8,39 9,33 10,30 L24,30 C25,33 26,39 26,46 L26,50 C26,52 23,53 17,53 C11,53 8,52 8,50 Z',
      lower: 'M8,10 L8,14 C8,21 9,27 10,30 L24,30 C25,27 26,21 26,14 L26,10 C26,8 23,7 17,7 C11,7 8,8 8,10 Z',
    },
  };

  const crownPath = CROWN[type][isUpper ? 'upper' : 'lower'];

  // Root paths
  const ROOT_UP_SINGLE   = 'M15,30 L14,10 C14,5 15,2 17,2 C19,2 20,5 20,10 L19,30 Z';
  const ROOT_UP_LEFT     = 'M10,30 L9,12 C9,7 10,4 12,4 C14,4 14,7 14,12 L14,30 Z';
  const ROOT_UP_RIGHT    = 'M20,30 L20,12 C20,7 20,4 22,4 C24,4 25,7 25,12 L24,30 Z';
  const ROOT_UP_MID      = 'M15,30 L15,8 C15,4 16,2 17,2 C18,2 19,4 19,8 L19,30 Z';
  const ROOT_DN_SINGLE   = 'M15,30 L14,50 C14,55 15,58 17,58 C19,58 20,55 20,50 L19,30 Z';
  const ROOT_DN_LEFT     = 'M10,30 L9,48 C9,53 10,56 12,56 C14,56 14,53 14,48 L14,30 Z';
  const ROOT_DN_RIGHT    = 'M20,30 L20,48 C20,53 20,56 22,56 C24,56 25,53 25,48 L24,30 Z';
  const ROOT_DN_MID      = 'M15,30 L15,52 C15,56 16,58 17,58 C18,58 19,56 19,52 L19,30 Z';

  const rootColor   = '#c8d3e0';
  const rootStroke  = '#9baabf';

  const isMolar    = type === 'molar';
  const isSingle   = !isMolar;
  const rootOpacity = 0.7;

  return (
    <svg viewBox="0 0 34 60" width="100%" height="100%" overflow="visible">
      <defs>
        {/* Crown 3D gradient */}
        <radialGradient id={gid} cx="35%" cy="30%" r="65%">
          <stop offset="0%"   stopColor="white"  stopOpacity="0.55" />
          <stop offset="45%"  stopColor={missing ? 'none' : color} stopOpacity={missing ? 0 : 0.9} />
          <stop offset="100%" stopColor={missing ? 'none' : color} stopOpacity={missing ? 0 : 1}   />
        </radialGradient>
        {/* Glow filter */}
        {!missing && (
          <filter id={fgid} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation={hovered ? '2.5' : '1.2'} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        )}
        {/* Mesh pattern */}
        <pattern id={`mesh${number}`} x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4"/>
        </pattern>
        <clipPath id={cgid}>
          <path d={crownPath} />
        </clipPath>
      </defs>

      {/* ── Roots ── */}
      {!missing && (
        <g opacity={rootOpacity}>
          {isUpper ? (
            isMolar ? (
              <>
                <path d={ROOT_UP_LEFT}  fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
                <path d={ROOT_UP_MID}   fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
                <path d={ROOT_UP_RIGHT} fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
              </>
            ) : (
              <path d={ROOT_UP_SINGLE} fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
            )
          ) : (
            isMolar ? (
              <>
                <path d={ROOT_DN_LEFT}  fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
                <path d={ROOT_DN_MID}   fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
                <path d={ROOT_DN_RIGHT} fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
              </>
            ) : (
              <path d={ROOT_DN_SINGLE} fill={rootColor} stroke={rootStroke} strokeWidth="0.5" />
            )
          )}
        </g>
      )}

      {/* ── Crown base shadow ── */}
      {!missing && (
        <path d={crownPath} fill={color} opacity="0.3"
          transform="translate(1.5,1.5)"
          filter={`blur(3px)`}
        />
      )}

      {/* ── Crown fill ── */}
      <path
        d={crownPath}
        fill={missing ? 'none' : `url(#${gid})`}
        stroke={missing ? '#4b6280' : 'rgba(255,255,255,0.3)'}
        strokeWidth={missing ? '1' : '0.8'}
        strokeDasharray={missing ? '2.5,1.5' : undefined}
        filter={!missing ? `url(#${fgid})` : undefined}
      />

      {/* ── Mesh overlay ── */}
      {!missing && (
        <rect x="0" y="0" width="34" height="60"
          fill={`url(#mesh${number})`}
          clipPath={`url(#${cgid})`}
          opacity="0.6"
        />
      )}

      {/* ── Crown highlight (white sheen top-left) ── */}
      {!missing && (
        <path
          d={crownPath}
          fill="url(#shine)"
          clipPath={`url(#${cgid})`}
          opacity="0.18"
        />
      )}

      {/* ── Cusp anatomy lines ── */}
      {!missing && type === 'molar' && isUpper && (
        <g clipPath={`url(#${cgid})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.7">
          <line x1="11" y1="30" x2="11" y2="40" />
          <line x1="17" y1="29" x2="17" y2="41" />
          <line x1="23" y1="30" x2="23" y2="40" />
          <line x1="3"  y1="38" x2="31" y2="38" />
        </g>
      )}
      {!missing && type === 'molar' && !isUpper && (
        <g clipPath={`url(#${cgid})`} stroke="rgba(255,255,255,0.2)" strokeWidth="0.7">
          <line x1="11" y1="20" x2="11" y2="30" />
          <line x1="17" y1="19" x2="17" y2="31" />
          <line x1="23" y1="20" x2="23" y2="30" />
          <line x1="3"  y1="22" x2="31" y2="22" />
        </g>
      )}
      {!missing && type === 'premolar' && (
        <line clipPath={`url(#${cgid})`} x1="17" y1={isUpper?'30':'30'} x2="17" y2={isUpper?'43':'17'}
          stroke="rgba(255,255,255,0.2)" strokeWidth="0.7" />
      )}

      {/* ── Edge highlight (top bright line) ── */}
      {!missing && (
        <path
          d={crownPath}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth="0.6"
          opacity="0.5"
        />
      )}
    </svg>
  );
}

// ── Shine gradient (shared across all teeth) ───────────────────────────────
function SharedDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
      <defs>
        <linearGradient id="shine" x1="0%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%"   stopColor="white" stopOpacity="1" />
          <stop offset="60%"  stopColor="white" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="jawGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="#1e3a5f" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0d1b2a" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Шүдний нүд ────────────────────────────────────────────────────────────
function ToothCell({ number, status, onClick, isUpper }) {
  const [hovered, setHovered] = useState(false);
  const type = getToothType(number);
  const w    = TOOTH_W[type];
  const color = STATUS_COLORS[status] || STATUS_COLORS.healthy;
  const missing = status === 'missing';

  return (
    <motion.div
      className="flex items-center cursor-pointer select-none relative"
      style={{ flexDirection: isUpper ? 'column' : 'column-reverse' }}
      whileHover={{ scale: 1.18, zIndex: 10 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      title={`Шүд #${number}`}
    >
      {/* Тоо */}
      <span className="text-[7px] font-mono text-slate-400 leading-none"
        style={{ marginBottom: isUpper ? 1 : 0, marginTop: isUpper ? 0 : 1 }}>
        {number}
      </span>
      {/* Гэрлийн гало (hover) */}
      {!missing && hovered && (
        <div className="absolute inset-0 rounded-full pointer-events-none"
          style={{ boxShadow: STATUS_GLOW[status] || STATUS_GLOW.healthy, opacity: 0.7 }} />
      )}
      <div style={{ width: w, height: 54 }}>
        <ToothSVG number={number} isUpper={isUpper} status={status} hovered={hovered} />
      </div>
    </motion.div>
  );
}

// ── Үндсэн компонент ───────────────────────────────────────────────────────
export default function DentalChart({ patientId, readonly = false }) {
  const [chart, setChart]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [saving, setSaving]           = useState(false);
  const [toothEdit, setToothEdit]     = useState({ status: 'healthy', notes: '' });

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
      <SharedDefs />

      {/* ── Зураглалын хэсэг ── */}
      <div className="rounded-2xl overflow-x-auto"
        style={{
          background: 'linear-gradient(160deg, #0d1b2a 0%, #0f2540 50%, #0d1b2a 100%)',
          border: '1px solid rgba(20,184,166,0.2)',
          boxShadow: '0 0 40px rgba(14,165,233,0.08) inset',
          padding: '16px',
        }}>

        {/* Гарчиг */}
        <div className="flex justify-between mb-3 min-w-[500px]">
          <span className="text-[9px] text-teal-400/60 font-mono uppercase tracking-widest">← БАРУУН</span>
          <span className="text-[9px] text-teal-400/40 font-mono uppercase tracking-widest">Шүдний зураглал</span>
          <span className="text-[9px] text-teal-400/60 font-mono uppercase tracking-widest">ЗҮҮН →</span>
        </div>

        {/* Дээд эрүү */}
        <p className="text-[8px] text-center text-teal-300/40 font-mono uppercase tracking-widest mb-2 min-w-[500px]">
          ─── ДЭЭД ЭРҮҮ ───
        </p>
        <div className="flex justify-center gap-px min-w-[500px]"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(20,184,166,0.15))' }}>
          {UPPER_ROW.map((n) => (
            <ToothCell key={n} number={n} status={getStatus(n)} onClick={() => handleToothClick(n)} isUpper />
          ))}
        </div>

        {/* Дунд шугам */}
        <div className="flex items-center gap-3 my-3 min-w-[500px]">
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(20,184,166,0.4), transparent)' }} />
          <span className="text-[8px] font-mono tracking-widest whitespace-nowrap" style={{ color: 'rgba(20,184,166,0.5)' }}>
            ✦ ДУНД ШУГАМ ✦
          </span>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(20,184,166,0.4), transparent)' }} />
        </div>

        {/* Доод эрүү */}
        <div className="flex justify-center gap-px min-w-[500px]"
          style={{ filter: 'drop-shadow(0 -4px 12px rgba(20,184,166,0.15))' }}>
          {LOWER_ROW.map((n) => (
            <ToothCell key={n} number={n} status={getStatus(n)} onClick={() => handleToothClick(n)} isUpper={false} />
          ))}
        </div>
        <p className="text-[8px] text-center text-teal-300/40 font-mono uppercase tracking-widest mt-2 min-w-[500px]">
          ─── ДООД ЭРҮҮ ───
        </p>
      </div>

      {/* ── Тайлбар ── */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 px-1">
        {TOOTH_STATUSES.map((s) => (
          <div key={s.value} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color, boxShadow: `0 0 4px ${s.color}80` }} />
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Засварлах modal ── */}
      <AnimatePresence>
        {selectedTooth && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedTooth(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
                  <div>
                    <h3 className="font-bold text-sm">Шүд #{selectedTooth}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{getToothType(selectedTooth)}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTooth(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-5">
                <label className="text-sm font-medium block">Төлөв сонгох</label>
                <div className="grid grid-cols-3 gap-2">
                  {TOOTH_STATUSES.map((s) => (
                    <button key={s.value}
                      onClick={() => setToothEdit((e) => ({ ...e, status: s.value }))}
                      className={cn(
                        'p-2 rounded-xl border-2 text-xs font-medium transition-all flex flex-col items-center gap-1.5',
                        toothEdit.status === s.value
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                      )}>
                      <div className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}90` }} />
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

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
                className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                {saving
                  ? <span className="flex items-center justify-center gap-2"><Spinner size="sm" /> Хадгалж байна...</span>
                  : 'Хадгалах'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
