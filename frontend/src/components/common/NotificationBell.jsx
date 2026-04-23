import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { markNotifRead, markAllNotifRead } from '@/store/slices/notificationSlice';
import { cn, timeAgo } from '@/lib/utils';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const { items, unreadCount } = useSelector((s) => s.notifications);

  const handleMarkRead = (id) => dispatch(markNotifRead(id));
  const handleMarkAll  = () => dispatch(markAllNotifRead());

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-soft-lg border border-slate-200 dark:border-slate-700 z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-sm">Мэдэгдэл</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAll} className="text-xs text-brand-600 hover:underline">
                    Бүгдийг уншсан
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {items.length === 0 ? (
                  <div className="py-10 text-center text-muted-foreground text-sm">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    Мэдэгдэл байхгүй байна
                  </div>
                ) : (
                  items.slice(0, 10).map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleMarkRead(n._id)}
                      className={cn(
                        'w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                        !n.isRead && 'bg-brand-50/50 dark:bg-brand-900/10'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0" />}
                        <div className={cn('flex-1', n.isRead && 'pl-4')}>
                          <p className="text-sm font-medium leading-snug">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
