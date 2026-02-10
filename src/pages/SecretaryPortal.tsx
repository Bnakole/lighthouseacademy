import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GroupChat } from '../components/GroupChat';

const SecretaryPortal: React.FC = () => {
  const navigate = useNavigate();
  const {
    students,
    sessions,
    uploadCertificate,
    approvePayment,
    rejectPayment,
    isOnline,
    isSyncing,
    siteSettings,
    updateSiteSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'certificates' | 'payments' | 'profile'>('certificates');
  const [searchTerm, setSearchTerm] = useState('');
  const [certificateFile, setCertificateFile] = useState<string>('');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<string>('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    school: ''
  });
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has access
  useEffect(() => {
    const role = localStorage.getItem('lha_staff_role');
    if (role !== 'secretary' && role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Load profile from siteSettings
  useEffect(() => {
    if (siteSettings?.staffContacts?.secretary) {
      const secretary = siteSettings.staffContacts.secretary;
      setProfileForm({
        name: secretary.name || '',
        email: secretary.email || '',
        phone: secretary.phone || '',
        occupation: (secretary as any).occupation || 'Secretary',
        school: (secretary as any).school || ''
      });
      setProfilePicture((secretary as any).profilePicture || '');
    }
  }, [siteSettings]);

  const handleLogout = () => {
    localStorage.removeItem('lha_staff_role');
    navigate('/admin-login');
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedSettings = {
        ...siteSettings,
        staffContacts: {
          ...siteSettings?.staffContacts,
          secretary: {
            name: profileForm.name,
            email: profileForm.email,
            phone: profileForm.phone,
            occupation: profileForm.occupation,
            school: profileForm.school,
            profilePicture: profilePicture
          }
        }
      };
      updateSiteSettings(updatedSettings);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to save profile');
    }
    setIsSaving(false);
  };

  // Get unique sessions that have students
  const sessionsWithStudents = sessions.filter(session => 
    students.some(student => student.session === session.name)
  );

  // Get students by session
  const getStudentsBySession = (sessionName: string) => {
    return students.filter(student => 
      student.session === sessionName &&
      (searchTerm === '' || 
       student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // Toggle session expansion
  const toggleSession = (sessionId: string) => {
    setExpandedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Handle certificate upload
  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertificateFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadCertificate = (studentId: string) => {
    if (!certificateFile) {
      alert('Please select a certificate file');
      return;
    }
    uploadCertificate(studentId, certificateFile);
    setCertificateFile('');
    setSelectedStudentForCert('');
    alert('Certificate uploaded successfully!');
  };

  const pendingPaymentsCount = students.filter(s => s.paymentStatus === 'pending').length;
  const totalStudents = students.length;
  const certificatesIssued = students.filter(s => s.certificate).length;
  const verifiedPayments = students.filter(s => s.paymentStatus === 'approved').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Secretary Portal</h1>
              <p className="text-sm text-purple-200">Certificates & Payments Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-white/70">
              {isSyncing && <span className="animate-pulse">🔄</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button onClick={handleLogout} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-blue-400">{totalStudents}</div>
            <div className="text-white/70">Total Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-green-400">{certificatesIssued}</div>
            <div className="text-white/70">Certificates Issued</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-yellow-400">{pendingPaymentsCount}</div>
            <div className="text-white/70">Pending Payments</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-purple-400">{verifiedPayments}</div>
            <div className="text-white/70">Verified Payments</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'certificates'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            🎓 Upload Certificate
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-xl font-medium transition relative ${
              activeTab === 'payments'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            💳 Payments
            {pendingPaymentsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {pendingPaymentsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'profile'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            👤 My Profile
          </button>
        </div>

        {/* Search */}
        {activeTab !== 'profile' && (
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search students by name or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-96 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
            />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-6">My Profile</h2>
            <p className="text-white/60 mb-6">Update your contact information. This will be visible to students in their portal.</p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Profile Picture */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-purple-400 shadow-xl" />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                      {profileForm.name?.[0] || '📋'}
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition shadow-lg">
                    <span className="text-white">📷</span>
                    <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                  </label>
                </div>
                <p className="text-white/60 text-sm text-center">Click the camera icon to change your photo</p>
              </div>

              {/* Profile Form */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Occupation</label>
                    <input
                      type="text"
                      value={profileForm.occupation}
                      onChange={(e) => setProfileForm({ ...profileForm, occupation: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
                      placeholder="e.g., Secretary"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">School/Organization</label>
                    <input
                      type="text"
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-purple-400"
                      placeholder="e.g., Light House Academy"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !profileForm.name || !profileForm.email || !profileForm.phone}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        <span>Save Profile</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> Your contact information will be visible to students in their portal under "Contact Staff" section.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab - Organized by Session */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-600/50 to-indigo-600/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🎓</span>
                Upload Certificate
              </h2>
              <p className="text-purple-200 mt-2">
                Organize and upload certificates for students by their registered sessions
              </p>
            </div>

            {sessionsWithStudents.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center text-white/50">
                <span className="text-5xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessionsWithStudents.map((session) => {
                const sessionStudents = getStudentsBySession(session.name);
                const isExpanded = expandedSessions.includes(session.id);
                const certificateCount = sessionStudents.filter(s => s.certificate).length;
                
                return (
                  <div key={session.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    {/* Session Header */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📅</span>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-white">{session.name}</h3>
                          <p className="text-sm text-white/60">
                            {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''} registered
                            {' • '}
                            {certificateCount} certificate{certificateCount !== 1 ? 's' : ''} issued
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.price === 'Free' || session.price === 'free' || session.price === '0'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {session.price === 'Free' || session.price === 'free' || session.price === '0' ? 'FREE' : session.price}
                        </span>
                        <span className={`transform transition-transform text-white/60 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Session Students */}
                    {isExpanded && (
                      <div className="p-4 border-t border-white/10">
                        {sessionStudents.length === 0 ? (
                          <div className="text-center py-4 text-white/50">
                            No students match your search in this session
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sessionStudents.map((student) => (
                              <div key={student.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  {/* Student Info */}
                                  <div className="flex items-center space-x-4">
                                    {student.profilePicture ? (
                                      <img 
                                        src={student.profilePicture} 
                                        alt="" 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-purple-400" 
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                        {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-white">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-sm text-white/60">
                                        {student.registrationNumber}
                                      </div>
                                      <div className="text-xs text-white/40">
                                        {student.email}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment & Certificate Status */}
                                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    {/* Payment Status */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      student.paymentStatus === 'approved' 
                                        ? 'bg-green-500/20 text-green-300' 
                                        : student.paymentStatus === 'pending'
                                        ? 'bg-yellow-500/20 text-yellow-300'
                                        : student.paymentStatus === 'rejected'
                                        ? 'bg-red-500/20 text-red-300'
                                        : 'bg-white/10 text-white/60'
                                    }`}>
                                      {student.paymentStatus === 'approved' ? '✓ Payment Verified' :
                                       student.paymentStatus === 'pending' ? '⏳ Payment Pending' :
                                       student.paymentStatus === 'rejected' ? '✗ Payment Rejected' :
                                       'No Payment'}
                                    </span>

                                    {/* Certificate Actions */}
                                    {student.certificate ? (
                                      <div className="flex items-center gap-2">
                                        <span className="text-green-400 font-medium text-sm">✓ Certificate Uploaded</span>
                                        <button
                                          onClick={() => setSelectedStudentForCert(student.id)}
                                          className="text-blue-400 hover:underline text-sm"
                                        >
                                          Update
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        {selectedStudentForCert === student.id ? (
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <input
                                              type="file"
                                              accept=".pdf,.jpg,.png"
                                              onChange={handleCertificateFileChange}
                                              className="text-sm text-white/70"
                                            />
                                            <button
                                              onClick={() => handleUploadCertificate(student.id)}
                                              disabled={!certificateFile}
                                              className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm disabled:opacity-50 hover:bg-green-600"
                                            >
                                              Upload
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedStudentForCert('');
                                                setCertificateFile('');
                                              }}
                                              className="text-white/50 text-sm hover:text-white"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setSelectedStudentForCert(student.id)}
                                            className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-600 transition"
                                          >
                                            📄 Upload Certificate
                                          </button>
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Payments Tab - Organized by Session */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-600/50 to-emerald-600/50 backdrop-blur-xl rounded-2xl border border-white/20 p-6 text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">💳</span>
                Payment Verification
              </h2>
              <p className="text-green-200 mt-2">
                Review and verify student payments by their registered sessions
              </p>
            </div>

            {sessionsWithStudents.length === 0 ? (
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center text-white/50">
                <span className="text-5xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessionsWithStudents.map((session) => {
                const sessionStudents = getStudentsBySession(session.name);
                const isExpanded = expandedSessions.includes(session.id);
                const pendingCount = sessionStudents.filter(s => s.paymentStatus === 'pending').length;
                const verifiedCount = sessionStudents.filter(s => s.paymentStatus === 'approved').length;
                
                return (
                  <div key={session.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden">
                    {/* Session Header */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📅</span>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-white">{session.name}</h3>
                          <p className="text-sm text-white/60">
                            {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''}
                            {pendingCount > 0 && <span className="text-yellow-400"> • {pendingCount} pending</span>}
                            {verifiedCount > 0 && <span className="text-green-400"> • {verifiedCount} verified</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.price === 'Free' || session.price === 'free' || session.price === '0'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {session.price === 'Free' || session.price === 'free' || session.price === '0' ? 'FREE' : session.price}
                        </span>
                        {pendingCount > 0 && (
                          <span className="bg-yellow-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                            {pendingCount}
                          </span>
                        )}
                        <span className={`transform transition-transform text-white/60 ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Session Students */}
                    {isExpanded && (
                      <div className="p-4 border-t border-white/10">
                        {sessionStudents.length === 0 ? (
                          <div className="text-center py-4 text-white/50">
                            No students match your search in this session
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sessionStudents.map((student) => (
                              <div key={student.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  {/* Student Info */}
                                  <div className="flex items-center space-x-4">
                                    {student.profilePicture ? (
                                      <img 
                                        src={student.profilePicture} 
                                        alt="" 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-green-400" 
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                        {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-white">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-sm text-white/60">
                                        {student.registrationNumber}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Actions */}
                                  <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Badge */}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      student.paymentStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                                      student.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                                      student.paymentStatus === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                      'bg-white/10 text-white/60'
                                    }`}>
                                      {student.paymentStatus === 'approved' ? '✓ Verified' :
                                       student.paymentStatus === 'pending' ? '⏳ Pending' :
                                       student.paymentStatus === 'rejected' ? '✗ Rejected' :
                                       'Not Submitted'}
                                    </span>
                                    
                                    {/* Action Buttons */}
                                    {student.paymentReceipt && (
                                      <button
                                        onClick={() => setViewingReceipt(student.paymentReceipt || null)}
                                        className="text-blue-400 hover:underline text-sm"
                                      >
                                        View Receipt
                                      </button>
                                    )}
                                    {student.paymentStatus === 'pending' && (
                                      <>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Verify payment for ${student.firstName} ${student.lastName}? This will unlock their certificate.`)) {
                                              approvePayment(student.id);
                                              alert('Payment verified successfully!');
                                            }
                                          }}
                                          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition"
                                        >
                                          ✓ Verify
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Reject payment for ${student.firstName} ${student.lastName}?`)) {
                                              rejectPayment(student.id);
                                            }
                                          }}
                                          className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Group Chat */}
      <GroupChat />

      {/* Receipt Viewing Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Payment Receipt</h3>
            <div className="max-h-96 overflow-auto bg-white/10 rounded-xl p-2">
              {viewingReceipt.includes('application/pdf') ? (
                <iframe src={viewingReceipt} className="w-full h-96" />
              ) : (
                <img src={viewingReceipt} alt="Receipt" className="max-w-full rounded" />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryPortal;
