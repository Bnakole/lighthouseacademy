import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

type LoginType = 'admin' | 'secretary' | 'sco' | null;

export function AdminLogin() {
  const [selectedRole, setSelectedRole] = useState<LoginType>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginAdmin, setStaffOnline } = useApp();
  const navigate = useNavigate();

  // Passwords for each role
  const PASSWORDS = {
    admin: 'LHA2026',
    secretary: 'Sec-LHA-2026',
    sco: 'Sco-LHA-2026'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!selectedRole) {
      setError('Please select a role first');
      return;
    }

    if (password === PASSWORDS[selectedRole]) {
      // Store the role in localStorage
      localStorage.setItem('lha_staff_role', selectedRole);
      
      // Set staff online status
      setStaffOnline(selectedRole, true);
      
      if (selectedRole === 'admin') {
        loginAdmin(password);
        navigate('/admin-portal');
      } else if (selectedRole === 'secretary') {
        navigate('/secretary-portal');
      } else if (selectedRole === 'sco') {
        navigate('/sco-portal');
      }
    } else {
      setError('Invalid password. Access denied.');
    }
  };

  const roleCards = [
    {
      id: 'secretary' as const,
      title: 'Secretary',
      description: 'Upload certificates & verify payments',
      icon: '📋',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['Upload student certificates', 'Approve/Reject payments', 'View student list']
    },
    {
      id: 'sco' as const,
      title: 'SCO',
      subtitle: 'Student Coordinator',
      description: 'Upload materials & reply messages',
      icon: '👨‍🏫',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: ['Upload learning materials', 'Reply to student messages', 'View all students']
    },
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'Full access to all features',
      icon: '🛡️',
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      features: ['All Secretary features', 'All SCO features', 'Manage sessions', 'Site settings', 'Appoint leaders']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Staff Login Portal</h1>
          <p className="text-gray-600 mt-2">Select your role to access the management portal</p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {roleCards.map((role) => (
            <button
              key={role.id}
              onClick={() => {
                setSelectedRole(role.id);
                setError('');
                setPassword('');
              }}
              className={`bg-white rounded-2xl shadow-lg p-6 text-left transition-all hover:shadow-xl hover:-translate-y-1 border-2 ${
                selectedRole === role.id ? `${role.borderColor} ring-2 ring-offset-2 ring-${role.id === 'admin' ? 'yellow' : role.id === 'secretary' ? 'purple' : 'green'}-500` : 'border-transparent'
              }`}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center text-3xl mb-4 shadow-md`}>
                {role.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-800">{role.title}</h3>
              {role.subtitle && (
                <p className="text-sm text-gray-500">{role.subtitle}</p>
              )}
              <p className="text-gray-600 text-sm mt-2 mb-4">{role.description}</p>
              <div className={`${role.bgColor} rounded-lg p-3`}>
                <p className="text-xs font-medium text-gray-700 mb-2">Access to:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              {selectedRole === role.id && (
                <div className="mt-4 text-center">
                  <span className="inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                    Selected
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Login Form */}
        {selectedRole && (
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <span className="text-4xl">
                  {roleCards.find(r => r.id === selectedRole)?.icon}
                </span>
                <h2 className="text-xl font-bold text-gray-800 mt-2">
                  Login as {roleCards.find(r => r.id === selectedRole)?.title}
                </h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-lg tracking-wider"
                  placeholder="Enter password"
                  autoFocus
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-4 bg-gradient-to-r ${
                  roleCards.find(r => r.id === selectedRole)?.color
                } text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg`}
              >
                Access {roleCards.find(r => r.id === selectedRole)?.title} Portal
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRole(null);
                  setPassword('');
                  setError('');
                }}
                className="w-full mt-4 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Select Different Role
              </button>
            </form>
          </div>
        )}

        {/* Info Box */}
        <div className="max-w-2xl mx-auto mt-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <p className="text-yellow-800 text-sm text-center">
              <strong>⚠️ Restricted Area:</strong> This portal is for authorized staff only. 
              Unauthorized access attempts will be logged.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
