import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/store/slices/authSlice';
import { authService } from '@/services/api';
import { toast } from 'sonner';

const schema = z.object({
  lastName:        z.string().min(2, 'Овог хамгийн багадаа 2 тэмдэгт'),
  firstName:       z.string().min(2, 'Нэр хамгийн багадаа 2 тэмдэгт'),
  email:           z.string().email('Зөв имэйл оруулна уу'),
  phone:           z.string().min(8, 'Зөв утасны дугаар оруулна уу'),
  password:        z.string().min(6, 'Нууц үг хамгийн багадаа 6 тэмдэгт'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: 'Нууц үг тохирохгүй байна', path: ['confirmPassword'] });

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register({ ...data, role: 'patient' });
      const result = await dispatch(loginUser({ email: data.email, password: data.password }));
      toast.success('Бүртгэл амжилттай үүслээ! 🦷');
      navigate('/patient');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Бүртгүүлэх үед алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 brand-gradient items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-white text-center max-w-sm">
          <div className="text-8xl mb-6">🦷</div>
          <h1 className="text-3xl font-bold mb-4">Бүртгүүлэх</h1>
          <p className="text-brand-100">Онлайн цаг захиалах, эмнэлгийн түүхээ харах боломжтой болно.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm py-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 brand-gradient rounded-xl flex items-center justify-center shadow-brand mx-auto mb-3 text-2xl">🦷</div>
            <h2 className="text-2xl font-bold">Бүртгүүлэх</h2>
            <p className="text-muted-foreground text-sm mt-1">Шинэ бүртгэл үүсгэнэ үү</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Овог</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register('lastName')} placeholder="Овог" className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Нэр</label>
                <input {...register('firstName')} placeholder="Нэр" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
              </div>
            </div>

            {[
              { key: 'email', label: 'Имэйл', type: 'email', icon: Mail, placeholder: 'example@email.com' },
              { key: 'phone', label: 'Утасны дугаар', type: 'tel', icon: Phone, placeholder: '99001122' },
            ].map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium mb-1 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register(key)} type={type} placeholder={placeholder} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key].message}</p>}
              </div>
            ))}

            {[
              { key: 'password', label: 'Нууц үг' },
              { key: 'confirmPassword', label: 'Нууц үг давтах' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-xs font-medium mb-1 block">{label}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input {...register(key)} type={showPw ? 'text' : 'password'} placeholder="••••••••" className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key].message}</p>}
              </div>
            ))}

            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading} className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
              {loading ? <span className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Бүртгэж байна...</span> : 'Бүртгүүлэх'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Бүртгэл байна уу?{' '}<Link to="/login" className="text-brand-600 font-medium hover:underline">Нэвтрэх</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
