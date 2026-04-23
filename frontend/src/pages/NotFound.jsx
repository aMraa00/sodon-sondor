import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div className="text-8xl mb-4">🦷</div>
        <h1 className="text-6xl font-black brand-gradient-text mb-2">404</h1>
        <p className="text-xl font-semibold mb-2">Хуудас олдсонгүй</p>
        <p className="text-muted-foreground mb-8">Таны хайсан хуудас байхгүй байна.</p>
        <Link to="/" className="px-6 py-3 brand-gradient text-white rounded-xl font-semibold shadow-brand">
          Нүүр хуудас руу буцах
        </Link>
      </motion.div>
    </div>
  );
}
