import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse, CalendarCheck2, CalendarClock,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText,
  Settings, LogOut, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsDesktop, useIsTablet } from '@/hooks/useMediaQuery';
import { NAV_ITEMS } from '@/constants';
import { cn, roleLabel } from '@/lib/utils';
import UserAvatar from '@/components/common/UserAvatar';

const ICON_MAP = {
  HeartPulse, CalendarCheck2, CalendarClock,
  UsersRound, TrendingUp, CircleUser, LayoutGrid,
  Microscope, Wallet, Activity, ScrollText,
};

// Role-based accent colors for icon containers
const ROLE_COLOR = {
  admin:        { active: 'from-violet-500 to-violet-600', dot: 'bg-violet-500' },
  doctor:       { active: 'from-brand-500 to-brand-600',  dot: 'bg-brand-500'  },
  receptionist: { active: 'from-blue-500 to-blue-600',    dot: 'bg-blue-500'   },
  patient:      { active: 'from-brand-500 to-brand-600',  dot: 'bg-brand-500'  },
};

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isDesktop = useIsDesktop();
  const isTablet = useIsTablet();
  const items = NAV_ITEMS[user?.role] || [];
  const roleColors = ROLE_COLOR[user?.role] || ROLE_COLOR.doctor;
  const isCollapsed = collapsed || isTablet;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 256 }}
      transition={{ duration: 0.22, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden"
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-slate-200 dark:border-slate-800">
        <Link to="/" className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 brand-gradient rounded-xl flex items-center justify-center shadow-brand flex-shrink-0">
            <span className="text-white text-base leading-none">🦷</span>
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <p className="brand-gradient-text font-bold text-sm whitespace-nowrap leading-tight">Содон Сондор</p>
                <p className="text-[10px] text-muted-foreground whitespace-nowrap">Шүдний эмнэлэг</p>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
        {isDesktop && (
          <button onClick={onToggle}
            className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-muted-foreground">
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* User chip */}
      <div className={cn('px-3 py-3 border-b border-slate-200 dark:border-slate-800')}>
        <div className={cn('flex items-center gap-3', isCollapsed && 'justify-center')}>
          <UserAvatar user={user} size="sm" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="min-w-0"
              >
                <p className="text-sm font-semibold truncate">{user?.lastName} {user?.firstName}</p>
                <p className="text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {items.filter((i) => !i.isAction).map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutGrid;
          const isDeep = item.path.split('/').length > 2;
          const isActive = location.pathname === item.path ||
            (isDeep && location.pathname.startsWith(item.path));

          return (
            <Link key={item.path} to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                'relative flex items-center gap-3 px-2 py-2 rounded-xl transition-all duration-150 group',
                isActive
                  ? 'bg-brand-50 dark:bg-brand-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              )}
            >
              {/* Active left bar */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-bar"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-brand-500 rounded-r-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Icon container */}
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200',
                isActive
                  ? `bg-gradient-to-br ${roleColors.active} shadow-sm`
                  : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20'
              )}>
                <Icon className={cn(
                  'w-4.5 h-4.5 transition-colors duration-200',
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-brand-500'
                )} style={{ width: '1.1rem', height: '1.1rem' }} />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className={cn(
                      'text-sm font-medium whitespace-nowrap',
                      isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
        <Link to="/profile"
          className="flex items-center gap-3 px-2 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20">
            <Settings className="w-4 h-4 group-hover:text-brand-500 transition-colors" style={{ width: '1.1rem', height: '1.1rem' }} />
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Тохиргоо</span>}
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group">
          <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
            <LogOut className="w-4 h-4" style={{ width: '1.1rem', height: '1.1rem' }} />
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Гарах</span>}
        </button>
      </div>
    </motion.aside>
  );
}
