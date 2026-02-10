import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function StudentLogin() {
  const [suffix, setSuffix] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginStudent, auth } = useApp();
  const navigate = useNavigate();
  
  const PREFIX = 'LHA-2026-';

  // Check if already logged in
  useEffect(() => {
    if (auth.isAuthenticated && auth.currentStudent) {
      navigate('/student-portal');
    }
  }, [auth, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate that suffix is 4 digits
    if (!/^\d{4}$/.test(suffix)) {
      setError('Please enter your 4-digit registration number');
      return;
    }
    
    setIsLoading(true);
    
    const fullRegistrationNumber = PREFIX + suffix;
    const result = loginStudent(fullRegistrationNumber);
    
    setTimeout(() => {
      setIsLoading(false);
      if (result.success) {
        navigate('/student-portal');
      } else {
        setError(result.message);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center py-12 px-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-2xl shadow-green-500/30 mb-6 transform hover:scale-105 transition-transform">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Student Portal</h1>
          <p className="text-blue-200">Login to access your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="mb-6">
            <label className="block text-sm font-medium text-blue-200 mb-3">
              Registration Number
            </label>
            
            {/* Input with prefix */}
            <div className="flex items-center gap-0 bg-white/10 rounded-xl overflow-hidden border-2 border-white/20 focus-within:border-green-400 transition-colors">
              {/* Fixed Prefix */}
              <div className="px-4 py-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-r border-white/20">
                <span className="text-green-400 font-mono font-bold text-lg whitespace-nowrap">
                  {PREFIX}
                </span>
              </div>
              
              {/* Editable Suffix */}
              <input
                type="text"
                value={suffix}
                onChange={(e) => {
                  // Only allow numbers and max 4 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setSuffix(value);
                }}
                required
                maxLength={4}
                className="flex-1 px-4 py-4 bg-transparent text-white text-xl font-mono font-bold tracking-widest focus:outline-none placeholder-white/40 text-center"
                placeholder="1234"
                autoFocus
              />
            </div>
            
            {/* Helper text */}
            <p className="mt-2 text-xs text-blue-300 text-center">
              Enter the 4 digits after LHA-2026-
            </p>
          </div>

          {/* Example */}
          <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-400/20">
            <p className="text-blue-200 text-sm text-center">
              <span className="text-blue-400 font-semibold">Example:</span> If your registration number is <span className="font-mono font-bold text-green-400">LHA-2026-5678</span>, enter <span className="font-mono font-bold text-white bg-white/20 px-2 py-1 rounded">5678</span>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-300 text-sm">{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || suffix.length !== 4}
            className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login to Portal</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-blue-300">Don't have an account?</span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            to="/register"
            className="block w-full py-3 text-center bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-all border border-white/20"
          >
            Register for Training
          </Link>
        </form>

        {/* Footer */}
        <p className="text-center text-blue-300/60 text-sm mt-8">
          © 2026 Light House Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}
