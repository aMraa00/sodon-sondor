import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Lock, Eye, EyeOff } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';
import { fetchMe } from '@/store/slices/authSlice';
import { authService, uploadService } from '@/services/api';
import { toast } from 'sonner';
import UserAvatar from '@/components/common/UserAvatar';

export default function Profile() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileRef = useRef();

  const [form, setForm] = useState({ lastName: user?.lastName || '', firstName: user?.firstName || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadService.avatar(file);
      toast.success('Зураг шинэчлэгдлээ');
      dispatch(fetchMe());
    } catch { toast.error('Зураг оруулахад алдаа гарлаа'); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.lastName || !form.firstName) return toast.error('Нэр оруулна уу');
    setSaving(true);
    try {
      await authService.updateProfile(form);
      toast.success('Мэдээлэл шинэчлэгдлээ');
      dispatch(fetchMe());
    } catch (err) {
      toast.error(err.response?.data?.message || 'Алдаа гарлаа');
    } finally { setSaving(false); }
  };

  const handlePwChange = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Нууц үг таарахгүй байна');
    if (pwForm.newPassword.length < 6) return toast.error('Нууц үг хамгийн багадаа 6 тэмдэгт');
    setSavingPw(true);
    try {
      await authService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Нууц үг солигдлоо');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Нууц үг буруу байна');
    } finally { setSavingPw(false); }
  };

  return (
    <div className="page-container py-6 max-w-lg mx-auto">
      <h1 className="text-xl font-bold mb-6">Миний профайл</h1>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <UserAvatar user={user} size="xl" />
          <button onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 brand-gradient rounded-full flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
        {uploading && <p className="text-xs text-muted-foreground mt-2">Оруулж байна...</p>}
        <p className="font-semibold mt-3">{user?.lastName} {user?.firstName}</p>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      {/* Profile form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 mb-4">
        <h2 className="font-semibold mb-4">Хувийн мэдээлэл</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['lastName', 'Овог'], ['firstName', 'Нэр']].map(([key, label]) => (
              <div key={key}>
                <label className="text-xs font-medium mb-1 block">{label}</label>
                <input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={label} className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Утасны дугаар</label>
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              type="tel" placeholder="Утасны дугаар" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handleSave} disabled={saving}
          className="w-full mt-4 py-3 brand-gradient text-white font-semibold rounded-xl shadow-brand disabled:opacity-60 flex items-center justify-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Хадгалж байна...' : 'Хадгалах'}
        </motion.button>
      </div>

      {/* Password change */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h2 className="font-semibold mb-4 flex items-center gap-2"><Lock className="w-4 h-4" /> Нууц үг солих</h2>
        <div className="space-y-3">
          {[
            ['currentPassword', 'Одоогийн нууц үг', 'cur'],
            ['newPassword', 'Шинэ нууц үг', 'new'],
            ['confirmPassword', 'Шинэ нууц үг давтах', 'con'],
          ].map(([key, label, showKey]) => (
            <div key={key}>
              <label className="text-xs font-medium mb-1 block">{label}</label>
              <div className="relative">
                <input value={pwForm[key]} onChange={(e) => setPwForm((f) => ({ ...f, [key]: e.target.value }))}
                  type={showPw[showKey] ? 'text' : 'password'} placeholder={label}
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPw((s) => ({ ...s, [showKey]: !s[showKey] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPw[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={handlePwChange} disabled={savingPw}
          className="w-full mt-4 py-3 bg-slate-800 dark:bg-slate-700 text-white font-semibold rounded-xl disabled:opacity-60">
          {savingPw ? 'Солж байна...' : 'Нууц үг солих'}
        </motion.button>
      </div>
    </div>
  );
}
