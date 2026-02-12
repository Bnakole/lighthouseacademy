import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { findStudentByRegNumber } from '../store';
import { GraduationCap, ArrowRight, AlertCircle, Lock } from 'lucide-react';

export function StudentLogin() {
  const [regNumber, setRegNumber] = useState('');
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
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl mb-6 text-sm scale-in">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <Lock size={14} /> Registration Number (Password)
              </label>
              <input type="text" required value={regNumber} onChange={e => setRegNumber(e.target.value)}
                placeholder="e.g. LHA-0001"
                className="input-premium text-center text-lg font-mono tracking-widest" />
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
