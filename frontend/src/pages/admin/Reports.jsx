import { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { reportService } from '@/services/api';
import { formatCurrency, cn } from '@/lib/utils';
import { SkeletonCard } from '@/components/common/Loader';
import { Download } from 'lucide-react';

const MONTHS = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const PIE_COLORS = ['#14b8a6','#3b82f6','#10b981','#ef4444','#94a3b8'];
const STATUS_MN = { pending: 'Хүлээгдэж буй', confirmed: 'Батлагдсан', completed: 'Дууссан', cancelled: 'Цуцлагдсан', 'no-show': 'Ирээгүй' };

export default function AdminReports() {
  const [revenue, setRevenue] = useState([]);
  const [apptStats, setApptStats] = useState([]);
  const [topDoctors, setTopDoctors] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().split('T')[0] });

  const load = () => {
    setLoading(true);
    Promise.all([
      reportService.getRevenue(dateRange),
      reportService.getAppointments(dateRange),
      reportService.getTopDoctors(),
      reportService.getTopServices(),
    ]).then(([revR, apptR, docR, svcR]) => {
      setRevenue((revR.data.data || []).map((d) => ({ month: `${d._id.month}-р сар`, орлого: d.total, тоо: d.count })));
      setApptStats((apptR.data.data || []).map((d) => ({ name: STATUS_MN[d._id] || d._id, value: d.count })));
      setTopDoctors(docR.data.data || []);
      setTopServices(svcR.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalRevenue = revenue.reduce((s, r) => s + r.орлого, 0);
  const totalAppts   = apptStats.reduce((s, r) => s + r.value, 0);

  return (
    <div className="page-container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold">Тайлан & Статистик</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <span className="text-muted-foreground text-sm hidden sm:inline">—</span>
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button onClick={load} className="px-5 py-2 brand-gradient text-white text-sm font-medium rounded-xl shadow-brand btn-spring whitespace-nowrap">
            Харах
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Нийт орлого</p>
          <p className="text-2xl font-bold text-brand-600 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <p className="text-xs text-muted-foreground">Нийт цаг захиалга</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{totalAppts}</p>
        </div>
      </div>

      {/* Revenue area chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft mb-6">
        <h2 className="font-bold mb-4">Сар бүрийн орлого</h2>
        {loading ? <div className="h-48 skeleton rounded-xl" /> : revenue.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Өгөгдөл байхгүй байна</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${(v / 1000000).toFixed(1)}М`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => [formatCurrency(v), 'Орлого']} />
              <Area type="monotone" dataKey="орлого" stroke="#14b8a6" strokeWidth={3} fill="url(#revGrad)" dot={{ fill: '#0d9488', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Appointment status pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <h2 className="font-bold mb-4">Цаг захиалгын тархалт</h2>
          {loading ? <div className="h-48 skeleton rounded-xl" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={apptStats} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value">
                  {apptStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top services bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
          <h2 className="font-bold mb-4">Хамгийн их хэрэглэгдсэн үйлчилгээ</h2>
          {loading ? <div className="h-48 skeleton rounded-xl" /> : topServices.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Өгөгдөл байхгүй</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.service?.name}</p>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(s.count / (topServices[0]?.count || 1)) * 100}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-muted-foreground flex-shrink-0">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top doctors table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-soft">
        <h2 className="font-bold mb-4">Шилдэг эмч нар</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">#</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-muted-foreground">Нэр</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-muted-foreground">Үзлэг</th>
              </tr>
            </thead>
            <tbody>
              {topDoctors.map((d, i) => (
                <tr key={d._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="py-3 px-3">
                    <div className="w-6 h-6 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
                      {i + 1}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium">{d.doctor?.lastName} {d.doctor?.firstName}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="font-bold text-brand-600">{d.count}</span>
                  </td>
                </tr>
              ))}
              {topDoctors.length === 0 && (
                <tr><td colSpan={3} className="text-center text-muted-foreground py-8">Өгөгдөл байхгүй</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
