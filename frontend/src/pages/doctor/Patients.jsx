import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { patientService } from '@/services/api';
import { SkeletonList } from '@/components/common/Loader';
import Empty from '@/components/common/Empty';
import UserAvatar from '@/components/common/UserAvatar';

export default function DoctorPatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = (s = '') => {
    setLoading(true);
    patientService.getAll({ search: s, limit: 30 }).then(({ data }) => setPatients(data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(() => load(search), 400); return () => clearTimeout(t); }, [search]);

  return (
    <div className="page-container py-6">
      <h1 className="text-xl font-bold mb-5">Өвчтөн нар</h1>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Нэр, имэйл, утасны дугаараар хайх..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>
      {loading ? <SkeletonList count={6} /> : patients.length === 0 ? (
        <Empty icon="👥" title="Өвчтөн олдсонгүй" />
      ) : (
        <div className="space-y-2">
          {patients.map((p) => (
            <Link key={p._id} to={`/doctor/patients/${p._id}`}
              className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-300 hover:shadow-soft transition-all group">
              <UserAvatar user={p} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{p.lastName} {p.firstName}</p>
                <p className="text-xs text-muted-foreground">{p.email}</p>
                {p.patientRecord?.patientCode && (
                  <span className="text-xs text-brand-600">{p.patientRecord.patientCode}</span>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-600 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
