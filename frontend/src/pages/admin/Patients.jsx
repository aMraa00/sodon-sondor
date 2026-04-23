import { useState, useEffect } from 'react';
import { Search, Phone, Mail } from 'lucide-react';
import { patientService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import UserAvatar from '@/components/common/UserAvatar';
import { formatDate } from '@/lib/utils';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (s = '') => {
    setLoading(true);
    patientService.getAll({ search: s, limit: 50 }).then(({ data }) => setPatients(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t); }, [search]);

  return (
    <div className="page-container py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">Өвчтөн нар</h1>
        <span className="text-sm text-muted-foreground">{patients.length} өвчтөн</span>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэр, имэйл, утасны дугаараар хайх..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {loading ? <SkeletonList count={8} /> : patients.length === 0 ? <Empty icon="👥" title="Өвчтөн олдсонгүй" /> : (
        <div className="space-y-2">
          {patients.map((p) => (
            <div key={p._id} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <UserAvatar user={p} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{p.lastName} {p.firstName}</p>
                  {p.patientRecord?.patientCode && (
                    <span className="text-xs px-2 py-0.5 bg-brand-100 dark:bg-brand-900/30 text-brand-700 rounded-full">
                      {p.patientRecord.patientCode}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                  {p.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{p.phone}</span>}
                  {p.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{p.email}</span>}
                </div>
                {p.createdAt && <p className="text-xs text-muted-foreground mt-0.5">{formatDate(p.createdAt)}-д бүртгэгдсэн</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
