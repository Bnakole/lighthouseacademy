import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Student, Session, Facilitator } from '../types';
import CodeEditor from '../components/CodeEditor';
import GroupChat from '../components/GroupChat';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const {
    auth,
    logoutAdmin,
    students,
    updateStudentStatus,
    deleteStudent,
    toggleLeader,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    materials,
    addMaterial,
    deleteMaterial,
    messages,
    sendMessage,
    getMessagesByStudent,
    markMessagesAsRead,
    getUnreadCount,
    uploadCertificate,
    approvePayment,
    rejectPayment,
    siteSettings,
    updateSiteSettings,
    isOnline,
    isSyncing
  } = useApp();

  const [activeTab, setActiveTab] = useState<'students' | 'materials' | 'certificates' | 'payments' | 'sessions' | 'messages' | 'settings' | 'code'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSession, setFilterSession] = useState('all');
  
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

  // Session management state
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [sessionForm, setSessionForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'upcoming' as Session['status'],
    registrationStatus: 'closed' as Session['registrationStatus'],
    price: 'Free',
    description: ''
  });
  const [facilitators, setFacilitators] = useState<Facilitator[]>([]);
  const [newFacilitator, setNewFacilitator] = useState({ name: '', role: '', photo: '' });

  // Certificate upload state
  const [certificateFile, setCertificateFile] = useState<string>('');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<string>('');

  // Receipt viewing state
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  // Messages state
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Site settings state
  const [siteName, setSiteName] = useState(siteSettings.siteName);
  const [siteLogo, setSiteLogo] = useState(siteSettings.logo);
  const [aiApiKey, setAiApiKey] = useState(siteSettings.aiApiKey || '');

  useEffect(() => {
    if (!auth.isAdminLoggedIn) {
      navigate('/admin-login');
    }
  }, [auth.isAdminLoggedIn, navigate]);

  useEffect(() => {
    setSiteName(siteSettings.siteName);
    setSiteLogo(siteSettings.logo);
    setAiApiKey(siteSettings.aiApiKey || '');
  }, [siteSettings]);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = filterSession === 'all' || student.session === filterSession;
    
    return matchesSearch && matchesSession;
  });

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
      uploadedBy: 'Admin'
    });
    setShowMaterialModal(false);
    setMaterialForm({ title: '', description: '', category: 'document', targetProgram: 'Online Training', targetSession: '' });
    setMaterialFile('');
    setMaterialFileName('');
    alert('Material uploaded successfully!');
  };

  // Handle session form
  const handleSessionSubmit = () => {
    if (!sessionForm.name || !sessionForm.startDate || !sessionForm.endDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    const sessionData = {
      name: sessionForm.name,
      startDate: sessionForm.startDate,
      endDate: sessionForm.endDate,
      status: sessionForm.status,
      registrationStatus: sessionForm.registrationStatus,
      price: sessionForm.price,
      description: sessionForm.description,
      facilitators: facilitators
    };

    if (editingSession) {
      updateSession(editingSession.id, sessionData);
      alert('Session updated successfully!');
    } else {
      addSession(sessionData);
      alert('Session created successfully!');
    }
    
    setShowSessionModal(false);
    setEditingSession(null);
    setSessionForm({ name: '', startDate: '', endDate: '', status: 'upcoming', registrationStatus: 'closed', price: 'Free', description: '' });
    setFacilitators([]);
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setSessionForm({
      name: session.name,
      startDate: session.startDate,
      endDate: session.endDate,
      status: session.status,
      registrationStatus: session.registrationStatus,
      price: session.price || 'Free',
      description: session.description || ''
    });
    setFacilitators(session.facilitators || []);
    setShowSessionModal(true);
  };

  const addFacilitator = () => {
    if (newFacilitator.name && newFacilitator.role) {
      setFacilitators([...facilitators, { 
        id: Date.now().toString(), 
        name: newFacilitator.name, 
        role: newFacilitator.role,
        photo: newFacilitator.photo
      }]);
      setNewFacilitator({ name: '', role: '', photo: '' });
    }
  };

  const removeFacilitator = (id: string) => {
    setFacilitators(facilitators.filter(f => f.id !== id));
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

  // Handle messages
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMessage(selectedConversation, newMessage, 'admin');
    setNewMessage('');
  };

  const getStudentsWithMessages = () => {
    const studentIds = [...new Set(messages.map(m => m.studentId))];
    return students.filter(s => studentIds.includes(s.id));
  };

  const getTotalUnreadForAdmin = () => {
    return students.reduce((total, student) => total + getUnreadCount(student.id, 'admin'), 0);
  };

  // Handle site settings
  const handleSaveSettings = () => {
    updateSiteSettings({ siteName, logo: siteLogo, aiApiKey });
    alert('Site settings saved successfully!');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSiteLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFacilitatorPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewFacilitator({ ...newFacilitator, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Get pending payments count
  const pendingPaymentsCount = students.filter(s => s.paymentStatus === 'pending').length;

  if (!auth.isAdminLoggedIn) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-2xl">🛡️</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">{siteSettings.siteName} - Admin Portal</h1>
              <p className="text-sm text-blue-200">Manage your academy</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sync status */}
            <div className="flex items-center space-x-2 text-sm">
              {isSyncing && <span className="animate-pulse">🔄 Syncing...</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <a 
              href="/#/admin-prompt" 
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition flex items-center space-x-2"
            >
              <span>🤖</span>
              <span>AI Editor</span>
            </a>
            <a 
              href="/#/admin-backend" 
              className="bg-gray-800 hover:bg-gray-900 px-4 py-2 rounded-lg transition flex items-center space-x-2"
            >
              <span>🔧</span>
              <span>Backend</span>
            </a>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
            <div className="text-gray-500">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-green-600">{sessions.length}</div>
            <div className="text-gray-500">Sessions</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-purple-600">{materials.length}</div>
            <div className="text-gray-500">Materials</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{students.filter(s => s.isLeader).length}</div>
            <div className="text-gray-500">Leaders</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['students', 'materials', 'certificates', 'payments', 'sessions', 'messages', 'settings', 'code'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 rounded-lg font-medium transition relative ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'payments' && pendingPaymentsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {pendingPaymentsCount}
                </span>
              )}
              {tab === 'messages' && getTotalUnreadForAdmin() > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {getTotalUnreadForAdmin()}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border rounded-lg px-4 py-2"
              />
              <select
                value={filterSession}
                onChange={(e) => setFilterSession(e.target.value)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">All Sessions</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reg. No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Session</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Leader</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {student.profilePicture ? (
                            <img src={student.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{student.firstName} {student.lastName}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{student.registrationNumber}</td>
                      <td className="px-4 py-3 text-sm">{student.session}</td>
                      <td className="px-4 py-3">
                        <select
                          value={student.status}
                          onChange={(e) => updateStudentStatus(student.id, e.target.value as Student['status'])}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="graduated">Graduated</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleLeader(student.id)}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            student.isLeader
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {student.isLeader ? '⭐ Leader' : 'Make Leader'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this student?')) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">No students found</div>
              )}
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Learning Materials</h2>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Upload Material
              </button>
            </div>

            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-gray-500">{material.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {material.fileName} • {(material.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteMaterial(material.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="text-center py-8 text-gray-500">No materials uploaded yet</div>
              )}
            </div>
          </div>
        )}

        {/* Certificates Tab - Organized by Session */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🎓</span>
                Upload Certificate
              </h2>
              <p className="text-purple-200 mt-2">
                Organize and upload certificates for students by their registered sessions
              </p>
            </div>

            {sessions.filter(session => students.some(s => s.session === session.name)).length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessions.filter(session => students.some(s => s.session === session.name)).map((session) => {
                const sessionStudents = students.filter(s => 
                  s.session === session.name &&
                  (searchTerm === '' || 
                   s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                const certificateCount = sessionStudents.filter(s => s.certificate).length;
                
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">📅</span>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{session.name}</h3>
                            <p className="text-sm text-gray-500">
                              {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''} • {certificateCount} certificate{certificateCount !== 1 ? 's' : ''} issued
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.price === 'Free' || session.price === 'free' || session.price === '0'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.price === 'Free' || session.price === 'free' || session.price === '0' ? 'FREE' : session.price}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      {sessionStudents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No students in this session</div>
                      ) : (
                        <div className="space-y-3">
                          {sessionStudents.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                  {student.profilePicture ? (
                                    <img src={student.profilePicture} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-purple-200" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                      {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-gray-800">{student.firstName} {student.lastName}</div>
                                    <div className="text-sm text-gray-500">{student.registrationNumber}</div>
                                    <div className="text-xs text-gray-400">{student.email}</div>
                                  </div>
                                </div>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    student.paymentStatus === 'approved' 
                                      ? 'bg-green-100 text-green-800' 
                                      : student.paymentStatus === 'pending'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {student.paymentStatus === 'approved' ? '✓ Payment Verified' :
                                     student.paymentStatus === 'pending' ? '⏳ Payment Pending' : 'No Payment'}
                                  </span>
                                  {student.certificate ? (
                                    <div className="flex items-center gap-2">
                                      <span className="text-green-600 font-medium text-sm">✓ Certificate Uploaded</span>
                                      <button
                                        onClick={() => setSelectedStudentForCert(student.id)}
                                        className="text-blue-600 hover:underline text-sm"
                                      >
                                        Update
                                      </button>
                                    </div>
                                  ) : (
                                    <>
                                      {selectedStudentForCert === student.id ? (
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <input type="file" accept=".pdf,.jpg,.png" onChange={handleCertificateFileChange} className="text-sm border rounded px-2 py-1" />
                                          <button onClick={() => handleUploadCertificate(student.id)} disabled={!certificateFile} className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-green-700">Upload</button>
                                          <button onClick={() => { setSelectedStudentForCert(''); setCertificateFile(''); }} className="text-gray-500 text-sm hover:text-gray-700">Cancel</button>
                                        </div>
                                      ) : (
                                        <button onClick={() => setSelectedStudentForCert(student.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">📄 Upload Certificate</button>
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
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Payments Tab - Organized by Session */}
        {activeTab === 'payments' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow p-6 text-white">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">💳</span>
                Payment Verification
              </h2>
              <p className="text-green-200 mt-2">
                Review and verify student payments organized by session
              </p>
            </div>

            {sessions.filter(session => students.some(s => s.session === session.name)).length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessions.filter(session => students.some(s => s.session === session.name)).map((session) => {
                const sessionStudents = students.filter(s => 
                  s.session === session.name &&
                  (searchTerm === '' || 
                   s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                const pendingCount = sessionStudents.filter(s => s.paymentStatus === 'pending').length;
                const verifiedCount = sessionStudents.filter(s => s.paymentStatus === 'approved').length;
                
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">📅</span>
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{session.name}</h3>
                            <p className="text-sm text-gray-500">
                              {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''}
                              {pendingCount > 0 && <span className="text-yellow-600"> • {pendingCount} pending</span>}
                              {verifiedCount > 0 && <span className="text-green-600"> • {verifiedCount} verified</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            session.price === 'Free' || session.price === 'free' || session.price === '0'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {session.price === 'Free' || session.price === 'free' || session.price === '0' ? 'FREE' : session.price}
                          </span>
                          {pendingCount > 0 && (
                            <span className="bg-yellow-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                              {pendingCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      {sessionStudents.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No students in this session</div>
                      ) : (
                        <div className="space-y-3">
                          {sessionStudents.map((student) => (
                            <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center space-x-4">
                                  {student.profilePicture ? (
                                    <img src={student.profilePicture} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-green-200" />
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                      {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-semibold text-gray-800">{student.firstName} {student.lastName}</div>
                                    <div className="text-sm text-gray-500">{student.registrationNumber}</div>
                                    <div className="text-xs text-gray-400">{student.email}</div>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    student.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                    student.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    student.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {student.paymentStatus === 'approved' ? '✓ Verified' :
                                     student.paymentStatus === 'pending' ? '⏳ Pending' :
                                     student.paymentStatus === 'rejected' ? '✗ Rejected' : 'Not Submitted'}
                                  </span>
                                  {student.paymentReceipt && (
                                    <button onClick={() => setViewingReceipt(student.paymentReceipt || null)} className="text-blue-600 hover:underline text-sm">View Receipt</button>
                                  )}
                                  {student.paymentStatus === 'pending' && (
                                    <>
                                      <button onClick={() => { if (confirm(`Verify payment for ${student.firstName} ${student.lastName}? This will unlock their certificate.`)) { approvePayment(student.id); alert('Payment verified!'); } }} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition">✓ Verify</button>
                                      <button onClick={() => { if (confirm(`Reject payment for ${student.firstName} ${student.lastName}?`)) { rejectPayment(student.id); } }} className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition">Reject</button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Session Management</h2>
              <button
                onClick={() => {
                  setEditingSession(null);
                  setSessionForm({ name: '', startDate: '', endDate: '', status: 'upcoming', registrationStatus: 'closed', price: 'Free', description: '' });
                  setFacilitators([]);
                  setShowSessionModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Create Session
              </button>
            </div>

            <div className="grid gap-4">
              {sessions.map((session) => (
                <div key={session.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{session.name}</h3>
                      <p className="text-gray-500 text-sm">
                        {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                      </p>
                      {session.description && (
                        <p className="text-gray-600 mt-2">{session.description}</p>
                      )}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          session.registrationStatus === 'open' ? 'bg-green-100 text-green-800' :
                          session.registrationStatus === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          session.registrationStatus === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.registrationStatus.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          {session.price || 'Free'}
                        </span>
                      </div>
                      {session.facilitators && session.facilitators.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700">Facilitators:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {session.facilitators.map(f => (
                              <div key={f.id} className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                                {f.photo && (
                                  <img src={f.photo} alt={f.name} className="w-6 h-6 rounded-full object-cover" />
                                )}
                                <span className="text-sm">{f.name} ({f.role})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSession(session)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this session?')) {
                            deleteSession(session.id);
                          }
                        }}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Student Messages</h2>
            <div className="grid md:grid-cols-3 gap-4" style={{ height: '500px' }}>
              {/* Conversation List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 font-medium border-b">Conversations</div>
                <div className="overflow-y-auto" style={{ height: '450px' }}>
                  {getStudentsWithMessages().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No messages yet</div>
                  ) : (
                    getStudentsWithMessages().map((student) => {
                      const unread = getUnreadCount(student.id, 'admin');
                      return (
                        <button
                          key={student.id}
                          onClick={() => {
                            setSelectedConversation(student.id);
                            markMessagesAsRead(student.id, 'admin');
                          }}
                          className={`w-full p-3 text-left border-b hover:bg-gray-50 ${
                            selectedConversation === student.id ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {student.profilePicture ? (
                                <img src={student.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm">{student.firstName} {student.lastName}</div>
                                <div className="text-xs text-gray-500">{student.registrationNumber}</div>
                              </div>
                            </div>
                            {unread > 0 && (
                              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
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
              <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
                {selectedConversation ? (
                  <>
                    <div className="bg-gray-50 p-3 font-medium border-b">
                      {students.find(s => s.id === selectedConversation)?.firstName} {students.find(s => s.id === selectedConversation)?.lastName}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '350px' }}>
                      {getMessagesByStudent(selectedConversation).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-2 rounded-lg ${
                              msg.senderType === 'admin'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-800'
                            }`}
                          >
                            <p>{msg.content}</p>
                            <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-blue-200' : 'text-gray-500'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg px-3 py-2"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    Select a conversation to view messages
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Site Settings</h2>
            <div className="space-y-6 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Logo</label>
                <div className="flex items-center space-x-4">
                  {siteLogo ? (
                    <img src={siteLogo} alt="Logo" className="w-20 h-20 object-contain border rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 border rounded flex items-center justify-center text-gray-400">
                      No Logo
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="text-sm"
                  />
                </div>
              </div>
              
              {/* AI API Key Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">🤖</span> AI Assistant Configuration
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anthropic API Key
                  </label>
                  <input
                    type="password"
                    value={aiApiKey}
                    onChange={(e) => setAiApiKey(e.target.value)}
                    className="w-full border rounded-lg px-4 py-2 font-mono"
                    placeholder="sk-ant-api03-..."
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Get your API key from <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a>
                  </p>
                  {aiApiKey && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <span className="mr-2">✓</span> API key configured - AI Assistant is active for students
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSaveSettings}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* Code Editor Tab */}
        {activeTab === 'code' && (
          <div className="bg-white rounded-xl shadow overflow-hidden" style={{ height: '600px' }}>
            <div className="bg-gray-800 text-white px-4 py-3 flex items-center justify-between">
              <h2 className="font-bold flex items-center">
                <span className="mr-2">💻</span> Code Editor
              </h2>
              <div className="text-sm text-gray-400">
                View and edit site code (changes require manual deployment)
              </div>
            </div>
            <div style={{ height: 'calc(100% - 50px)' }}>
              <CodeEditor
                onSave={(path, content) => {
                  console.log('Saving file:', path, content.length);
                  alert(`Code changes saved locally. Note: To deploy changes, you need to rebuild the project.`);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Upload Material</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={materialForm.title}
                onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
              <textarea
                placeholder="Description"
                value={materialForm.description}
                onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
                rows={3}
              />
              <select
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="other">Other</option>
              </select>
              <select
                value={materialForm.targetSession}
                onChange={(e) => setMaterialForm({ ...materialForm, targetSession: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">All Sessions</option>
                {sessions.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
              <input
                type="file"
                onChange={handleMaterialFileChange}
                className="w-full"
              />
              {materialFileName && (
                <p className="text-sm text-gray-500">Selected: {materialFileName}</p>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowMaterialModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadMaterial}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-xl font-bold mb-4">{editingSession ? 'Edit Session' : 'Create Session'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Session Name"
                value={sessionForm.name}
                onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2"
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={sessionForm.startDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={sessionForm.endDate}
                    onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Session Status</label>
                  <select
                    value={sessionForm.status}
                    onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value as Session['status'] })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Registration Status</label>
                  <select
                    value={sessionForm.registrationStatus}
                    onChange={(e) => setSessionForm({ ...sessionForm, registrationStatus: e.target.value as Session['registrationStatus'] })}
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="closed">Closed</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="open">Open</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Price (Type "Free" or enter amount)</label>
                <input
                  type="text"
                  placeholder="e.g., Free or $50"
                  value={sessionForm.price}
                  onChange={(e) => setSessionForm({ ...sessionForm, price: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea
                  placeholder="Brief description about the session..."
                  value={sessionForm.description}
                  onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={3}
                />
              </div>

              {/* Facilitators */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Facilitators</label>
                <div className="space-y-3">
                  {facilitators.map((f) => (
                    <div key={f.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <div className="flex items-center space-x-2">
                        {f.photo && (
                          <img src={f.photo} alt={f.name} className="w-8 h-8 rounded-full object-cover" />
                        )}
                        <span>{f.name} - {f.role}</span>
                      </div>
                      <button
                        onClick={() => removeFacilitator(f.id)}
                        className="text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newFacilitator.name}
                      onChange={(e) => setNewFacilitator({ ...newFacilitator, name: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Role"
                      value={newFacilitator.role}
                      onChange={(e) => setNewFacilitator({ ...newFacilitator, role: e.target.value })}
                      className="border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFacilitatorPhotoChange}
                      className="text-xs"
                    />
                  </div>
                  {newFacilitator.photo && (
                    <img src={newFacilitator.photo} alt="Preview" className="w-12 h-12 rounded-full object-cover" />
                  )}
                  <button
                    onClick={addFacilitator}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    + Add Facilitator
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSessionModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSessionSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingSession ? 'Update Session' : 'Create Session'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Chat */}
      <GroupChat
        userId="admin"
        userName="Admin"
        userType="admin"
      />

      {/* Receipt Viewing Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h3 className="text-xl font-bold mb-4">Payment Receipt</h3>
            <div className="max-h-96 overflow-auto">
              {viewingReceipt.includes('application/pdf') ? (
                <iframe src={viewingReceipt} className="w-full h-96" />
              ) : (
                <img src={viewingReceipt} alt="Receipt" className="max-w-full" />
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
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

export default AdminPortal;
