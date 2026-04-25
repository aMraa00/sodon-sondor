import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, AlertTriangle, Clock, CalendarPlus, Home, ShieldAlert, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/common/Loader';
import { diagnosisService } from '@/services/api';

const URGENCY = {
  urgent:  { label: 'Яаралтай очих хэрэгтэй', color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-950/30',       border: 'border-red-200 dark:border-red-800',       icon: AlertTriangle },
  soon:    { label: 'Удахгүй очих хэрэгтэй',  color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800', icon: Clock },
  routine: { label: 'Цаг захиалаарай',         color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/30',  border: 'border-green-200 dark:border-green-800',  icon: CalendarPlus },
};

export default function PatientSymptomChecker({ hideHeader = false }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [showMore, setShowMore] = useState(false);

  const handleCheck = async () => {
    if (symptoms.trim().length < 5) {
      toast.error('Шинж тэмдгээ дэлгэрэнгүй бичнэ үү');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await diagnosisService.symptomCheck({ symptoms });
      setResult(data.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Алдаа гарлаа, дахин оролдоно уу');
    } finally {
      setLoading(false);
    }
  };

  const urgencyConfig = result ? URGENCY[result.urgency] || URGENCY.routine : null;

  return (
    <div className={cn(
      'bg-gradient-to-br from-violet-50/80 to-indigo-50/60 dark:from-violet-950/30 dark:to-indigo-950/20 overflow-hidden',
      !hideHeader && 'rounded-2xl border border-violet-200 dark:border-violet-800/50'
    )}>
      {/* Header — hidden when inside floating widget (widget has its own header) */}
      {!hideHeader && (
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-100">AI Шинж тэмдэг шалгагч</p>
            <p className="text-xs text-violet-500 dark:text-violet-400">Эмчид очих хэрэгтэй эсэхийг мэдэх</p>
          </div>
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-xs text-violet-600 dark:text-violet-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Үнэгүй
          </span>
        </div>
      )}

      {/* Input */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-sm font-medium text-violet-800 dark:text-violet-200 mb-2">
          Яг одоо ямар зовиур байна вэ?
        </p>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={4}
          placeholder="Жишээ: Зүүн доод шүдэнд 2 өдрийн өмнөөс хурц өвдөлт, хоол идэхэд хүчтэй өвдөж байна, шөнө унтаж чадахгүй байна..."
          className="w-full px-4 py-3 rounded-xl border border-violet-200 dark:border-violet-700 bg-white/70 dark:bg-slate-900/60 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none leading-relaxed"
        />
        <div className="flex gap-2 mt-3">
          {result && (
            <button
              onClick={() => { setResult(null); setSymptoms(''); setShowMore(false); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <RotateCcw className="w-4 h-4" /> Дахин
            </button>
          )}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCheck}
            disabled={loading || symptoms.trim().length < 5}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <><Spinner size="sm" /><span>Шинжилж байна...</span></>
              : <><Sparkles className="w-4 h-4" /><span>Шинжлэх</span></>}
          </motion.button>
        </div>
      </div>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-violet-200 dark:border-violet-800/50"
          >
            <div className="p-5 space-y-4">
              {/* Urgency banner */}
              {urgencyConfig && (
                <div className={cn('flex items-start gap-3 p-4 rounded-xl border', urgencyConfig.bg, urgencyConfig.border)}>
                  <urgencyConfig.icon className={cn('w-5 h-5 mt-0.5 shrink-0', urgencyConfig.color)} />
                  <div>
                    <p className={cn('font-semibold text-sm', urgencyConfig.color)}>{urgencyConfig.label}</p>
                    {result.urgencyReason && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{result.urgencyReason}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary */}
              {result.summary && (
                <p className="text-sm text-foreground leading-relaxed">{result.summary}</p>
              )}

              {/* Possible causes */}
              {result.possibleCauses?.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Боломжит шалтгаан</p>
                  <div className="flex flex-wrap gap-2">
                    {result.possibleCauses.map((c, i) => (
                      <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* More details toggle */}
              {(result.homeCare?.length > 0 || result.warningSigns?.length > 0) && (
                <>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-1.5 text-sm font-medium text-violet-600 dark:text-violet-400"
                  >
                    {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {showMore ? 'Хураах' : 'Дэлгэрэнгүй харах'}
                  </button>

                  <AnimatePresence>
                    {showMore && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                      >
                        {result.homeCare?.length > 0 && (
                          <div>
                            <div className="flex items-center gap-1.5 mb-2">
                              <Home className="w-4 h-4 text-muted-foreground" />
                              <p className="text-sm font-medium text-muted-foreground">Гэрийн арчилгаа</p>
                            </div>
                            <ul className="space-y-1.5">
                              {result.homeCare.map((tip, i) => (
                                <li key={i} className="text-sm text-foreground flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {result.warningSigns?.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900 rounded-xl p-4">
                            <div className="flex items-center gap-1.5 mb-2">
                              <ShieldAlert className="w-4 h-4 text-red-500" />
                              <p className="text-sm font-medium text-red-600">Анхааруулга</p>
                            </div>
                            <ul className="space-y-1.5">
                              {result.warningSigns.map((w, i) => (
                                <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                                  {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              {/* Book appointment CTA */}
              <Link
                to="/book"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl brand-gradient text-white text-sm font-semibold shadow-brand btn-spring"
              >
                <CalendarPlus className="w-4 h-4" />
                Цаг захиалах
              </Link>

              <p className="text-center text-xs text-muted-foreground leading-relaxed">
                Энэ нь зөвхөн лавлагааны зорилгоор бөгөөд эмчийн оношилгоог орлохгүй
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
