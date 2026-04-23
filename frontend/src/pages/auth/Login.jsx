import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, CalendarCheck2, ScrollText, Pill, BarChart3 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { loginUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';

const schema = z.object({
  email: z.string().email('Зөв имэйл хаяг оруулна уу'),
  password: z.string().min(6, 'Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой'),
});

const FEATURES = [
  { Icon: CalendarCheck2, label: 'Онлайн цаг захиалга' },
  { Icon: ScrollText,     label: 'Эмнэлгийн түүх' },
  { Icon: Pill,           label: 'Эмийн жор' },
  { Icon: BarChart3,      label: 'Тайлан & Статистик' },
];

function ToothLogo({ size = 64, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className}>
      <rect width="64" height="64" rx="16" fill="url(#tg)" />
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" /><stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <path d="M32 10C25 10 20 14.5 20 20c0 3.5 1.8 6.5 4.5 8.5L23 42c-.7 4 2 6.5 5 5l4-2.5 4 2.5c3 1.5 5.7-1 5-5l-1.5-13.5C42.2 26.5 44 23.5 44 20c0-5.5-5-10-12-10z" fill="white" fillOpacity="0.95"/>
    </svg>
  );
}

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    const result = await dispatch(loginUser(data));
    setIsSubmitting(false);
    if (loginUser.fulfilled.match(result)) {
      toast.success('Тавтай морил!');
      const role = result.payload.data.role;
      const map = { admin: '/admin', doctor: '/doctor', receptionist: '/reception', patient: '/patient' };
      navigate(map[role] || '/');
    } else {
      toast.error(result.payload || 'Нэвтрэх үед алдаа гарлаа');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex w-1/2 brand-gradient items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        {/* Floating tooth shapes */}
        {[...Array(4)].map((_, i) => (
          <motion.div key={i}
            animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5 + i * 1.2, repeat: Infinity, delay: i * 0.7 }}
            className="absolute opacity-10"
            style={{ left: `${12 + i * 22}%`, top: `${18 + (i % 3) * 22}%` }}>
            <svg viewBox="0 0 40 48" width="40" height="48" fill="white">
              <path d="M20 3C14 3 9 7 9 13c0 3.5 1.5 6.5 4 8.5L11 34c-.5 3 1.5 5 4 4l5-3 5 3c2.5 1 4.5-1 4-4l-2-12.5c2.5-2 4-5 4-8.5C31 7 26 3 20 3z"/>
            </svg>
          </motion.div>
        ))}

        <div className="relative z-10 text-white text-center max-w-sm">
          <div className="flex justify-center mb-6">
            <ToothLogo size={72} />
          </div>
          <h1 className="text-4xl font-bold mb-2">Содон Сондор</h1>
          <p className="text-xl text-brand-100 mb-2">Шүдний Эмнэлгийн Удирдлагын Систем</p>
          <p className="text-brand-200 text-sm italic mb-8">"Таны инээмсэглэлд зориулсан орчин үеийн эмнэлэг"</p>
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ Icon, label }) => (
              <div key={label} className="bg-white/10 hover:bg-white/15 transition-colors rounded-xl p-3.5 flex items-center gap-2.5">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-left">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <ToothLogo size={56} />
            </div>
            <h2 className="text-2xl font-bold">Тавтай морил!</h2>
            <p className="text-muted-foreground text-sm mt-1">Бүртгэлдээ нэвтэрнэ үү</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('email')} type="email" placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input {...register('password')} type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot" className="text-xs text-brand-600 hover:underline">Нууц үгээ мартсан уу?</Link>
            </div>

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={isSubmitting}
              className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand hover:shadow-brand-lg transition-shadow disabled:opacity-60">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Нэвтэрч байна...
                </span>
              ) : 'Нэвтрэх'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Бүртгэл байхгүй юу?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">Бүртгүүлэх</Link>
          </p>

          <div className="mt-5 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800">
            <p className="text-xs font-semibold text-brand-700 dark:text-brand-300 mb-2">Demo нэвтрэх мэдээлэл:</p>
            <div className="space-y-1">
              {[['Админ', 'admin@sodon.mn', 'Admin@123'], ['Эмч', 'doctor@sodon.mn', 'Doctor@123'], ['Рецепц', 'reception@sodon.mn', 'Reception@123'], ['Өвчтөн', 'patient@sodon.mn', 'Patient@123']].map(([r, e, p]) => (
                <p key={r} className="text-xs text-muted-foreground">
                  <span className="font-semibold text-brand-600">{r}:</span> {e} / <span className="font-mono">{p}</span>
                </p>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
