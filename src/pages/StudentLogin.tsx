import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findStudentByRegNumber } from '../store';
import { GraduationCap, ArrowRight, AlertCircle, Lock, Clock, Eye, EyeOff } from 'lucide-react';

export function StudentLogin() {
  const [regNumber, setRegNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('lha_student_session');
    if (saved) navigate('/student-portal');
  }, [navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const student = findStudentByRegNumber(regNumber.trim().toUpperCase());
    
    if (student) {
      // Check if registration is approved
      if (!student.registrationApproved) {
        setError('Your registration is pending approval. Please wait patiently for admin verification.');
        return;
      }
      
      // Check if payment is verified for paid sessions
      if (student.paymentStatus === 'unverified') {
        setError('Your payment is being verified. Please wait patiently for approval.');
        return;
      }
      
      sessionStorage.setItem('lha_student_session', student.regNumber);
      navigate('/student-portal');
    } else {
      setError('Invalid registration number. Please check and try again.');
    }
  };

  return (
    <div className="fade-in max-w-md mx-auto mt-8">
      <div className="card-premium overflow-hidden">
        {/* Header */}
        <div className="gradient-primary p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full gradient-gold flex items-center justify-center mx-auto mb-4 shadow-2xl bounce-in">
              <GraduationCap size={36} className="text-primary-dark" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Student Portal</h1>
            <p className="text-white/40 text-sm mt-1">Enter your registration number to access your portal</p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className={`flex items-start gap-3 p-4 rounded-2xl mb-6 text-sm scale-in ${
              error.includes('pending') || error.includes('verified') 
                ? 'bg-amber-50 border border-amber-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {error.includes('pending') || error.includes('verified') ? (
                <Clock size={18} className="text-amber-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              )}
              <div className={error.includes('pending') || error.includes('verified') ? 'text-amber-700' : 'text-red-700'}>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Lock size={14} /> Registration Number (Password)
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={regNumber} 
                  onChange={e => setRegNumber(e.target.value)}
                  placeholder="e.g. LHA-0001"
                  className="input-premium text-center text-lg font-mono tracking-widest pr-12" 
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
            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-base">
              Login to Portal <ArrowRight size={18} />
            </button>
          </form>

          <div className="section-divider" />

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="#/registration" className="text-indigo-500 hover:text-indigo-700 font-semibold transition">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
