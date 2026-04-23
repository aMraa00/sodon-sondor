import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HeartPulse, CalendarCheck2, CalendarClock, CalendarPlus,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from '@/constants';

const ICON_MAP = {
  HeartPulse, CalendarCheck2, CalendarClock, CalendarPlus,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText,
};

function isActiveRoute(itemPath, currentPath, isAction) {
  if (isAction) return false;
  if (currentPath === itemPath) return true;
  // Only use startsWith for deep paths (e.g. /admin/appointments), not root paths (/admin)
  const isDeep = itemPath.split('/').length > 2;
  return isDeep && currentPath.startsWith(itemPath);
}

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const items = NAV_ITEMS[user?.role] || [];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/70 dark:border-slate-700/70"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-[60px] px-2">
        {items.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutGrid;
          const isActive = isActiveRoute(item.path, location.pathname, item.isAction);

          if (item.isAction) {
            return (
              <Link key={item.path} to={item.path}
                className="flex flex-col items-center justify-center flex-1 gap-0.5">
                <motion.div whileTap={{ scale: 0.88 }}
                  className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center shadow-brand -mt-6">
                  <Icon className="w-5 h-5 text-white" />
                </motion.div>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">{item.label}</span>
              </Link>
            );
          }

          return (
            <Link key={item.path} to={item.path}
              className="flex flex-col items-center justify-center flex-1 gap-1 py-1 group">
              <motion.div whileTap={{ scale: 0.85 }} className="relative">
                <div className={cn(
                  'w-10 h-7 rounded-full flex items-center justify-center transition-all duration-200',
                  isActive ? 'brand-gradient shadow-sm' : 'group-hover:bg-slate-100 dark:group-hover:bg-slate-800'
                )}>
                  <Icon className={cn(
                    'w-4.5 h-4.5 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500'
                  )} style={{ width: '1.1rem', height: '1.1rem' }} />
                </div>
              </motion.div>
              <span className={cn(
                'text-[10px] font-medium leading-none transition-colors duration-200',
                isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
