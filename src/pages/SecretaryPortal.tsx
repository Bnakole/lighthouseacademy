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
    isSyncing
  } = useApp();

  const [activeTab, setActiveTab] = useState<'certificates' | 'payments'>('certificates');
  const [searchTerm, setSearchTerm] = useState('');
  const [certificateFile, setCertificateFile] = useState<string>('');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<string>('');
  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);
  const [expandedSessions, setExpandedSessions] = useState<string[]>([]);

  // Check if user has access
  useEffect(() => {
    const role = localStorage.getItem('lha_staff_role');
    if (role !== 'secretary' && role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('lha_staff_role');
    navigate('/admin-login');
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-800 to-purple-600 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Secretary Portal</h1>
              <p className="text-sm text-purple-200">Certificates & Payments Management</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              {isSyncing && <span className="animate-pulse">🔄</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
            </div>
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
            <div className="text-3xl font-bold text-blue-600">{totalStudents}</div>
            <div className="text-gray-500">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-green-600">{certificatesIssued}</div>
            <div className="text-gray-500">Certificates Issued</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-yellow-600">{pendingPaymentsCount}</div>
            <div className="text-gray-500">Pending Payments</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-purple-600">{verifiedPayments}</div>
            <div className="text-gray-500">Verified Payments</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'certificates'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            🎓 Upload Certificate
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3 rounded-lg font-medium transition relative ${
              activeTab === 'payments'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            💳 Payments
            {pendingPaymentsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {pendingPaymentsCount}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search students by name or registration number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 border rounded-lg px-4 py-2"
          />
        </div>

        {/* Certificates Tab - Organized by Session */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow p-6 text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🎓</span>
                Upload Certificate
              </h2>
              <p className="text-purple-200 mt-2">
                Organize and upload certificates for students by their registered sessions
              </p>
            </div>

            {sessionsWithStudents.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessionsWithStudents.map((session) => {
                const sessionStudents = getStudentsBySession(session.name);
                const isExpanded = expandedSessions.includes(session.id);
                const certificateCount = sessionStudents.filter(s => s.certificate).length;
                
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow overflow-hidden">
                    {/* Session Header */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📅</span>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-gray-800">{session.name}</h3>
                          <p className="text-sm text-gray-500">
                            {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''} registered
                            {' • '}
                            {certificateCount} certificate{certificateCount !== 1 ? 's' : ''} issued
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          session.price === 'Free' || session.price === 'free' || session.price === '0'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {session.price === 'Free' || session.price === 'free' || session.price === '0' ? 'FREE' : session.price}
                        </span>
                        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Session Students */}
                    {isExpanded && (
                      <div className="p-4 border-t">
                        {sessionStudents.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            No students match your search in this session
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sessionStudents.map((student) => (
                              <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  {/* Student Info */}
                                  <div className="flex items-center space-x-4">
                                    {student.profilePicture ? (
                                      <img 
                                        src={student.profilePicture} 
                                        alt="" 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-purple-200" 
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                                        {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-gray-800">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {student.registrationNumber}
                                      </div>
                                      <div className="text-xs text-gray-400">
                                        {student.email}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment & Certificate Status */}
                                  <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                                    {/* Payment Status */}
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      student.paymentStatus === 'approved' 
                                        ? 'bg-green-100 text-green-800' 
                                        : student.paymentStatus === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : student.paymentStatus === 'rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {student.paymentStatus === 'approved' ? '✓ Payment Verified' :
                                       student.paymentStatus === 'pending' ? '⏳ Payment Pending' :
                                       student.paymentStatus === 'rejected' ? '✗ Payment Rejected' :
                                       'No Payment'}
                                    </span>

                                    {/* Certificate Actions */}
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
                                            <input
                                              type="file"
                                              accept=".pdf,.jpg,.png"
                                              onChange={handleCertificateFileChange}
                                              className="text-sm border rounded px-2 py-1"
                                            />
                                            <button
                                              onClick={() => handleUploadCertificate(student.id)}
                                              disabled={!certificateFile}
                                              className="bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50 hover:bg-green-700"
                                            >
                                              Upload
                                            </button>
                                            <button
                                              onClick={() => {
                                                setSelectedStudentForCert('');
                                                setCertificateFile('');
                                              }}
                                              className="text-gray-500 text-sm hover:text-gray-700"
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={() => setSelectedStudentForCert(student.id)}
                                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
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
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow p-6 text-white mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">💳</span>
                Payment Verification
              </h2>
              <p className="text-green-200 mt-2">
                Review and verify student payments by their registered sessions
              </p>
            </div>

            {sessionsWithStudents.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📭</span>
                No students registered yet
              </div>
            ) : (
              sessionsWithStudents.map((session) => {
                const sessionStudents = getStudentsBySession(session.name);
                const isExpanded = expandedSessions.includes(session.id);
                const pendingCount = sessionStudents.filter(s => s.paymentStatus === 'pending').length;
                const verifiedCount = sessionStudents.filter(s => s.paymentStatus === 'approved').length;
                
                return (
                  <div key={session.id} className="bg-white rounded-xl shadow overflow-hidden">
                    {/* Session Header */}
                    <button
                      onClick={() => toggleSession(session.id)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">📅</span>
                        <div className="text-left">
                          <h3 className="font-bold text-lg text-gray-800">{session.name}</h3>
                          <p className="text-sm text-gray-500">
                            {sessionStudents.length} student{sessionStudents.length !== 1 ? 's' : ''}
                            {pendingCount > 0 && <span className="text-yellow-600"> • {pendingCount} pending</span>}
                            {verifiedCount > 0 && <span className="text-green-600"> • {verifiedCount} verified</span>}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
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
                        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          ▼
                        </span>
                      </div>
                    </button>

                    {/* Session Students */}
                    {isExpanded && (
                      <div className="p-4 border-t">
                        {sessionStudents.length === 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            No students match your search in this session
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {sessionStudents.map((student) => (
                              <div key={student.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                  {/* Student Info */}
                                  <div className="flex items-center space-x-4">
                                    {student.profilePicture ? (
                                      <img 
                                        src={student.profilePicture} 
                                        alt="" 
                                        className="w-14 h-14 rounded-full object-cover border-2 border-green-200" 
                                      />
                                    ) : (
                                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-lg">
                                        {student.firstName[0]}{student.lastName[0]}
                                      </div>
                                    )}
                                    <div>
                                      <div className="font-semibold text-gray-800">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        {student.registrationNumber}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Payment Actions */}
                                  <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Badge */}
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                      student.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                                      student.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                      student.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-600'
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
                                        className="text-blue-600 hover:underline text-sm"
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
                                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
                                        >
                                          ✓ Verify
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm(`Reject payment for ${student.firstName} ${student.lastName}?`)) {
                                              rejectPayment(student.id);
                                            }
                                          }}
                                          className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition"
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
      <GroupChat
        userId="secretary"
        userName="Secretary"
        currentUserType="secretary"
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

export default SecretaryPortal;
