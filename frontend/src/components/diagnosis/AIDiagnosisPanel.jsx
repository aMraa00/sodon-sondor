import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Brain, AlertCircle, ChevronDown, ChevronUp,
  CheckCircle2, Clock, Zap, Clipboard, RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Loader';
import { diagnosisService } from '@/services/api';

const URGENCY_CONFIG = {
  routine: { label: 'Ердийн', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30', icon: Clock },
  soon:    { label: 'Удахгүй', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', icon: Zap },
  urgent:  { label: 'Яаралтай', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30', icon: AlertCircle },
};

const SEVERITY_CONFIG = {
  mild:     { label: 'Хөнгөн', color: 'text-green-600', bar: 'bg-green-500' },
  moderate: { label: 'Дунд',   color: 'text-yellow-600', bar: 'bg-yellow-500' },
  severe:   { label: 'Хүнд',   color: 'text-red-600',   bar: 'bg-red-500' },
};

function ConfidenceBar({ value }) {
  const color = value >= 75 ? 'bg-emerald-500' : value >= 50 ? 'bg-yellow-500' : 'bg-orange-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', color)}
        />
      </div>
      <span className="text-xs font-semibold text-muted-foreground w-8 text-right">{value}%</span>
    </div>
  );
}

export default function AIDiagnosisPanel({ patientAge, patientGender, teethAffected = [], onApply, hideHeader = false }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showDifferential, setShowDifferential] = useState(false);

  const handleAnalyze = async () => {
    if (symptoms.trim().length < 5) {
      toast.error('Шинж тэмдгийг дэлгэрэнгүй бичнэ үү');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await diagnosisService.aiSuggest({ symptoms, patientAge, patientGender, teethAffected });
      setResult(data.data);
      setExpanded(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'AI оношилгоо алдаа гарлаа';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!result || !onApply) return;
    onApply({
      title: result.title,
      icdCode: result.icdCode,
      severity: result.severity,
      description: `${result.description}\n\nЗөвлөмж: ${result.recommendations?.join('; ')}`,
    });
    toast.success('AI зөвлөмж формд хуулагдлаа');
  };

  const urgency = result ? URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.routine : null;
  const severity = result ? SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.mild : null;

  return (
    <div className={cn(
      'bg-gradient-to-br from-violet-50/80 to-indigo-50/60 dark:from-violet-950/30 dark:to-indigo-950/20 overflow-hidden',
      !hideHeader && 'rounded-2xl border border-violet-200 dark:border-violet-800/50'
    )}>
      {!hideHeader && (
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">AI Оношилгооны Туслах</p>
            <p className="text-xs text-violet-500 dark:text-violet-400">Llama 3.3 · Groq</p>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-violet-600 dark:text-violet-300">Идэвхтэй</span>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-5 pt-5 pb-4">
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={3}
          rows={4}
          placeholder="Өвчтөний шинж тэмдэг, гомдол, түүхийг бичнэ үү...&#10;Жишээ: Баруун доод 6-р шүдэнд хоол идэх үед хурц өвдөлт, хүйтэн зүйлд мэдрэмтгий, 3 хоногийн өмнөөс эхэлсэн..."
          className="w-full px-3 py-2.5 rounded-xl border border-violet-200 dark:border-violet-700 bg-white/70 dark:bg-slate-900/60 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none backdrop-blur-sm"
        />
        <div className="flex gap-2 mt-2">
          {result && (
            <button
              onClick={() => { setResult(null); setSymptoms(''); setExpanded(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Дахин
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleAnalyze}
            disabled={loading || symptoms.trim().length < 5}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <><Spinner size="sm" /><span>Шинжилж байна...</span></>
            ) : (
              <><Sparkles className="w-4 h-4" /><span>AI Шинжилгээ</span></>
            )}
          </motion.button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-violet-200 dark:border-violet-800/50"
          >
            <div className="p-4 space-y-4">
              {/* Main diagnosis */}
              <div className="bg-white/80 dark:bg-slate-900/60 rounded-xl p-3.5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-sm">{result.title}</p>
                    {result.titleEn && <p className="text-xs text-muted-foreground">{result.titleEn}</p>}
                  </div>
                  {result.icdCode && (
                    <span className="shrink-0 text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono font-medium text-slate-600 dark:text-slate-300">
                      {result.icdCode}
                    </span>
                  )}
                </div>

                {/* Severity + Urgency row */}
                <div className="flex gap-2 mb-3">
                  {severity && (
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', severity.color, 'bg-slate-100 dark:bg-slate-800')}>
                      {severity.label} хүнд байдал
                    </span>
                  )}
                  {urgency && (
                    <span className={cn('flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium', urgency.color, urgency.bg)}>
                      <urgency.icon className="w-3 h-3" />
                      {urgency.label}
                    </span>
                  )}
                </div>

                {/* Confidence */}
                <div className="mb-1">
                  <p className="text-xs text-muted-foreground mb-1">Итгэлцэл</p>
                  <ConfidenceBar value={result.confidence ?? 70} />
                </div>
              </div>

              {/* Description */}
              {result.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">Тайлбар</p>
                  <p className="text-sm text-foreground leading-relaxed">{result.description}</p>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Зөвлөмж</p>
                  <ul className="space-y-1.5">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Differential diagnoses - collapsible */}
              {result.differentialDiagnoses?.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowDifferential(!showDifferential)}
                    className="flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700"
                  >
                    {showDifferential ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    Ялгах оношилгоо ({result.differentialDiagnoses.length})
                  </button>
                  <AnimatePresence>
                    {showDifferential && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 space-y-1"
                      >
                        {result.differentialDiagnoses.map((d, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-violet-400" />
                            {d}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Apply button */}
              {onApply && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleApply}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 text-sm font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-colors"
                >
                  <Clipboard className="w-4 h-4" />
                  Оношилгоо формд хэрэглэх
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse toggle when result exists */}
      {result && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 border-t border-violet-200 dark:border-violet-800/50 text-xs text-violet-500 hover:text-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 transition-colors"
        >
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Хааx</> : <><ChevronDown className="w-3.5 h-3.5" /> Үр дүн харах</>}
        </button>
      )}
    </div>
  );
}
