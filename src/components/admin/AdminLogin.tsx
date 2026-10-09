import React, { useState } from 'react';
import { Shield, Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, UserCheck } from 'lucide-react';
import { StoreSettings, AdminUserItem } from '../../types/admin';
import { ColorTheme } from '../../types/website';

interface AdminLoginProps {
  onLoginSuccess: (user?: AdminUserItem) => void;
  onBackToStore: () => void;
  storeName: string;
  settings?: StoreSettings;
  theme?: ColorTheme;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
  storeName,
  settings,
  theme,
}) => {
  const [email, setEmail] = useState('admin@halalbazarbd.com');
  const [password, setPassword] = useState('tanvir88');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // List of configured admin users
  const configuredUsers: AdminUserItem[] = React.useMemo(() => {
    const list: AdminUserItem[] = settings?.adminUsers || [];
    // Ensure default master admin exists
    const masterEmail = settings?.adminEmail || 'admin@halalbazarbd.com';
    const masterPass = settings?.adminPassword || 'tanvir88';
    const masterName = settings?.adminName || 'সুপার এডমিন';

    const hasMaster = list.some((u) => u.email.toLowerCase() === masterEmail.toLowerCase());
    if (!hasMaster) {
      return [
        {
          id: 'master-admin',
          name: masterName,
          email: masterEmail,
          password: masterPass,
          role: 'admin',
        },
        ...list,
      ];
    }
    return list;
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    setTimeout(() => {
      // Strictly enforce that the admin password is ONLY 'tanvir88'
      if (inputPass !== 'tanvir88') {
        setError('ভুল পাসওয়ার্ড! এডমিন প্যানেলে প্রবেশের পাসওয়ার্ড শুধুমাত্র tanvir88');
        setLoading(false);
        return;
      }

      const activeUser: AdminUserItem = {
        id: 'master-admin',
        name: settings?.adminName || 'সুপার এডমিন',
        email: inputEmail || 'admin@halalbazarbd.com',
        password: 'tanvir88',
        role: 'admin',
      };

      localStorage.setItem('hb_admin_auth', 'true');
      localStorage.setItem('hb_admin_current_user', JSON.stringify(activeUser));
      onLoginSuccess(activeUser);
      setLoading(false);
    }, 300);
  };

  const handleDemoLogin = () => {
    setEmail('admin@halalbazarbd.com');
    setPassword('tanvir88');
    const demoUser: AdminUserItem = {
      id: 'master-admin',
      name: settings?.adminName || 'সুপার এডমিন',
      email: 'admin@halalbazarbd.com',
      password: 'tanvir88',
      role: 'admin',
    };
    localStorage.setItem('hb_admin_auth', 'true');
    localStorage.setItem('hb_admin_current_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-neutral-950">
      {/* Back to Store Button */}
      <div className="absolute top-6 left-6">
        <button
          onClick={onBackToStore}
          className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors bg-neutral-900 border border-neutral-800 px-3.5 py-2 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ওয়েবসাইটে ফিরে যান</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Subtle Decorative Aura */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Seal */}
        <div className="text-center space-y-2">
          <div 
            className="w-14 h-14 rounded-2xl border text-amber-400 mx-auto flex items-center justify-center shadow-lg transition-colors"
            style={{
              background: theme ? `linear-gradient(135deg, ${theme.primary}, #0f172a)` : 'linear-gradient(to top right, #064e3b, #171717)',
              borderColor: theme?.borderLight || 'rgba(16, 185, 129, 0.3)',
            }}
          >
            <Shield className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            {storeName} এডমিন পোর্টাল
          </h1>
          <p className="text-xs text-neutral-400">
            স্টোর পরিচালনা ও অর্ডার নিয়ন্ত্রণের জন্য লগইন করুন
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-300 text-center font-medium">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              এডমিন ইমেইল (Admin Email)
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@halalbazarbd.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-300 font-medium mb-1.5">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]"
            >
              <span>{loading ? 'যাচাই করা হচ্ছে...' : 'এডমিন প্যানেলে প্রবেশ করুন'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Demo Fast Login Box */}
        <div className="pt-4 border-t border-neutral-800 text-center space-y-3">
          <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ডেমো ক্রেডেনশিয়াল: <b>admin@halalbazarbd.com</b> / <b>tanvir88</b></span>
          </div>

          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700/60 font-semibold text-xs transition-colors"
          >
            ⚡ এক ক্লিকে ডেমো লগইন
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} {storeName} • সিকিউর ব্যাকঅফিস এডমিন সিস্টেম
      </div>
    </div>
  );
};
