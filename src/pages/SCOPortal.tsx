import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GroupChat from '../components/GroupChat';

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
    isSyncing
  } = useApp();

  const [activeTab, setActiveTab] = useState<'materials' | 'messages'>('materials');
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

  // Check if user has access
  useEffect(() => {
    const role = localStorage.getItem('lha_staff_role');
    if (role !== 'sco' && role !== 'admin') {
      navigate('/admin-login');
    }
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedConversation]);

  const handleLogout = () => {
    localStorage.removeItem('lha_staff_role');
    navigate('/admin-login');
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

  // Get all students for messaging (show all students, not just those with messages)
  const getAllStudentsForMessaging = () => {
    return students.sort((a, b) => {
      // Sort by those with unread messages first
      const aUnread = getUnreadCount(a.id, 'admin');
      const bUnread = getUnreadCount(b.id, 'admin');
      if (aUnread !== bUnread) return bUnread - aUnread;
      // Then by name
      return a.firstName.localeCompare(b.firstName);
    });
  };

  const getTotalUnreadForAdmin = () => {
    return students.reduce((total, student) => total + getUnreadCount(student.id, 'admin'), 0);
  };

  // Filter students for messages
  const filteredStudents = getAllStudentsForMessaging().filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-500 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-white p-2 rounded-lg">
              <span className="text-2xl">👨‍🏫</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">SCO Portal</h1>
              <p className="text-sm text-green-200">Student Coordinator - Materials & Messages</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              {isSyncing && <span className="animate-pulse">🔄</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-red-400'}`}></span>
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
            <div className="text-3xl font-bold text-blue-600">{students.length}</div>
            <div className="text-gray-500">Total Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-green-600">{materials.length}</div>
            <div className="text-gray-500">Materials</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-purple-600">{getTotalUnreadForAdmin()}</div>
            <div className="text-gray-500">Unread Messages</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{sessions.length}</div>
            <div className="text-gray-500">Sessions</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'materials'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📚 Materials
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`px-6 py-3 rounded-lg font-medium transition relative ${
              activeTab === 'messages'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            💬 Messages
            {getTotalUnreadForAdmin() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {getTotalUnreadForAdmin()}
              </span>
            )}
          </button>
        </div>

        {/* Materials Tab */}
        {activeTab === 'materials' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Learning Materials</h2>
              <button
                onClick={() => setShowMaterialModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                + Upload Material
              </button>
            </div>

            <div className="grid gap-4">
              {materials.map((material) => (
                <div key={material.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-gray-500">{material.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {material.fileName} • {(material.fileSize / 1024 / 1024).toFixed(2)} MB • {new Date(material.uploadedAt).toLocaleDateString()}
                    </p>
                    {material.targetSession && (
                      <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
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
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl mb-4 block">📚</span>
                  <p>No materials uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold mb-4">Student Messages</h2>
            
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 border rounded-lg px-4 py-2"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4" style={{ height: '500px' }}>
              {/* Conversation List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-50 p-3 font-medium border-b">
                  All Students ({students.length})
                </div>
                <div className="overflow-y-auto" style={{ height: '450px' }}>
                  {filteredStudents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No students found</div>
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
                          className={`w-full p-3 text-left border-b hover:bg-gray-50 ${
                            selectedConversation === student.id ? 'bg-green-50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {student.profilePicture ? (
                                <img src={student.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                                  {student.firstName[0]}{student.lastName[0]}
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-sm">
                                  {student.firstName} {student.lastName}
                                  {student.isLeader && <span className="ml-1 text-yellow-500">⭐</span>}
                                </div>
                                <div className="text-xs text-gray-500">{student.registrationNumber}</div>
                                {!hasMessages && (
                                  <div className="text-xs text-gray-400">No messages yet</div>
                                )}
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
                    <div className="bg-green-50 p-3 font-medium border-b flex items-center space-x-3">
                      {(() => {
                        const student = students.find(s => s.id === selectedConversation);
                        return student ? (
                          <>
                            {student.profilePicture ? (
                              <img src={student.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center text-green-700 text-sm font-bold">
                                {student.firstName[0]}{student.lastName[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                            </div>
                          </>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: '350px' }}>
                      {getMessagesByStudent(selectedConversation).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <span className="text-4xl mb-4 block">💬</span>
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        getMessagesByStudent(selectedConversation).map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs px-4 py-2 rounded-lg ${
                                msg.senderType === 'admin'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${msg.senderType === 'admin' ? 'text-green-200' : 'text-gray-500'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      <div ref={messagesEndRef} />
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
                        disabled={!newMessage.trim()}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        Send
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
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
      </div>

      {/* Group Chat */}
      <GroupChat
        userId="sco"
        userName="Student Coordinator"
        userType="sco"
      />

      {/* Material Upload Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4">Upload Material</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title *"
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  onChange={handleMaterialFileChange}
                  className="w-full"
                />
                {materialFileName && (
                  <p className="text-sm text-green-600 mt-2">✓ {materialFileName}</p>
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
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadMaterial}
                disabled={!materialForm.title || !materialFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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
