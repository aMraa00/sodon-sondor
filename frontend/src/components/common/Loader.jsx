import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Spinner({ size = 'md', className }) {
  const s = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size];
  return (
    <div className={cn('animate-spin rounded-full border-2 border-brand-200 border-t-brand-600', s, className)} />
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.2 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-brand-lg">
          <span className="text-3xl">🦷</span>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
              className="w-2 h-2 rounded-full bg-brand-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function SkeletonCard({ lines = 3, className }) {
  return (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800', className)}>
      <div className="skeleton h-4 w-1/2 mb-4 rounded" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-3 rounded mb-2', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="skeleton w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-2.5 w-1/2 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
