import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/api';
import { toast } from 'sonner';

export default function Forgot() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
      setSent(true);
      toast.success('Нууц үг сэргээх линк илгээгдлээ');
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
          <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center shadow-brand-lg mx-auto mb-4 text-3xl">🔐</div>
          <h2 className="text-2xl font-bold">Нууц үг сэргээх</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {sent ? 'Имэйлийг шалгана уу' : 'Имэйлийгээ оруулна уу'}
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">📧</div>
            <p className="text-sm text-muted-foreground">
              <strong>{email}</strong> хаягт нууц үг сэргээх линк илгээгдлээ.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-brand-600 text-sm font-medium">
              <ArrowLeft className="w-4 h-4" /> Нэвтрэх хуудас руу буцах
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Имэйл хаяг</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="example@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} type="submit" disabled={loading}
              className="w-full py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60">
              {loading ? 'Илгээж байна...' : 'Сэргээх линк илгээх'}
            </motion.button>
            <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Буцах
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
