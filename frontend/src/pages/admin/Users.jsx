import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, UserCheck, UserX } from 'lucide-react';
import { userService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import UserAvatar from '@/components/common/UserAvatar';
import { formatDate, roleLabel, cn } from '@/lib/utils';
import { toast } from 'sonner';

const ROLE_COLORS = { admin: 'bg-purple-100 text-purple-700', doctor: 'bg-brand-100 text-brand-700', receptionist: 'bg-blue-100 text-blue-700', patient: 'bg-green-100 text-green-700' };

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = (s = '', r = '') => {
    setLoading(true);
    const params = { limit: 30 };
    if (s) params.search = s;
    if (r) params.role = r;
    userService.getAll(params).then(({ data }) => setUsers(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search, roleFilter), 400); return () => clearTimeout(t); }, [search, roleFilter]);

  const handleToggle = async (id) => {
    try { await userService.toggleStatus(id); toast.success('Хэрэглэгчийн төлөв өөрчлөгдлөө'); load(search, roleFilter); }
    catch { toast.error('Алдаа гарлаа'); }
  };

  const ROLES = [
    { value: '', label: 'Бүгд' },
    { value: 'admin', label: 'Админ' },
    { value: 'doctor', label: 'Эмч' },
    { value: 'receptionist', label: 'Рецепц' },
    { value: 'patient', label: 'Өвчтөн' },
  ];

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Хэрэглэгчид</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Хайх..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {loading ? <SkeletonList count={6} /> : users.length === 0 ? <Empty icon="👥" title="Хэрэглэгч олдсонгүй" /> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <UserAvatar user={u} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm">{u.lastName} {u.firstName}</p>
                  <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', ROLE_COLORS[u.role] || 'bg-slate-100 text-slate-600')}>
                    {roleLabel(u.role)}
                  </span>
                  {!u.isActive && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">Идэвхгүй</span>}
                </div>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <p className="text-xs text-muted-foreground">{formatDate(u.createdAt)}-д бүртгэгдсэн</p>
              </div>
              <button onClick={() => handleToggle(u._id)}
                className={cn('p-2 rounded-xl transition-colors', u.isActive
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20')}
                title={u.isActive ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}>
                {u.isActive ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
