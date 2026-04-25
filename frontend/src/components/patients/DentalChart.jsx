import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { dentalChartService } from '@/services/api';
import { TOOTH_STATUSES } from '@/constants';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Spinner } from '@/components/common/Loader';

const STATUS_COLORS = Object.fromEntries(TOOTH_STATUSES.map((s) => [s.value, s.color]));

const UPPER_ROW = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_ROW = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

function getToothType(n) {
  const d = n % 10;
  if (d >= 6) return 'molar';
  if (d === 4 || d === 5) return 'premolar';
  if (d === 3) return 'canine';
  return 'incisor';
}

// Arch positions — teeth follow parabolic curves, rotated to face center
// x,y = center of tooth in SVG (viewBox 870x440), r = rotation degrees
const ARCH_U = [
  {x:100,y:80, r:-33},{x:153,y:104,r:-26},{x:205,y:126,r:-19},{x:255,y:143,r:-13},
  {x:302,y:157,r:-9}, {x:347,y:167,r:-5}, {x:388,y:174,r:-2}, {x:420,y:177,r:-1},
  {x:450,y:177,r:1},  {x:482,y:174,r:2},  {x:523,y:167,r:5},  {x:568,y:157,r:9},
  {x:615,y:143,r:13}, {x:665,y:126,r:19}, {x:717,y:104,r:26}, {x:770,y:80, r:33},
];
const ARCH_L = [
  {x:100,y:360,r:33}, {x:153,y:336,r:26}, {x:205,y:314,r:19}, {x:255,y:297,r:13},
  {x:302,y:283,r:9},  {x:347,y:273,r:5},  {x:388,y:266,r:2},  {x:420,y:263,r:1},
  {x:450,y:263,r:-1}, {x:482,y:266,r:-2}, {x:523,y:273,r:-5}, {x:568,y:283,r:-9},
  {x:615,y:297,r:-13},{x:665,y:314,r:-19},{x:717,y:336,r:-26},{x:770,y:360,r:-33},
];

const S = 0.73; // scale: viewBox 34×60 → ~25×44px

const CROWN = {
  molar:    { u:'M3,46 C3,38 4,32 6,30 L28,30 C30,32 31,38 31,46 C31,50 28,52 17,52 C6,52 3,50 3,46 Z',
              l:'M3,14 C3,10 6,8 17,8 C28,8 31,10 31,14 C31,22 30,28 28,30 L6,30 C4,28 3,22 3,14 Z' },
  premolar: { u:'M6,46 C6,38 7,33 9,30 L25,30 C27,33 28,38 28,46 C28,50 25,52 17,52 C9,52 6,50 6,46 Z',
              l:'M6,14 C6,10 9,8 17,8 C25,8 28,10 28,14 C28,22 27,27 25,30 L9,30 C7,27 6,22 6,14 Z' },
  canine:   { u:'M11,44 C11,38 12,33 14,30 Q17,27 20,30 C22,33 23,38 23,44 C23,50 21,53 17,53 C13,53 11,50 11,44 Z',
              l:'M11,16 C11,10 13,7 17,7 C21,7 23,10 23,16 C23,22 22,27 20,30 Q17,33 14,30 C12,27 11,22 11,16 Z' },
  incisor:  { u:'M8,46 C8,39 9,33 10,30 L24,30 C25,33 26,39 26,46 L26,50 C26,52 23,53 17,53 C11,53 8,52 8,50 Z',
              l:'M8,10 L8,14 C8,21 9,27 10,30 L24,30 C25,27 26,21 26,14 L26,10 C26,8 23,7 17,7 C11,7 8,8 8,10 Z' },
};

const ROOT_U = {
  single: ['M14,30 C14,22 14,12 15,7 C15,3 16,1 17,1 C18,1 19,3 19,7 C20,12 20,22 20,30 Z'],
  molar:  ['M8,30 C8,22 8,12 9,7 C9,3 11,1 12,1 C14,1 14,3 14,8 L14,30 Z',
           'M15,30 L15,8 C15,4 16,2 17,2 C18,2 19,4 19,8 L19,30 Z',
           'M20,30 L20,8 C20,3 20,1 22,1 C24,1 25,3 25,7 C26,12 26,22 26,30 Z'],
};
const ROOT_L = {
  single: ['M14,30 C14,38 14,48 15,53 C15,57 16,59 17,59 C18,59 19,57 19,53 C20,48 20,38 20,30 Z'],
  molar:  ['M8,30 L8,52 C8,57 9,59 11,59 C14,59 14,57 14,52 L14,30 Z',
           'M15,30 L15,52 C15,56 16,58 17,58 C18,58 19,56 19,52 L19,30 Z',
           'M20,30 L20,52 C20,57 21,59 23,59 C25,59 25,57 25,52 L25,30 Z'],
};

function ToothGroup({ number, isUpper, status, pos, onClick, selected }) {
  const type    = getToothType(number);
  const missing = status === 'missing';
  const color   = STATUS_COLORS[status] || STATUS_COLORS.healthy;
  const crown   = CROWN[type][isUpper ? 'u' : 'l'];
  const roots   = (isUpper ? ROOT_U : ROOT_L)[type === 'molar' ? 'molar' : 'single'];
  const gid     = `gc${number}`;
  const tr      = `scale(${S}) translate(-17,-30)`;

  return (
    <g transform={`translate(${pos.x},${pos.y}) rotate(${pos.r})`}
       onClick={onClick} style={{ cursor: 'pointer' }}>
      <defs>
        <radialGradient id={gid} cx="38%" cy="28%" r="62%" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="white" stopOpacity="0.55"/>
          <stop offset="45%"  stopColor={color} stopOpacity="0.88"/>
          <stop offset="100%" stopColor={color} stopOpacity="1"/>
        </radialGradient>
      </defs>

      {/* Shadow glow */}
      {!missing && (
        <g transform={tr}>
          <path d={crown} fill={color} opacity="0.2" transform="translate(1,1.5)" filter="url(#sblur)"/>
        </g>
      )}

      {/* Roots */}
      {!missing && (
        <g transform={tr} opacity="0.72">
          {roots.map((p, i) => (
            <path key={i} d={p} fill="#bfcede" stroke="#9bafc8" strokeWidth="0.5"/>
          ))}
        </g>
      )}

      {/* Crown */}
      <g transform={tr}>
        <path d={crown}
          fill={missing ? 'none' : `url(#${gid})`}
          stroke={missing ? '#4b6280' : 'rgba(255,255,255,0.22)'}
          strokeWidth={missing ? '1.2' : '0.7'}
          strokeDasharray={missing ? '2.5,1.5' : undefined}
        />
        {/* Shine overlay */}
        {!missing && (
          <path d={crown} fill="url(#shine)" opacity="0.22"/>
        )}
        {/* Molar grooves */}
        {!missing && type === 'molar' && (
          <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.6">
            {isUpper ? <>
              <line x1="11" y1="30" x2="11" y2="40"/>
              <line x1="17" y1="29" x2="17" y2="41"/>
              <line x1="23" y1="30" x2="23" y2="40"/>
              <line x1="4"  y1="38" x2="30" y2="38"/>
            </> : <>
              <line x1="11" y1="20" x2="11" y2="30"/>
              <line x1="17" y1="19" x2="17" y2="31"/>
              <line x1="23" y1="20" x2="23" y2="30"/>
              <line x1="4"  y1="22" x2="30" y2="22"/>
            </>}
          </g>
        )}
        {!missing && type === 'premolar' && (
          <line x1="17" y1={isUpper?'30':'20'} x2="17" y2={isUpper?'44':'30'}
            stroke="rgba(255,255,255,0.18)" strokeWidth="0.6"/>
        )}
      </g>

      {/* Selected ring */}
      {selected && (
        <g transform={tr}>
          <path d={crown} fill="none" stroke="#14b8a6" strokeWidth="2.2" opacity="0.9"/>
        </g>
      )}

      {/* Number */}
      <text y={isUpper ? -23 : 23} textAnchor="middle"
        fontSize="7.5" fill="rgba(148,163,184,0.6)" fontFamily="monospace" fontWeight="600">
        {number}
      </text>
    </g>
  );
}

export default function DentalChart({ patientId, readonly = false }) {
  const [chart, setChart]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [selectedTooth, setSelectedTooth] = useState(null);
  const [saving, setSaving]       = useState(false);
  const [toothEdit, setToothEdit] = useState({ status: 'healthy', notes: '' });

  const load = () => {
    setLoading(true);
    dentalChartService.get(patientId).then(({ data }) => setChart(data.data)).finally(() => setLoading(false));
  };
  useEffect(() => { if (patientId) load(); }, [patientId]);

  const getStatus = (n) => chart?.teeth?.find((t) => t.toothNumber === n)?.status || 'healthy';

  const handleClick = (n) => {
    if (readonly) return;
    const ex = chart?.teeth?.find((t) => t.toothNumber === n);
    setToothEdit({ status: ex?.status || 'healthy', notes: ex?.notes || '' });
    setSelectedTooth(n);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await dentalChartService.updateTooth(patientId, selectedTooth, toothEdit);
      await load();
      setSelectedTooth(null);
      toast.success(`Шүд #${selectedTooth} шинэчлэгдлээ`);
    } catch { toast.error('Хадгалах үед алдаа гарлаа'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      {/* ── Arch SVG ── */}
      <div style={{
        background: 'linear-gradient(150deg,#08121e 0%,#0c1e35 50%,#08121e 100%)',
        borderRadius: 16, border: '1px solid rgba(20,184,166,0.18)',
        padding: '10px 6px', overflowX: 'auto',
      }}>
        <svg viewBox="0 0 870 440" style={{ width: '100%', minWidth: 620, display: 'block' }}>
          <defs>
            <linearGradient id="shine" x1="0%" y1="0%" x2="65%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="1"/>
              <stop offset="100%" stopColor="white" stopOpacity="0"/>
            </linearGradient>
            <filter id="sblur"><feGaussianBlur stdDeviation="2.5"/></filter>

            {/* Upper jaw bone */}
            <linearGradient id="ujg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#0b1e32" stopOpacity="1"/>
              <stop offset="100%" stopColor="#132840" stopOpacity="0.7"/>
            </linearGradient>
            {/* Lower jaw bone */}
            <linearGradient id="ljg" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%"   stopColor="#0b1e32" stopOpacity="1"/>
              <stop offset="100%" stopColor="#132840" stopOpacity="0.7"/>
            </linearGradient>
          </defs>

          {/* Upper jaw region */}
          <path d="M 72,92 Q 435,-28 798,92 L 798,183 Q 435,210 72,183 Z" fill="url(#ujg)"/>
          {/* Upper gum tissue */}
          <path d="M 72,145 Q 435,175 798,145 Q 435,160 72,145 Z" fill="rgba(110,35,55,0.28)"/>

          {/* Lower jaw region */}
          <path d="M 72,348 Q 435,468 798,348 L 798,257 Q 435,230 72,257 Z" fill="url(#ljg)"/>
          {/* Lower gum tissue */}
          <path d="M 72,295 Q 435,265 798,295 Q 435,280 72,295 Z" fill="rgba(110,35,55,0.28)"/>

          {/* Palate (inner mouth area) */}
          <ellipse cx="435" cy="220" rx="230" ry="32" fill="rgba(10,25,45,0.5)"/>

          {/* Midline */}
          <line x1="435" y1="183" x2="435" y2="257"
            stroke="rgba(20,184,166,0.22)" strokeWidth="1" strokeDasharray="3,3"/>

          {/* Labels */}
          <text x="30"  y="18" fontSize="8" fill="rgba(94,234,212,0.45)" fontFamily="monospace" letterSpacing="1">← БАРУУН</text>
          <text x="435" y="18" fontSize="8" fill="rgba(94,234,212,0.28)" fontFamily="monospace" letterSpacing="2" textAnchor="middle">ШҮДНИЙ ЗУРАГЛАЛ</text>
          <text x="840" y="18" fontSize="8" fill="rgba(94,234,212,0.45)" fontFamily="monospace" letterSpacing="1" textAnchor="end">ЗҮҮН →</text>
          <text x="435" y="35" fontSize="7"  fill="rgba(94,234,212,0.2)"  fontFamily="monospace" textAnchor="middle" letterSpacing="3">── ДЭЭД ЭРҮҮ ──</text>
          <text x="435" y="432" fontSize="7" fill="rgba(94,234,212,0.2)"  fontFamily="monospace" textAnchor="middle" letterSpacing="3">── ДООД ЭРҮҮ ──</text>

          {/* Upper teeth */}
          {UPPER_ROW.map((n, i) => (
            <ToothGroup key={n} number={n} isUpper={true}
              status={getStatus(n)} pos={ARCH_U[i]}
              onClick={() => handleClick(n)} selected={selectedTooth === n}/>
          ))}

          {/* Lower teeth */}
          {LOWER_ROW.map((n, i) => (
            <ToothGroup key={n} number={n} isUpper={false}
              status={getStatus(n)} pos={ARCH_L[i]}
              onClick={() => handleClick(n)} selected={selectedTooth === n}/>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
        {TOOTH_STATUSES.map((s) => (
          <div key={s.value} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: s.color, boxShadow: `0 0 4px ${s.color}80` }}/>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Edit modal */}
      <AnimatePresence>
        {selectedTooth && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={() => setSelectedTooth(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"/>
            <motion.div
              initial={{ y:40, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:40, opacity:0 }}
              transition={{ type:'spring', stiffness:380, damping:30 }}
              className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10">
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
                  <X className="w-5 h-5"/>
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
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300')}>
                      <div className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: s.color, boxShadow: `0 0 6px ${s.color}90` }}/>
                      <span className="leading-tight text-center">{s.label}</span>
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Тайлбар</label>
                  <textarea value={toothEdit.notes} rows={2} placeholder="Нэмэлт тайлбар..."
                    onChange={(e) => setToothEdit((ed) => ({ ...ed, notes: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"/>
                </div>
              </div>
              <motion.button whileTap={{ scale:0.97 }} onClick={handleSave} disabled={saving}
                className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
                {saving ? <span className="flex items-center justify-center gap-2"><Spinner size="sm"/> Хадгалж байна...</span> : 'Хадгалах'}
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
