import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile, useIsDesktop } from '@/hooks/useMediaQuery';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';
import { cn } from '@/lib/utils';

// Auth pages render standalone — no shell chrome needed
const AUTH_PATHS = ['/login', '/register', '/forgot', '/reset-password'];

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.18 } },
  exit:    { opacity: 0,  transition: { duration: 0 } },   // instant exit — no dark gap
};

export default function AppShell({ children }) {
  const { user } = useAuth();
  const initialized = useSelector((s) => s.auth.initialized);
  const token = useSelector((s) => s.auth.token);
  const location = useLocation();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthPage = AUTH_PATHS.some((p) => location.pathname.startsWith(p));

  // Block render until fetchMe resolves — prevents flash between public/auth layouts
  if (token && !initialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 brand-gradient rounded-2xl flex items-center justify-center text-2xl shadow-brand animate-pulse">
            🦷
          </div>
          <p className="text-sm text-muted-foreground">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  // Auth pages: clean full-screen layout, no chrome
  if (isAuthPage) {
    return (
      <AnimatePresence mode="sync">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, transition: { duration: 0 } }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  const isPublic = !user;
  const sidebarWidth = isDesktop ? (sidebarCollapsed ? 72 : 256) : 0;

  return (
    <div className="min-h-screen bg-background">
      {!isPublic && !isMobile && (
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c) => !c)} />
      )}

      {!isPublic && isMobile && (
        <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      )}

      <TopBar onMenuClick={() => setDrawerOpen(true)} />

      <main
        className={cn('transition-all duration-200 pt-14', !isPublic && isMobile && 'pb-nav')}
        style={!isPublic && !isMobile ? { marginLeft: sidebarWidth } : undefined}
      >
        <AnimatePresence mode="sync">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-[calc(100vh-3.5rem)]"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!isPublic && isMobile && <BottomNav />}
    </div>
  );
}
