import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [registrationNumber, setRegistrationNumber] = useState(searchParams.get('reg') || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const { verifyEmail, resendVerificationCode, getStudentByRegNumber } = useApp();
  const navigate = useNavigate();

  const student = registrationNumber ? getStudentByRegNumber(registrationNumber) : undefined;

  useEffect(() => {
    if (student?.emailConfirmed) {
      setSuccess(true);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResendSuccess(null);

    if (!student) {
      setError('Registration number not found. Please check and try again.');
      return;
    }

    if (student.emailConfirmed) {
      setSuccess(true);
      return;
    }

    if (verifyEmail(registrationNumber, verificationCode)) {
      setSuccess(true);
    } else {
      setError('Invalid verification code. Please check and try again.');
    }
  };

  const handleResend = () => {
    setError('');
    const newCode = resendVerificationCode(registrationNumber);
    if (newCode) {
      setResendSuccess(`New verification code: ${newCode}`);
    } else {
      setError('Could not resend code. Please check your registration number.');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Email Verified!</h1>
            <p className="text-gray-600 mb-6">
              Your email has been successfully verified. You can now login to the student portal.
            </p>
            
            {student && (
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
                <p className="text-sm opacity-80 mb-2">Your Login Credentials</p>
                <p className="text-2xl font-bold tracking-wider mb-2">{student.registrationNumber}</p>
                <p className="text-xs opacity-80">Use this as both your username and password</p>
              </div>
            )}

            <button
              onClick={() => navigate('/student-login')}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              Login to Student Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">Enter your verification code to confirm your email</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number
            </label>
            <input
              type="text"
              value={registrationNumber}
              onChange={(e) => {
                setRegistrationNumber(e.target.value);
                setError('');
                setResendSuccess(null);
              }}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-lg tracking-wider font-mono"
              placeholder="LHA-2026-XXXX"
            />
          </div>

          {student && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Student Found:</strong> {student.firstName} {student.lastName}
              </p>
              <p className="text-blue-600 text-sm">Email: {student.email}</p>
              {student.emailConfirmed && (
                <p className="text-green-600 text-sm font-medium mt-2">✓ Email already verified</p>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
            />
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <p className="font-medium">New code generated!</p>
              <p className="mt-1 font-mono text-lg">{resendSuccess}</p>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
          >
            Verify Email
          </button>

          {student && !student.emailConfirmed && (
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                className="text-purple-600 hover:text-purple-800 font-medium text-sm hover:underline"
              >
                Resend Verification Code
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            <Link to="/register" className="text-blue-600 hover:underline">
              New Registration
            </Link>
            <span className="mx-2">|</span>
            <Link to="/student-login" className="text-green-600 hover:underline">
              Student Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
