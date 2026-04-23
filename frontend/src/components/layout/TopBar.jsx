import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Menu, Moon, Sun, Monitor } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/useMediaQuery';
import NotificationBell from '@/components/common/NotificationBell';
import UserAvatar from '@/components/common/UserAvatar';
import { cn } from '@/lib/utils';

export default function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 h-14 flex items-center px-4 transition-all duration-300',
        scrolled
          ? 'glass border-b border-slate-200/60 dark:border-slate-700/60 shadow-soft'
          : 'bg-transparent'
      )}
    >
      {/* Menu button (mobile only) */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors mr-2"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
      )}

      {/* Logo — hide brand text on desktop when sidebar is visible (sidebar shows it) */}
      <Link to="/" className="flex items-center gap-2 font-bold">
        <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center shadow-brand flex-shrink-0">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
            <path d="M12 2C9 2 7 4 7 6c0 1.5.8 2.8 2 3.5L8 17c-.3 2 1 3 2.5 2l1.5-1 1.5 1c1.5 1 2.8 0 2.5-2l-1-7.5C16.2 8.8 17 7.5 17 6c0-2-2-4-5-4z"/>
          </svg>
        </div>
        {(!user || isMobile) && (
          <span className="brand-gradient-text text-base font-bold">Содон Сондор</span>
        )}
      </Link>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          title="Гадаад төрх солих"
        >
          <ThemeIcon className="w-4 h-4 text-muted-foreground" />
        </motion.button>

        {user && <NotificationBell />}

        {user && (
          <Link to="/profile" className="ml-1">
            <UserAvatar user={user} size="sm" />
          </Link>
        )}

        {!user && (
          <Link
            to="/login"
            className="px-4 py-1.5 text-sm font-medium brand-gradient text-white rounded-lg shadow-brand btn-spring"
          >
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  );
}
