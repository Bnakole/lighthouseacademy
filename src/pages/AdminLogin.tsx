import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowRight, AlertCircle, Lock, Crown, ClipboardList, Target, Eye, EyeOff } from 'lucide-react';

export function AdminLogin() {
  const [role, setRole] = useState<'admin' | 'secretary' | 'sco'>('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const passwords: Record<string, string> = { admin: 'LHA2026', secretary: 'Sec-LHA-2026', sco: 'Sco-LHA-2026' };
  const routes: Record<string, string> = { admin: '/admin-portal', secretary: '/secretary-portal', sco: '/sco-portal' };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password === passwords[role]) {
      sessionStorage.setItem('lha_admin_role', role);
      navigate(routes[role]);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  const roles = [
    { key: 'admin' as const, label: 'Admin', icon: <Crown size={24} />, desc: 'Full access', gradient: 'from-amber-400 to-amber-500' },
    { key: 'secretary' as const, label: 'Secretary', icon: <ClipboardList size={24} />, desc: 'Certificates & Payments', gradient: 'from-blue-400 to-blue-500' },
    { key: 'sco' as const, label: 'SCO', icon: <Target size={24} />, desc: 'Student Coordinator', gradient: 'from-violet-400 to-violet-500' }
  ];

  return (
    <div className="fade-in max-w-md mx-auto mt-8">
      <div className="card-premium overflow-hidden">
        {/* Header */}
        <div className="gradient-gold p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-2xl bounce-in">
              <Shield size={36} className="text-amber-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-primary-dark">Admin Login</h1>
            <p className="text-primary-dark/50 text-sm mt-1">Select your role and enter password</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm scale-in">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="grid grid-cols-3 gap-3">
              {roles.map(r => (
                <button key={r.key} type="button" onClick={() => setRole(r.key)}
                  className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                    role === r.key 
                      ? `bg-gradient-to-br ${r.gradient} text-white shadow-lg scale-[1.02]` 
                      : 'bg-gray-50 text-gray-500 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                  }`}>
                  <div className="flex justify-center mb-2">{r.icon}</div>
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className={`text-[9px] mt-0.5 ${role === r.key ? 'text-white/70' : 'text-gray-400'}`}>{r.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-premium text-center pr-12" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full btn-gold py-4 flex items-center justify-center gap-2 text-base">
              Login as {role === 'sco' ? 'SCO (Student Coordinator)' : role.charAt(0).toUpperCase() + role.slice(1)}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
