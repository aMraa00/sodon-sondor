import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { mn } from 'date-fns/locale';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDate = (date, fmt = 'yyyy-MM-dd') =>
  date ? format(typeof date === 'string' ? parseISO(date) : date, fmt, { locale: mn }) : '';

export const formatDateTime = (date) =>
  date ? format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd HH:mm', { locale: mn }) : '';

export const timeAgo = (date) =>
  date ? formatDistanceToNow(typeof date === 'string' ? parseISO(date) : date, { addSuffix: true, locale: mn }) : '';

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('mn-MN', { style: 'currency', currency: 'MNT', minimumFractionDigits: 0 }).format(amount || 0);

export const getInitials = (firstName, lastName) =>
  `${lastName?.[0] || ''}${firstName?.[0] || ''}`.toUpperCase();

export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const statusColor = (status) => {
  const map = {
    pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'no-show': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    paid:      'bg-green-100 text-green-700',
    unpaid:    'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
};

export const statusLabel = (status) => {
  const map = {
    pending:   'Хүлээгдэж буй',
    confirmed: 'Батлагдсан',
    completed: 'Дууссан',
    cancelled: 'Цуцлагдсан',
    'no-show': 'Ирээгүй',
    paid:      'Төлсөн',
    unpaid:    'Төлөөгүй',
    partial:   'Хэсэгчлэн',
  };
  return map[status] || status;
};

export const roleLabel = (role) => {
  const map = { admin: 'Админ', doctor: 'Эмч', receptionist: 'Рецепц', patient: 'Өвчтөн' };
  return map[role] || role;
};

export const TOOTH_STATUS_COLORS = {
  healthy:           '#22c55e',
  caries:            '#eab308',
  filling:           '#3b82f6',
  missing:           '#94a3b8',
  crown:             '#a855f7',
  'root-canal':      '#f97316',
  implant:           '#06b6d4',
  bridge:            '#ec4899',
  'extraction-needed': '#ef4444',
};

export const TOOTH_STATUS_LABELS = {
  healthy:           'Эрүүл',
  caries:            'Цоорол',
  filling:           'Нөхдөс',
  missing:           'Алга',
  crown:             'Бүрээс',
  'root-canal':      'Мэдрэл эмчилгээ',
  implant:           'Имплант',
  bridge:            'Гүүр',
  'extraction-needed': 'Авах шаардлагатай',
};
