import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, X, Sparkles, Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import AIDiagnosisPanel from './AIDiagnosisPanel';
import PatientSymptomChecker from './PatientSymptomChecker';

export default function AIFloatingWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user || !['doctor', 'patient'].includes(user.role)) return null;

  const isDoctor = user.role === 'doctor';
  const title = isDoctor ? 'AI Оношилгоо' : 'AI Туслах';
  const subtitle = isDoctor ? 'Оношилгооны туслах' : 'Шинж тэмдэг шалгагч';

  return (
    /* Single anchor — panel stacks above button automatically */
    <div className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-3">

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className="w-[90vw] md:w-[50vw] overflow-hidden rounded-2xl shadow-[0_8px_40px_rgba(109,40,217,0.18)] border border-violet-200/60 dark:border-violet-700/40"
            style={{ maxHeight: '65vh' }}
          >
            {/* Gradient header */}
            <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700">
              {/* Icon */}
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                  {isDoctor
                    ? <Stethoscope className="w-5 h-5 text-white" />
                    : <Brain className="w-5 h-5 text-white" />
                  }
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-violet-600" />
              </div>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-tight">{subtitle}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-violet-200 font-medium">Llama 3.3</span>
                  <span className="text-violet-400">·</span>
                  <span className="text-xs text-violet-200">Groq</span>
                  <span className="ml-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 text-[10px] text-emerald-300 font-semibold">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all hover:rotate-90 duration-200"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto bg-white dark:bg-slate-900" style={{ maxHeight: 'calc(55vh - 64px)' }}>
              {isDoctor
                ? <AIDiagnosisPanel hideHeader />
                : <PatientSymptomChecker hideHeader />
              }
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        className={cn(
          'relative flex items-center gap-2.5 pl-4 pr-5 h-13 rounded-full shadow-lg',
          'bg-gradient-to-r from-violet-600 to-indigo-600',
          'border border-white/20',
          open
            ? 'shadow-violet-500/30 shadow-lg'
            : 'shadow-violet-500/40 shadow-xl'
        )}
        style={{ height: '3.25rem' }}
      >
        {/* Icon */}
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span key="x"
                initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-4 h-4 text-white" />
              </motion.span>
            ) : (
              <motion.span key="ai"
                initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Sparkles className="w-4 h-4 text-white" />
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Label */}
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.span
              key="label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
            >
              {title}
            </motion.span>
          ) : (
            <motion.span
              key="close-label"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
            >
              Хаах
            </motion.span>
          )}
        </AnimatePresence>

        {/* Pulse ring when closed */}
        {!open && (
          <motion.span
            className="absolute inset-0 rounded-full bg-violet-500 opacity-0"
            animate={{ opacity: [0, 0.3, 0], scale: [1, 1.12, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </motion.button>
    </div>
  );
}
