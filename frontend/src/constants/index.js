export const ROLES = { ADMIN: 'admin', DOCTOR: 'doctor', RECEPTIONIST: 'receptionist', PATIENT: 'patient' };

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'];

export const SERVICE_CATEGORIES = [
  { value: 'diagnosis',    label: 'Оношлогоо' },
  { value: 'cleaning',     label: 'Цэвэрлэгээ' },
  { value: 'whitening',    label: 'Цайруулалт' },
  { value: 'filling',      label: 'Нөхдөс' },
  { value: 'extraction',   label: 'Шүд авалт' },
  { value: 'orthodontics', label: 'Гажуудал засалт' },
  { value: 'surgery',      label: 'Мэс засал' },
  { value: 'other',        label: 'Бусад' },
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const PAYMENT_METHODS = [
  { value: 'cash',      label: 'Бэлэн мөнгө' },
  { value: 'card',      label: 'Карт' },
  { value: 'qr',        label: 'QR код' },
  { value: 'insurance', label: 'Даатгал' },
  { value: 'other',     label: 'Бусад' },
];

export const TOOTH_NUMBERS = {
  upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
  upperLeft:  [21, 22, 23, 24, 25, 26, 27, 28],
  lowerLeft:  [31, 32, 33, 34, 35, 36, 37, 38],
  lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
};

export const TOOTH_STATUSES = [
  { value: 'healthy',           label: 'Эрүүл',           color: '#22c55e' },
  { value: 'caries',            label: 'Кариес',           color: '#eab308' },
  { value: 'filling',           label: 'Пломб',            color: '#3b82f6' },
  { value: 'missing',           label: 'Алга байгаа',      color: '#94a3b8' },
  { value: 'crown',             label: 'Титэм',            color: '#a855f7' },
  { value: 'root-canal',        label: 'Суваг эмчилгээ',   color: '#f97316' },
  { value: 'implant',           label: 'Имплант',          color: '#06b6d4' },
  { value: 'bridge',            label: 'Гүүр',             color: '#ec4899' },
  { value: 'extraction-needed', label: 'Яаралтай авах',    color: '#ef4444' },
];

export const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const NAV_ITEMS = {
  admin: [
    { path: '/admin',              label: 'Хянах самбар', icon: 'LayoutGrid' },
    { path: '/admin/appointments', label: 'Цаг захиалга', icon: 'CalendarClock' },
    { path: '/admin/patients',     label: 'Өвчтөн',       icon: 'UsersRound' },
    { path: '/admin/reports',      label: 'Тайлан',        icon: 'TrendingUp' },
    { path: '/profile',            label: 'Профайл',       icon: 'CircleUser' },
  ],
  doctor: [
    { path: '/doctor',              label: 'Хянах самбар', icon: 'Activity' },
    { path: '/doctor/appointments', label: 'Хуваарь',      icon: 'CalendarCheck2' },
    { path: '/doctor/patients',     label: 'Өвчтөн',       icon: 'UsersRound' },
    { path: '/doctor/diagnosis',    label: 'Оношлогоо',    icon: 'Microscope' },
    { path: '/profile',             label: 'Профайл',      icon: 'CircleUser' },
  ],
  receptionist: [
    { path: '/reception',              label: 'Хянах самбар', icon: 'LayoutGrid' },
    { path: '/reception/appointments', label: 'Цаг захиалга', icon: 'CalendarClock' },
    { path: '/reception/patients',     label: 'Өвчтөн',       icon: 'UsersRound' },
    { path: '/reception/payments',     label: 'Төлбөр',        icon: 'Wallet' },
    { path: '/profile',                label: 'Профайл',       icon: 'CircleUser' },
  ],
  patient: [
    { path: '/patient',              label: 'Нүүр',     icon: 'HeartPulse' },
    { path: '/patient/appointments', label: 'Цаг',      icon: 'CalendarCheck2' },
    { path: '/book',                 label: 'Захиалах', icon: 'CalendarPlus', isAction: true },
    { path: '/patient/history',      label: 'Түүх',     icon: 'ScrollText' },
    { path: '/profile',              label: 'Профайл',  icon: 'CircleUser' },
  ],
};
