import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, LogOut, Settings,
  HeartPulse, CalendarCheck2, CalendarClock,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { NAV_ITEMS } from '@/constants';
import { cn, roleLabel } from '@/lib/utils';
import UserAvatar from '@/components/common/UserAvatar';

const ICON_MAP = {
  HeartPulse, CalendarCheck2, CalendarClock,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText,
};

function isActiveRoute(itemPath, currentPath) {
  if (currentPath === itemPath) return true;
  const isDeep = itemPath.split('/').length > 2;
  return isDeep && currentPath.startsWith(itemPath);
}

export default function MobileDrawer({ open, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const items = (NAV_ITEMS[user?.role] || []).filter((i) => !i.isAction);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 z-[65] w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shadow-brand flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="white">
                    <path d="M12 2C9 2 7 4 7 6c0 1.5.8 2.8 2 3.5L8 17c-.3 2 1 3 2.5 2l1.5-1 1.5 1c1.5 1 2.8 0 2.5-2l-1-7.5C16.2 8.8 17 7.5 17 6c0-2-2-4-5-4z"/>
                  </svg>
                </div>
                <div>
                  <p className="brand-gradient-text font-bold text-sm leading-tight">Содон Сондор</p>
                  <p className="text-[10px] text-muted-foreground">Шүдний эмнэлэг</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} />
                <div>
                  <p className="font-semibold text-sm">{user?.lastName} {user?.firstName}</p>
                  <p className="text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
              {items.map((item) => {
                const Icon = ICON_MAP[item.icon] || LayoutGrid;
                const isActive = isActiveRoute(item.path, location.pathname);
                return (
                  <Link key={item.path} to={item.path} onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    )}>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                      isActive ? 'brand-gradient' : 'bg-slate-100 dark:bg-slate-800'
                    )}>
                      <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-slate-500')} />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
              <Link to="/profile" onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-slate-500" />
                </div>
                <span className="text-sm font-medium">Тохиргоо</span>
              </Link>
              <button onClick={() => { logout(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="text-sm font-medium">Гарах</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
