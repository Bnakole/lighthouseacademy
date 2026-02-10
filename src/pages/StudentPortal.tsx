import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GroupChat } from '../components/GroupChat';

const StudentPortal = () => {
  const navigate = useNavigate();
  const { auth, logout, students, updateProfilePicture, uploadPaymentReceipt, sendMessage, messages, siteSettings, staffOnlineStatus } = useApp();
  
  // Get staff contacts from siteSettings (updated by SCO and Secretary)
  const staffContacts = {
    secretary: {
      name: siteSettings?.staffContacts?.secretary?.name || 'Secretary',
      email: siteSettings?.staffContacts?.secretary?.email || 'secretary@lighthouseacademy.com',
      phone: siteSettings?.staffContacts?.secretary?.phone || '+234 800 000 0001',
      occupation: siteSettings?.staffContacts?.secretary?.occupation || 'Administrative Officer',
      school: siteSettings?.staffContacts?.secretary?.school || 'Light House Academy',
      profilePicture: siteSettings?.staffContacts?.secretary?.profilePicture || null
    },
    sco: {
      name: siteSettings?.staffContacts?.sco?.name || 'Student Coordinator',
      email: siteSettings?.staffContacts?.sco?.email || 'sco@lighthouseacademy.com',
      phone: siteSettings?.staffContacts?.sco?.phone || '+234 800 000 0002',
      occupation: siteSettings?.staffContacts?.sco?.occupation || 'Student Coordinator',
      school: siteSettings?.staffContacts?.sco?.school || 'Light House Academy',
      profilePicture: siteSettings?.staffContacts?.sco?.profilePicture || null
    },
    admin: {
      name: siteSettings?.staffContacts?.admin?.name || 'Administrator',
      email: siteSettings?.staffContacts?.admin?.email || 'admin@lighthouseacademy.com',
      phone: siteSettings?.staffContacts?.admin?.phone || '+234 800 000 0003',
      occupation: siteSettings?.staffContacts?.admin?.occupation || 'System Administrator',
      school: siteSettings?.staffContacts?.admin?.school || 'Light House Academy',
      profilePicture: siteSettings?.staffContacts?.admin?.profilePicture || null
    }
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGroupChat, setShowGroupChat] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const [notifications, setNotifications] = useState({ push: true, email: true });

  // Get current student data from students array (for real-time updates)
  const currentStudent = auth.currentStudent 
    ? students.find(s => s.id === auth.currentStudent?.id) || auth.currentStudent
    : null;

  useEffect(() => {
    if (!auth.isStudentLoggedIn || !currentStudent) {
      navigate('/student-login');
    }
  }, [auth.isStudentLoggedIn, currentStudent, navigate]);

  if (!currentStudent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfilePicture(currentStudent.id, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 10 * 1024 * 1024) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitReceipt = () => {
    if (receiptFile) {
      uploadPaymentReceipt(currentStudent.id, receiptFile);
      setReceiptFile(null);
      setReceiptFileName('');
    }
  };

  const sendMessageToAdmin = () => {
    if (newMessage.trim()) {
      sendMessage(
        currentStudent.id,
        `${currentStudent.firstName} ${currentStudent.lastName}`,
        'student',
        'admin',
        'admin',
        newMessage
      );
      setNewMessage('');
    }
  };

  const studentMessages = messages.filter(
    m => (m.senderId === currentStudent.id && m.recipientId === 'admin') ||
         (m.senderId === 'admin' && m.recipientId === currentStudent.id)
  );

  const getInitials = () => {
    return `${currentStudent.firstName?.[0] || ''}${currentStudent.lastName?.[0] || ''}`.toUpperCase();
  };

  const isPaymentApproved = currentStudent.paymentStatus === 'approved';
  const isPaymentPending = currentStudent.paymentStatus === 'pending';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'materials', label: 'Materials', icon: '📚' },
    { id: 'payment', label: 'Payment', icon: '💳' },
    { id: 'certificate', label: 'Certificate', icon: '🎓' },
    { id: 'messages', label: 'Messages', icon: '💬' },
    { id: 'class', label: 'Join Class', icon: '🎥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setShowProfileModal(true)}
              >
                {currentStudent.profilePicture ? (
                  <img 
                    src={currentStudent.profilePicture} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 group-hover:border-yellow-300 transition-all"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-all">
                    {getInitials()}
                  </div>
                )}
                {currentStudent.isLeader && (
                  <span className="absolute -top-1 -right-1 text-lg">⭐</span>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-semibold text-lg">{currentStudent.firstName} {currentStudent.lastName}</h1>
                <p className="text-blue-200 text-xs">{currentStudent.registrationNumber}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGroupChat(true)}
                className="relative p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
                title="Group Chat"
              >
                <span className="text-xl">💬</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold">!</span>
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-2"
              >
                <span className="hidden sm:inline">Logout</span>
                <span>🚪</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white/5 backdrop-blur-sm border-b border-white/10 sticky top-[65px] z-30 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 py-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome back, {currentStudent.firstName}! 👋</h2>
                  <p className="text-blue-100">Continue your learning journey with Light House Academy</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('materials')}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all flex items-center gap-2"
                  >
                    <span>📚</span> View Materials
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {isPaymentApproved ? '✅' : isPaymentPending ? '⏳' : '💳'}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Payment</p>
                    <p className={`font-semibold capitalize ${
                      isPaymentApproved ? 'text-green-400' :
                      isPaymentPending ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {currentStudent.paymentStatus || 'Not Submitted'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {currentStudent.certificate ? '🎓' : '📄'}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Certificate</p>
                    <p className={`font-semibold ${currentStudent.certificate ? 'text-green-400' : 'text-white'}`}>
                      {currentStudent.certificate ? 'Available' : 'Pending'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Session</p>
                    <p className="font-semibold text-sm">{currentStudent.session || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-white border border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {currentStudent.isLeader ? '⭐' : '👤'}
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Status</p>
                    <p className="font-semibold text-yellow-400">{currentStudent.isLeader ? 'Leader' : 'Member'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>👤</span> My Profile
                </h3>
              </div>
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      {currentStudent.profilePicture ? (
                        <img 
                          src={currentStudent.profilePicture} 
                          alt="Profile" 
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
                          {getInitials()}
                        </div>
                      )}
                      <label className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg">
                        <span className="text-white text-sm">📷</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
                      </label>
                    </div>
                    <p className="text-white/60 text-xs">Click 📷 to change photo</p>
                  </div>

                  {/* Profile Details */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileField label="Full Name" value={`${currentStudent.firstName} ${currentStudent.lastName}`} icon="👤" />
                    <ProfileField label="Registration No." value={currentStudent.registrationNumber} icon="🔢" />
                    <ProfileField label="Email" value={currentStudent.email} icon="📧" />
                    <ProfileField label="Phone" value={currentStudent.phone} icon="📱" />
                    <ProfileField label="Gender" value={currentStudent.gender} icon="⚧" />
                    <ProfileField label="Country" value={currentStudent.country || 'N/A'} icon="🌍" />
                    <ProfileField label="State" value={currentStudent.state || 'N/A'} icon="📍" />
                    <ProfileField label="Drama Group" value={currentStudent.dramaGroup || 'N/A'} icon="🎭" />
                    <ProfileField label="Position" value={currentStudent.position || 'N/A'} icon="🏅" />
                    <ProfileField label="Program" value={currentStudent.program} icon="📚" />
                  </div>
                </div>

                {/* Statement of Purpose */}
                {currentStudent.statementOfPurpose && (
                  <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-white/60 text-sm mb-2 flex items-center gap-2">
                      <span>📝</span> Statement of Purpose
                    </p>
                    <p className="text-white">{currentStudent.statementOfPurpose}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction 
                icon="💳" 
                label="Make Payment" 
                onClick={() => setActiveTab('payment')} 
                color="from-green-500 to-emerald-600"
              />
              <QuickAction 
                icon="📚" 
                label="View Materials" 
                onClick={() => setActiveTab('materials')} 
                color="from-blue-500 to-indigo-600"
              />
              <QuickAction 
                icon="🎓" 
                label="Certificate" 
                onClick={() => setActiveTab('certificate')} 
                color="from-purple-500 to-pink-600"
              />
              <QuickAction 
                icon="💬" 
                label="Group Chat" 
                onClick={() => setShowGroupChat(true)} 
                color="from-orange-500 to-red-600"
              />
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📚</span> Learning Materials
                </h3>
                <p className="text-blue-100 mt-1">Access your course materials and resources</p>
              </div>
              <div className="p-6">
                <div className="text-center py-12 text-white/60">
                  <span className="text-6xl mb-4 block">📂</span>
                  <p className="text-lg">No materials uploaded yet</p>
                  <p className="text-sm mt-2">Check back later for new content</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Payment Status */}
            <div className={`rounded-2xl p-6 ${
              isPaymentApproved 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                : isPaymentPending
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                  {isPaymentApproved ? '✅' : isPaymentPending ? '⏳' : '💳'}
                </div>
                <div className="text-white">
                  <h3 className="text-xl font-bold">
                    {isPaymentApproved 
                      ? 'Payment Verified!' 
                      : isPaymentPending
                      ? 'Payment Under Review'
                      : 'Payment Required'}
                  </h3>
                  <p className="text-white/80">
                    {isPaymentApproved 
                      ? 'Your certificate is now unlocked.' 
                      : isPaymentPending
                      ? 'Your payment receipt is being reviewed by admin.'
                      : 'Upload your payment receipt to proceed.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-green-600/50 to-teal-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🏦</span> Bank Account Details
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-4">
                  <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Bank Name</p>
                      <p className="text-white text-lg font-semibold">Opay</p>
                    </div>
                    <span className="text-3xl">🏦</span>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Account Number</p>
                      <p className="text-white text-2xl font-bold tracking-wider">8080498742</p>
                    </div>
                    <button 
                      onClick={() => navigator.clipboard.writeText('8080498742')}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Account Name</p>
                      <p className="text-white text-lg font-semibold">LIGHT HOUSE ACADEMY</p>
                    </div>
                    <span className="text-3xl">👤</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Receipt */}
            {!isPaymentApproved && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
                <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📤</span> Upload Payment Receipt
                  </h3>
                </div>
                <div className="p-6">
                  <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-all">
                    {receiptFile ? (
                      <div className="space-y-4">
                        <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-2xl flex items-center justify-center text-4xl">
                          ✅
                        </div>
                        <p className="text-white font-medium">{receiptFileName}</p>
                        <div className="flex gap-3 justify-center">
                          <button
                            onClick={submitReceipt}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                          >
                            Submit Receipt
                          </button>
                          <button
                            onClick={() => { setReceiptFile(null); setReceiptFileName(''); }}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="w-20 h-20 mx-auto bg-white/10 rounded-2xl flex items-center justify-center text-4xl mb-4">
                          📤
                        </div>
                        <p className="text-white font-medium mb-2">Click to upload receipt</p>
                        <p className="text-white/60 text-sm">Supports: JPG, PNG, PDF (Max 10MB)</p>
                        <input 
                          type="file" 
                          accept="image/*,.pdf" 
                          className="hidden" 
                          onChange={handleReceiptUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === 'certificate' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-yellow-600/50 to-orange-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎓</span> Your Certificate
                </h3>
              </div>
              <div className="p-8">
                {currentStudent.certificate && currentStudent.certificateUnlocked ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-5xl animate-bounce">
                      🎓
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-white mb-2">Congratulations! 🎉</h4>
                      <p className="text-white/70">Your certificate is ready for download</p>
                    </div>
                    <a
                      href={currentStudent.certificate}
                      download={`LHA_Certificate_${currentStudent.registrationNumber}.pdf`}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
                    >
                      <span className="text-2xl">📥</span>
                      Download Certificate
                    </a>
                  </div>
                ) : currentStudent.certificate ? (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-2xl flex items-center justify-center text-5xl">
                      🔒
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Certificate Locked</h4>
                      <p className="text-white/70">Complete your payment to unlock your certificate</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('payment')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                    >
                      <span>💳</span> Go to Payment
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-white/10 rounded-2xl flex items-center justify-center text-5xl">
                      ⏳
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2">Certificate Not Yet Available</h4>
                      <p className="text-white/70">Your certificate will be available after the training is complete</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10 h-[600px] flex flex-col">
              <div className="bg-gradient-to-r from-indigo-600/50 to-purple-600/50 p-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>💬</span> Messages with Admin
                </h3>
                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm">
                  {studentMessages.length} messages
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {studentMessages.length === 0 ? (
                  <div className="text-center py-12 text-white/60">
                    <span className="text-6xl mb-4 block">💭</span>
                    <p>No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  studentMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.senderType === 'student'
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white/20 text-white rounded-bl-sm'
                      }`}>
                        <p>{msg.content}</p>
                        <p className="text-xs mt-2 opacity-60">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessageToAdmin()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={sendMessageToAdmin}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all flex items-center gap-2"
                  >
                    <span>📤</span>
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join Class Tab */}
        {activeTab === 'class' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-green-600/50 to-teal-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🎥</span> Join Class
                </h3>
              </div>
              <div className="p-8 text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl flex items-center justify-center text-5xl animate-pulse">
                  📱
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white mb-2">WhatsApp/Telegram Group</h4>
                  <p className="text-white/70 max-w-md mx-auto">
                    The training will take place on a closed WhatsApp/Telegram group. Click the button below to join.
                  </p>
                </div>
                <a
                  href="https://t.me/+k7GOXSYPzYozNjM0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
                >
                  <span className="text-2xl">🚀</span>
                  Join Now
                </a>
              </div>
            </div>

            {/* Staff Contacts */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-blue-600/50 to-indigo-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>📞</span> Contact Staff
                </h3>
              </div>
              <div className="p-6 grid gap-4 md:grid-cols-3">
                {/* Secretary Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      {staffContacts.secretary.profilePicture ? (
                        <img 
                          src={staffContacts.secretary.profilePicture} 
                          alt="Secretary" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl">
                          📧
                        </div>
                      )}
                      {/* Online/Offline Indicator */}
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-800 ${staffOnlineStatus?.secretary ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{staffContacts.secretary.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white/60 text-sm">Secretary</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${staffOnlineStatus?.secretary ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {staffOnlineStatus?.secretary ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {staffContacts.secretary.occupation && (
                    <p className="text-purple-300 text-sm mb-1">💼 {staffContacts.secretary.occupation}</p>
                  )}
                  {staffContacts.secretary.school && (
                    <p className="text-yellow-300 text-sm mb-2">🏫 {staffContacts.secretary.school}</p>
                  )}
                  <div className="space-y-2 text-sm border-t border-white/10 pt-2 mt-2">
                    <p className="text-blue-300 flex items-center gap-2">
                      <span>📧</span> {staffContacts.secretary.email}
                    </p>
                    <p className="text-green-300 flex items-center gap-2">
                      <span>📱</span> {staffContacts.secretary.phone}
                    </p>
                  </div>
                </div>

                {/* SCO Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      {staffContacts.sco.profilePicture ? (
                        <img 
                          src={staffContacts.sco.profilePicture} 
                          alt="SCO" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-green-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xl">
                          👥
                        </div>
                      )}
                      {/* Online/Offline Indicator */}
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-800 ${staffOnlineStatus?.sco ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{staffContacts.sco.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white/60 text-sm">Student Coordinator</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${staffOnlineStatus?.sco ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {staffOnlineStatus?.sco ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {staffContacts.sco.occupation && (
                    <p className="text-purple-300 text-sm mb-1">💼 {staffContacts.sco.occupation}</p>
                  )}
                  {staffContacts.sco.school && (
                    <p className="text-yellow-300 text-sm mb-2">🏫 {staffContacts.sco.school}</p>
                  )}
                  <div className="space-y-2 text-sm border-t border-white/10 pt-2 mt-2">
                    <p className="text-blue-300 flex items-center gap-2">
                      <span>📧</span> {staffContacts.sco.email}
                    </p>
                    <p className="text-green-300 flex items-center gap-2">
                      <span>📱</span> {staffContacts.sco.phone}
                    </p>
                  </div>
                </div>

                {/* Admin Card */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      {staffContacts.admin.profilePicture ? (
                        <img 
                          src={staffContacts.admin.profilePicture} 
                          alt="Admin" 
                          className="w-12 h-12 rounded-full object-cover border-2 border-red-400"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-xl">
                          🛡️
                        </div>
                      )}
                      {/* Online/Offline Indicator */}
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-800 ${staffOnlineStatus?.admin ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{staffContacts.admin.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white/60 text-sm">Administrator</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${staffOnlineStatus?.admin ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {staffOnlineStatus?.admin ? '🟢 Online' : '🔴 Offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {staffContacts.admin.occupation && (
                    <p className="text-purple-300 text-sm mb-1">💼 {staffContacts.admin.occupation}</p>
                  )}
                  {staffContacts.admin.school && (
                    <p className="text-yellow-300 text-sm mb-2">🏫 {staffContacts.admin.school}</p>
                  )}
                  <div className="space-y-2 text-sm border-t border-white/10 pt-2 mt-2">
                    <p className="text-blue-300 flex items-center gap-2">
                      <span>📧</span> {staffContacts.admin.email}
                    </p>
                    <p className="text-green-300 flex items-center gap-2">
                      <span>📱</span> {staffContacts.admin.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Notification Settings */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-purple-600/50 to-pink-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🔔</span> Notification Settings
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📱</span>
                    <div>
                      <p className="text-white font-medium">Push Notifications</p>
                      <p className="text-white/60 text-sm">Receive notifications on your device</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="text-white font-medium">Email Notifications</p>
                      <p className="text-white/60 text-sm">Receive updates via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-indigo-600/50 to-blue-600/50 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>🔐</span> Account Information
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-white/60 text-sm">Registration Number (Your Login Password)</p>
                  <p className="text-white text-lg font-mono mt-1">{currentStudent.registrationNumber}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-white/60 text-sm">Registered On</p>
                  <p className="text-white text-lg mt-1">{new Date(currentStudent.registrationDate).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-white/60 text-sm">Account Status</p>
                  <p className="text-green-400 text-lg mt-1 capitalize">{currentStudent.status}</p>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-red-500/20">
              <div className="bg-red-600/30 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <span>⚠️</span> Danger Zone
                </h3>
              </div>
              <div className="p-6">
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                >
                  <span>🚪</span> Logout from Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowProfileModal(false)}>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md w-full border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Profile Picture</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-white/60 hover:text-white text-2xl">×</button>
            </div>
            <div className="flex flex-col items-center gap-4">
              {currentStudent.profilePicture ? (
                <img src={currentStudent.profilePicture} alt="Profile" className="w-32 h-32 rounded-2xl object-cover border-4 border-white/20" />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-4xl">
                  {getInitials()}
                </div>
              )}
              <label className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium cursor-pointer transition-all">
                <span>📷 Choose New Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleProfilePictureChange} />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat Modal */}
      {showGroupChat && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowGroupChat(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-blue-600 to-purple-600">
              <h3 className="text-xl font-bold text-white">💬 Group Chat</h3>
              <button onClick={() => setShowGroupChat(false)} className="text-white/80 hover:text-white text-2xl">×</button>
            </div>
            <div className="h-[calc(100%-60px)]">
              <GroupChat embedded={true} />
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

// Helper Components
const ProfileField = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
  <div className="bg-white/5 rounded-xl p-3 border border-white/10">
    <p className="text-white/60 text-xs flex items-center gap-1">
      <span>{icon}</span> {label}
    </p>
    <p className="text-white font-medium mt-1 truncate">{value}</p>
  </div>
);

const QuickAction = ({ icon, label, onClick, color }: { icon: string; label: string; onClick: () => void; color: string }) => (
  <button
    onClick={onClick}
    className={`bg-gradient-to-r ${color} rounded-xl p-4 text-white hover:shadow-lg hover:scale-105 transition-all`}
  >
    <span className="text-3xl block mb-2">{icon}</span>
    <p className="font-medium text-sm">{label}</p>
  </button>
);

export default StudentPortal;
