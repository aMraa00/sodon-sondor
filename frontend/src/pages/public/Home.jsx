import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Phone, MapPin, Clock, Star, ChevronRight,
  Shield, Award, Users, Microscope, Sparkles, Sun,
  Wrench, Scissors, Smile, Stethoscope, CircleDot,
  CalendarPlus, Monitor,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { doctorService, serviceService } from '@/services/api';
import { formatCurrency } from '@/lib/utils';

const SERVICE_ICONS = {
  diagnosis:    Microscope,
  cleaning:     Sparkles,
  whitening:    Sun,
  filling:      Wrench,
  extraction:   Scissors,
  orthodontics: Smile,
  surgery:      Stethoscope,
  other:        CircleDot,
};

const FEATURES = [
  { Icon: Monitor, title: 'Орчин үеийн тоног төхөөрөмж', desc: 'Дэлхийн жишигт нийцсэн технологи ашиглан эмчилгээ хийдэг' },
  { Icon: Users,   title: 'Мэргэшсэн эмч нар',           desc: '10+ жилийн туршлагатай шүдний эмч нар' },
  { Icon: Award,   title: '99% Хүлэмж хандлага',          desc: 'Өвчтөний сэтгэл ханамж бидний гол зорилго' },
];

const TESTIMONIALS = [
  { name: 'Батболд Г.',      text: 'Маш сайн үйлчилгээ! Эмч нар маш тааламжтай, үр дүн гайхалтай байсан.', rating: 5 },
  { name: 'Оюунцэцэг Б.',   text: 'Онлайн цаг захиалга маш хялбар, орчин үеийн тоног төхөөрөмж хэрэглэдэг.', rating: 5 },
  { name: 'Мөнхбат Д.',     text: 'Эмч Энхтуяа маш мэргэшсэн, миний хүүхдийн шүдийг маш сайн эмчилсэн.', rating: 5 },
];

function ToothFloating({ size = 36 }) {
  return (
    <svg viewBox="0 0 40 48" width={size} height={size} fill="white">
      <path d="M20 3C14 3 9 7 9 13c0 3.5 1.5 6.5 4 8.5L11 34c-.5 3 1.5 5 4 4l5-3 5 3c2.5 1 4.5-1 4-4l-2-12.5c2.5-2 4-5 4-8.5C31 7 26 3 20 3z"/>
    </svg>
  );
}

function ToothLogoSm() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
      <path d="M12 2C9 2 7 4 7 6c0 1.5.8 2.8 2 3.5L8 17c-.3 2 1 3 2.5 2l1.5-1 1.5 1c1.5 1 2.8 0 2.5-2l-1-7.5C16.2 8.8 17 7.5 17 6c0-2-2-4-5-4z"/>
    </svg>
  );
}

export default function Home() {
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    serviceService.getAll().then(({ data }) => setServices(data.data?.slice(0, 6) || [])).catch(() => {});
    doctorService.getAll().then(({ data }) => setDoctors(data.data?.slice(0, 3) || [])).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-brand-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, 0], x: [0, 10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6 + i * 1.5, repeat: Infinity, delay: i * 0.8 }}
              className="absolute opacity-10"
              style={{ left: `${10 + i * 20}%`, top: `${15 + (i % 3) * 25}%` }}
            >
              <ToothFloating size={40 + i * 6} />
            </motion.div>
          ))}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-brand-200/30 dark:bg-brand-800/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-brand-300/20 dark:bg-brand-700/20 rounded-full blur-3xl" />
        </div>

        <div className="page-container relative z-10 py-20">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-full text-sm font-medium mb-6">
                <div className="w-5 h-5 brand-gradient rounded-md flex items-center justify-center">
                  <ToothLogoSm />
                </div>
                Шүдний Эмнэлэг
              </span>
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Таны{' '}
                <span className="brand-gradient-text">инээмсэглэлд</span>
                {' '}зориулсан орчин үеийн эмнэлэг
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Мэргэшсэн эмч нар, орчин үеийн тоног төхөөрөмж, тааламжтай орчин — таны шүдний эрүүл мэндийг бид хариуцна.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/book" className="inline-flex items-center gap-2 px-6 py-3.5 brand-gradient text-white font-semibold rounded-2xl shadow-brand-lg hover:shadow-brand btn-spring">
                  <CalendarPlus className="w-5 h-5" /> Цаг захиалах <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 border-2 border-brand-300 text-brand-700 dark:text-brand-300 font-semibold rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors btn-spring">
                  Бүртгүүлэх
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap gap-6 mt-10">
              {[['500+', 'Сэтгэл ханасан өвчтөн'], ['10+', 'Жилийн туршлага'], ['3', 'Мэргэшсэн эмч']].map(([num, label]) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold brand-gradient-text">{num}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-background">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Манай үйлчилгээнүүд</h2>
            <p className="text-muted-foreground">Шүдний бүх хэрэгцээнд нэг дор үйлчлэх</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {(services.length ? services : [
              { _id:'1', name:'Оношлогоо',  category:'diagnosis',    price:30000,   description:'Иж бүрэн оношлогоо' },
              { _id:'2', name:'Цэвэрлэгээ', category:'cleaning',     price:50000,   description:'Мэргэжлийн цэвэрлэгээ' },
              { _id:'3', name:'Цайруулалт', category:'whitening',    price:150000,  description:'Гэрэлтэй цайлган инээмсэглэл' },
              { _id:'4', name:'Нөхдөс',     category:'filling',      price:80000,   description:'Дур булаам нөхдөс' },
              { _id:'5', name:'Шүд авалт',  category:'extraction',   price:60000,   description:'Аюулгүй, өвдолтгүй' },
              { _id:'6', name:'Имплант',    category:'surgery',      price:1200000, description:'Байнгын шийдэл' },
            ]).map((svc, i) => {
              const SvcIcon = SERVICE_ICONS[svc.category] || CircleDot;
              return (
                <motion.div
                  key={svc._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-brand transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 brand-gradient rounded-xl flex items-center justify-center mb-3 shadow-brand group-hover:scale-105 transition-transform">
                    <SvcIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-brand-600 transition-colors">{svc.name}</h3>
                  {svc.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{svc.description}</p>}
                  <p className="text-sm font-bold text-brand-600">{formatCurrency(svc.price)}-аас эхлэн</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 bg-brand-50 dark:bg-brand-950/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Яагаад бидийг сонгох вэ?</h2>
            <p className="text-muted-foreground">Таны итгэлийг бид нандин авч явна</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center shadow-soft">
                <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-brand">
                  <f.Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="py-20 bg-background">
          <div className="page-container">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Манай эмч нар</h2>
              <p className="text-muted-foreground">Мэргэшсэн, туршлагатай баг</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {doctors.map((doc, i) => (
                <motion.div key={doc._id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 text-center shadow-soft hover:shadow-brand transition-all">
                  <div className="w-20 h-20 brand-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-3xl text-white font-bold">
                    {doc.user?.firstName?.[0]}{doc.user?.lastName?.[0]}
                  </div>
                  <h3 className="font-bold">{doc.user?.lastName} {doc.user?.firstName}</h3>
                  <p className="text-sm text-brand-600 mb-1">{doc.specialization}</p>
                  <p className="text-xs text-muted-foreground">{doc.experience} жилийн туршлага</p>
                  <div className="flex justify-center gap-0.5 mt-2">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-3 h-3 ${j < Math.round(doc.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />)}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      <section className="py-20 bg-brand-50 dark:bg-brand-950/30">
        <div className="page-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Өвчтөнүүдийн сэтгэгдэл</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-soft">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                <p className="text-sm font-semibold">{t.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="page-container">
          <motion.div whileInView={{ opacity: 1, scale: 1 }} initial={{ opacity: 0, scale: 0.97 }} viewport={{ once: true }}
            className="brand-gradient rounded-3xl p-10 text-center text-white shadow-brand-lg">
            <h2 className="text-3xl font-bold mb-4">Өнөөдөр л цаг захиална уу!</h2>
            <p className="text-brand-100 mb-8 max-w-md mx-auto">Онлайн цаг захиалга 24/7 боломжтой. Зүгээр л бүртгүүлэн захиала.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/book" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-brand-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-shadow btn-spring">
                <CalendarPlus className="w-5 h-5" /> Цаг захиалах
              </Link>
              <a href="tel:+97670000001" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-white/50 text-white font-semibold rounded-2xl hover:bg-white/10 transition-colors btn-spring">
                <Phone className="w-5 h-5" /> Залгах
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="page-container">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 brand-gradient rounded-lg flex items-center justify-center">
                  <ToothLogoSm />
                </div>
                <span className="font-bold text-white">Содон Сондор</span>
              </div>
              <p className="text-sm text-slate-400">Таны инээмсэглэлд зориулсан шүдний эмнэлэг</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Холбоо барих</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> +976 7000-0001</div>
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> УБ хот, Чингэлтэй дүүрэг</div>
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Мягмар–Бямба: 09:00–18:00</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-3">Холбоосууд</h4>
              <div className="space-y-2 text-sm">
                {['/login', '/register', '/book'].map((href, i) => (
                  <div key={i}><Link to={href} className="hover:text-brand-400 transition-colors">{['Нэвтрэх', 'Бүртгүүлэх', 'Цаг захиалах'][i]}</Link></div>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
            © 2026 Содон Сондор Шүдний Эмнэлэг. Бүх эрх хуулиар хамгаалагдсан.
          </div>
        </div>
      </footer>
    </div>
  );
}
