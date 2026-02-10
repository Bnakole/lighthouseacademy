import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GroupChat } from '../components/GroupChat';

const SCOPortal: React.FC = () => {
  const navigate = useNavigate();
  const {
    students,
    sessions,
    materials,
    addMaterial,
    deleteMaterial,
    messages,
    sendMessage,
    getMessagesByStudent,
    markMessagesAsRead,
    getUnreadCount,
    isOnline,
    isSyncing,
    siteSettings,
    updateSiteSettings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'materials' | 'messages' | 'profile'>('materials');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Material upload state
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    category: 'document',
    targetProgram: 'Online Training',
    targetSession: ''
  });
  const [materialFile, setMaterialFile] = useState<string>('');
  const [materialFileName, setMaterialFileName] = useState('');
  const [materialFileType, setMaterialFileType] = useState('');
  const [materialFileSize, setMaterialFileSize] = useState(0);

  // Messages state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    if (role !== 'sco' && role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  // Load profile from siteSettings
  useEffect(() => {
    if (siteSettings?.staffContacts?.sco) {
      const sco = siteSettings.staffContacts.sco;
      setProfileForm({
        name: sco.name || '',
        email: sco.email || '',
        phone: sco.phone || '',
        occupation: sco.occupation || 'Student Coordinator',
        school: sco.school || ''
      });
      setProfilePicture(sco.profilePicture || '');
    }
  }, [siteSettings]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

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
          sco: {
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

  // Handle material file upload
  const handleMaterialFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMaterialFile(reader.result as string);
        setMaterialFileName(file.name);
        setMaterialFileType(file.type);
        setMaterialFileSize(file.size);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle material upload
  const handleUploadMaterial = () => {
    if (!materialForm.title || !materialFile) {
      alert('Please fill in all required fields');
      return;
    }
    addMaterial({
      title: materialForm.title,
      description: materialForm.description,
      fileName: materialFileName,
      fileType: materialFileType,
      fileData: materialFile,
      fileSize: materialFileSize,
      category: materialForm.category,
      targetProgram: materialForm.targetProgram,
      targetSession: materialForm.targetSession,
      uploadedBy: 'SCO'
    });
    setShowMaterialModal(false);
    setMaterialForm({ title: '', description: '', category: 'document', targetProgram: 'Online Training', targetSession: '' });
    setMaterialFile('');
    setMaterialFileName('');
    alert('Material uploaded successfully!');
  };

  // Handle messages
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessage(selectedConversation, newMessage, 'admin');
    setNewMessage('');
  };

  // Get all students for messaging
  const getAllStudentsForMessaging = () => {
    return students.sort((a, b) => {
      const aUnread = getUnreadCount(a.id, 'admin');
      const bUnread = getUnreadCount(b.id, 'admin');
      if (aUnread !== bUnread) return bUnread - aUnread;
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const getTotalUnreadForAdmin = () => {
    return students.reduce((total, student) => total + getUnreadCount(student.id, 'admin'), 0);
  };

  const filteredStudents = getAllStudentsForMessaging().filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-xl border-b border-white/20 py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SCO Portal</h1>
              <p className="text-sm text-green-200">Student Coordinator - Materials & Messages</p>
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
            <div className="text-3xl font-bold text-blue-400">{students.length}</div>
            <div className="text-white/70">Total Students</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-green-400">{materials.length}</div>
            <div className="text-white/70">Materials</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-purple-400">{getTotalUnreadForAdmin()}</div>
            <div className="text-white/70">Unread Messages</div>
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <div className="text-3xl font-bold text-orange-400">{sessions.length}</div>
            <div className="text-white/70">Sessions</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'materials'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            📚 Materials
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-xl font-medium transition relative ${
              activeTab === 'messages'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            💬 Messages
            {getTotalUnreadForAdmin() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
                {getTotalUnreadForAdmin()}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'profile'
                ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                : 'bg-white/10 text-white/80 hover:bg-white/20 border border-white/20'
            }`}
          >
            👤 My Profile
          </button>
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Learning Materials</h2>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition flex items-center gap-2"
              >
                <span>+</span> Upload Material
              </button>
            </div>

            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:bg-white/10 transition">
                  <div>
                    <h3 className="font-medium text-white">{material.title}</h3>
                    <p className="text-sm text-white/60">{material.description}</p>
                    <p className="text-xs text-white/40 mt-1">
                      {material.fileName} • {material.fileSize ? (material.fileSize / 1024 / 1024).toFixed(2) : 0} MB • {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                    {material.targetSession && (
                      <span className="inline-block mt-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                        {material.targetSession}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('Delete this material?')) {
                        deleteMaterial(material.id);
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-lg transition"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="text-center py-12 text-white/50">
                  <span className="text-5xl mb-4 block">📚</span>
                  <p>No materials uploaded yet</p>
                  <p className="text-sm mt-1">Click "Upload Material" to add your first resource</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Student Messages</h2>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4" style={{ height: '500px' }}>
              {/* Conversation List */}
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="bg-green-500/20 p-3 font-medium border-b border-white/10 text-white">
                  All Students ({students.length})
                </div>
                <div className="overflow-y-auto" style={{ height: '450px' }}>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-white/50">No students found</div>
                  ) : (
                    filteredStudents.map((student) => {
                      const unread = getUnreadCount(student.id, 'admin');
                      const hasMessages = messages.some(m => m.studentId === student.id);
                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            setSelectedConversation(student.id);
                            markMessagesAsRead(student.id, 'admin');
                          }}
                          className={`w-full p-3 text-left border-b border-white/5 hover:bg-white/10 transition ${
                            selectedConversation === student.id ? 'bg-green-500/20' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {student.profilePicture ? (
                                <img src={student.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm text-white">
                                  {student.firstName} {student.lastName}
                                  {student.isLeader && <span className="ml-1 text-yellow-400">⭐</span>}
                                </div>
                                <div className="text-xs text-white/50">{student.registrationNumber}</div>
                                {!hasMessages && (
                                  <div className="text-xs text-white/30">No messages yet</div>
                                )}
                              </div>
                            </div>
                            {unread > 0 && (
                              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                {unread}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="bg-green-500/20 p-3 font-medium border-b border-white/10 flex items-center space-x-3">
                      {(() => {
                        const student = students.find(s => s.id === selectedConversation);
                        return student ? (
                          <>
                            {student.profilePicture ? (
                              <img src={student.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">{student.firstName} {student.lastName}</div>
                              <div className="text-xs text-white/50">{student.email}</div>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '350px' }}>
                      {getMessagesByStudent(selectedConversation).length === 0 ? (
                        <div className="text-center py-12 text-white/50">
                          <span className="text-5xl mb-4 block">💬</span>
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        getMessagesByStudent(selectedConversation).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-2xl ${
                                msg.senderType === 'admin'
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                                  : 'bg-white/10 text-white'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-green-200' : 'text-white/50'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t border-white/10 flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 placeholder-white/40 focus:outline-none focus:border-green-400"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:shadow-lg transition disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-white/50">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">👈</span>
                      <p>Select a student to view or start a conversation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                    <img src={profilePicture} alt="Profile" className="w-40 h-40 rounded-full object-cover border-4 border-green-400 shadow-xl" />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-5xl font-bold shadow-xl">
                      {profileForm.name?.[0] || '👨‍🏫'}
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-600 transition shadow-lg">
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
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
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
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
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
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
                      placeholder="e.g., Student Coordinator"
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-sm mb-2">School/Organization</label>
                    <input
                      type="text"
                      value={profileForm.school}
                      onChange={(e) => setProfileForm({ ...profileForm, school: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
                      placeholder="e.g., Light House Academy"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving || !profileForm.name || !profileForm.email || !profileForm.phone}
                    className="w-full md:w-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
      </div>

      {/* Group Chat */}
      <GroupChat />

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-white/20 rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Upload Material</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
              />
              <textarea
                placeholder="Description"
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 placeholder-white/40 focus:outline-none focus:border-green-400"
                rows={3}
              />
              <select
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-400"
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
              <select
                value={materialForm.targetSession}
                onChange={(e) => setMaterialForm({ ...materialForm, targetSession: e.target.value })}
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-green-400"
              >
                <option value="">All Sessions</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <div className="border-2 border-dashed border-white/30 rounded-xl p-4 text-center">
                <input
                  type="file"
                  onChange={handleMaterialFileChange}
                  className="w-full text-white/70"
                />
                {materialFileName && (
                  <p className="text-sm text-green-400 mt-2">✓ {materialFileName}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMaterialModal(false);
                  setMaterialFile('');
                  setMaterialFileName('');
                }}
                className="px-4 py-2 text-white/70 hover:bg-white/10 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={!materialForm.title || !materialFile}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SCOPortal;
