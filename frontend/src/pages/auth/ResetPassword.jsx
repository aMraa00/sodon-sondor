import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.resetPassword(token, { password });
      toast.success('Нууц үг амжилттай солигдлоо');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-brand-lg mx-auto mb-4 text-3xl">🔑</div>
          <h2 className="text-2xl font-bold">Шинэ нууц үг</h2>
          <p className="text-muted-foreground text-sm mt-1">Шинэ нууц үгээ оруулна уу</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Шинэ нууц үг</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                placeholder="••••••••" className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
            className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
            {loading ? 'Хадгалж байна...' : 'Нууц үг солих'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
