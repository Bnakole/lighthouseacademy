import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Material, Message } from '../types';
import AIChat from '../components/AIChat';
import GroupChat from '../components/GroupChat';

const StudentPortal: React.FC = () => {
  const navigate = useNavigate();
  const {
    auth,
    logoutStudent,
    students,
    materials,
    messages,
    sendMessage,
    getMessagesByStudent,
    markMessagesAsRead,
    getUnreadCount,
    updateProfilePicture,
    uploadPaymentReceipt,
    siteSettings,
    isOnline,
    isSyncing
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'materials' | 'payment' | 'certificate' | 'joinclass' | 'messages' | 'ai'>('profile');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get current student data from students array (for real-time updates)
  const currentStudent = auth.currentStudent 
    ? students.find(s => s.id === auth.currentStudent?.id) || auth.currentStudent
    : null;

  useEffect(() => {
    if (!auth.isStudentLoggedIn) {
      navigate('/student-login');
    }
  }, [auth.isStudentLoggedIn, navigate]);

  useEffect(() => {
    if (activeTab === 'messages' && currentStudent) {
      markMessagesAsRead(currentStudent.id, 'student');
    }
  }, [activeTab, currentStudent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleLogout = () => {
    logoutStudent();
    navigate('/');
  };

  // Profile photo handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePhoto = () => {
    if (newPhoto && currentStudent) {
      updateProfilePicture(currentStudent.registrationNumber, newPhoto);
      setShowPhotoModal(false);
      setNewPhoto(null);
    }
  };

  // Receipt upload handler
  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptFile(reader.result as string);
        setReceiptFileName(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReceipt = () => {
    if (receiptFile && currentStudent) {
      uploadPaymentReceipt(currentStudent.id, receiptFile);
      setReceiptFile(null);
      setReceiptFileName('');
      alert('Receipt uploaded successfully! Please wait for admin verification.');
    }
  };

  // Messages handler
  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentStudent) return;
    sendMessage(currentStudent.id, newMessage, 'student');
    setNewMessage('');
  };

  // Get student materials
  const studentMaterials = materials.filter((m: Material) => 
    !m.targetSession || m.targetSession === '' || m.targetSession === currentStudent?.session
  );

  // Get student messages
  const studentMessages = currentStudent ? getMessagesByStudent(currentStudent.id) : [];
  const unreadCount = currentStudent ? getUnreadCount(currentStudent.id, 'student') : 0;

  // Download file
  const downloadFile = (data: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!auth.isStudentLoggedIn || !currentStudent) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 text-white py-4 px-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowPhotoModal(true)} className="relative group">
              {currentStudent.profilePicture ? (
                <img 
                  src={currentStudent.profilePicture} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl font-bold border-2 border-white">
                  {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs">Edit</span>
              </div>
            </button>
            <div>
              <h1 className="text-lg font-bold">
                {currentStudent.firstName} {currentStudent.lastName}
                {currentStudent.isLeader && (
                  <button
                    onClick={() => navigate('/leader-portal')}
                    className="ml-2 text-yellow-300 hover:text-yellow-100 transition"
                  >
                    ⭐ Leader Portal →
                  </button>
                )}
              </h1>
              <p className="text-sm text-blue-200">{currentStudent.registrationNumber}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Sync status */}
            <div className="hidden md:flex items-center space-x-2 text-sm">
              {isSyncing && <span className="animate-pulse">🔄</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></span>
            </div>
            <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex overflow-x-auto space-x-4 py-3">
            {[
              { id: 'profile', label: 'Profile', icon: '👤' },
              { id: 'materials', label: 'Materials', icon: '📚' },
              { id: 'payment', label: 'Payment', icon: '💳' },
              { id: 'certificate', label: 'Certificate', icon: '🎓' },
              { id: 'joinclass', label: 'Join Class', icon: '🎯' },
              { id: 'messages', label: 'Messages', icon: '💬', badge: unreadCount },
              { id: 'ai', label: 'AI Assistant', icon: '🤖' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition relative ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Profile Information</h2>
              <div className="flex items-center space-x-4 mb-6">
                {currentStudent.profilePicture ? (
                  <img src={currentStudent.profilePicture} alt="Profile" className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                    {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold">{currentStudent.firstName} {currentStudent.lastName}</h3>
                  <p className="text-gray-500">{currentStudent.email}</p>
                  {currentStudent.emailConfirmed && (
                    <span className="text-green-600 text-sm">✓ Email Verified</span>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Registration Number</span>
                  <span className="font-medium">{currentStudent.registrationNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{currentStudent.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Gender</span>
                      <span className="font-medium capitalize">{currentStudent.gender}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Drama Group</span>
                      <span className="font-medium">{currentStudent.dramaGroup || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Position</span>
                      <span className="font-medium">{currentStudent.position || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Country</span>
                      <span className="font-medium">{currentStudent.country || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">State</span>
                      <span className="font-medium">{currentStudent.state || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Program</span>
                      <span className="font-medium">{currentStudent.program}</span>
                    </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Session</span>
                  <span className="font-medium">{currentStudent.session}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-medium capitalize ${
                    currentStudent.status === 'active' ? 'text-green-600' :
                    currentStudent.status === 'graduated' ? 'text-blue-600' :
                    'text-gray-600'
                  }`}>{currentStudent.status}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">Registered</span>
                  <span className="font-medium">{new Date(currentStudent.registeredAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Statement of Purpose */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Statement of Purpose</h2>
              <p className="text-gray-600 leading-relaxed">{currentStudent.address}</p>
            </div>
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Learning Materials</h2>
            {studentMaterials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-4xl mb-4 block">📚</span>
                <p>No materials available yet. Check back later!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {studentMaterials.map((material: Material) => (
                  <div key={material.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <h3 className="font-medium">{material.title}</h3>
                      <p className="text-sm text-gray-500">{material.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {material.fileName} • {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => downloadFile(material.fileData, material.fileName)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {activeTab === 'payment' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Payment</h2>
            
            {/* Payment Status */}
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                currentStudent.paymentStatus === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentStudent.paymentStatus === 'approved' ? '✓ Verified' : '✗ Not Verified'}
              </div>
            </div>

            {/* Payment Status Messages */}
            {currentStudent.paymentStatus === 'approved' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-medium">✓ Your payment has been verified! You can now download your certificate.</p>
              </div>
            )}

            {currentStudent.paymentStatus === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium">⏳ Payment receipt submitted. Awaiting admin verification.</p>
              </div>
            )}

            {currentStudent.paymentStatus === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium">✗ Payment rejected. Please upload a valid receipt.</p>
              </div>
            )}

            {/* Upload Receipt Section */}
            {currentStudent.paymentStatus !== 'approved' && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-3">Upload Payment Receipt</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {receiptFile ? (
                    <div>
                      <p className="text-green-600 font-medium mb-2">✓ {receiptFileName}</p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={handleUploadReceipt}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                        >
                          Submit Receipt
                        </button>
                        <button
                          onClick={() => { setReceiptFile(null); setReceiptFileName(''); }}
                          className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span className="text-4xl mb-3 block">📤</span>
                      <label className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block">
                          Upload Receipt Here
                        </span>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-sm text-gray-500 mt-2">Accepts images (JPG, PNG) or PDF. Max 10MB</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bank Account Details */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">💳 Bank Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-green-400">
                  <span className="opacity-80">Bank</span>
                  <span className="font-bold text-xl">Opay</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-green-400">
                  <span className="opacity-80">Account Number</span>
                  <span className="font-bold text-xl tracking-wider">8080498742</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="opacity-80">Account Name</span>
                  <span className="font-bold text-lg">Light House Academy</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Certificate Tab */}
        {activeTab === 'certificate' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Certificate</h2>
            
            {/* Verification Status */}
            <div className="mb-6">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${
                currentStudent.paymentStatus === 'approved' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentStudent.paymentStatus === 'approved' ? '✓ Verified' : '✗ Not Verified'}
              </div>
            </div>

            {/* Certificate Content */}
            {!currentStudent.certificate ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <span className="text-6xl mb-4 block">🎓</span>
                <h3 className="text-xl font-bold text-gray-700 mb-2">Certificate Not Yet Available</h3>
                <p className="text-gray-500">Please try again later.</p>
              </div>
            ) : currentStudent.paymentStatus !== 'approved' ? (
              <div className="text-center py-12 bg-yellow-50 rounded-lg">
                <span className="text-6xl mb-4 block">🔒</span>
                <h3 className="text-xl font-bold text-yellow-700 mb-2">Certificate Locked</h3>
                <p className="text-yellow-600 mb-4">Please complete payment verification to unlock your certificate.</p>
                <button
                  onClick={() => setActiveTab('payment')}
                  className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
                >
                  Go to Payment
                </button>
              </div>
            ) : (
              <div className="text-center py-12 bg-green-50 rounded-lg">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <span className="text-4xl">🎉</span>
                </div>
                <h3 className="text-2xl font-bold text-green-700 mb-2">Congratulations!</h3>
                <p className="text-green-600 mb-6">Your certificate is ready for download.</p>
                <button
                  onClick={() => downloadFile(currentStudent.certificate!, `Certificate_${currentStudent.registrationNumber}.pdf`)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-green-600 hover:to-emerald-700 shadow-lg"
                >
                  📥 Download Certificate Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Join Class Tab */}
        {activeTab === 'joinclass' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Join Class</h2>
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 text-white text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <h3 className="text-2xl font-bold mb-4">Join Our Training Group</h3>
              <div className="bg-white/20 rounded-lg p-4 mb-6">
                <p className="text-lg">
                  The training will take place on a closed WhatsApp group.
                </p>
              </div>
              <a
                href="https://t.me/+k7GOXSYPzYozNjM0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue-50 transition-colors shadow-lg"
              >
                🚀 Join Now
              </a>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: '500px' }}>
            <div className="bg-blue-600 text-white p-4">
              <h2 className="font-bold">Chat with Admin</h2>
            </div>
            
            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '380px' }}>
              {studentMessages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <span className="text-4xl mb-4 block">💬</span>
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                studentMessages.map((msg: Message) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.senderType === 'student' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.senderType === 'student'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.senderType === 'student' ? 'text-blue-200' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendMessage}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* AI Assistant Tab */}
        {activeTab === 'ai' && (
          <div className="max-w-3xl mx-auto">
            {siteSettings.aiApiKey ? (
              <AIChat
                apiKey={siteSettings.aiApiKey}
                studentName={`${currentStudent.firstName} ${currentStudent.lastName}`}
                studentProgram={currentStudent.program}
                studentSession={currentStudent.session}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🤖</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">AI Assistant Coming Soon!</h2>
                <p className="text-gray-600 mb-6">
                  The AI learning assistant is being configured by the administrator. 
                  Please check back later or contact support for assistance.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Tip:</strong> In the meantime, you can use the Messages tab 
                    to chat with the Student Coordinator for any questions.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Group Chat */}
      <GroupChat
        userId={currentStudent.id}
        userName={`${currentStudent.firstName} ${currentStudent.lastName}`}
        userType={currentStudent.isLeader ? 'leader' : 'student'}
        userPhoto={currentStudent.profilePicture}
      />

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Update Profile Photo</h3>
            <div className="flex justify-center mb-4">
              {newPhoto || currentStudent.profilePicture ? (
                <img 
                  src={newPhoto || currentStudent.profilePicture} 
                  alt="Preview" 
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600">
                  {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                </div>
              )}
            </div>
            <div className="flex justify-center mb-4">
              <label className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setShowPhotoModal(false); setNewPhoto(null); }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePhoto}
                disabled={!newPhoto}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPortal;
