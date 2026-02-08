import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import GroupChat from '../components/GroupChat';

const LeaderPortal: React.FC = () => {
  const navigate = useNavigate();
  const {
    auth,
    students,
    sessions,
    materials,
    isOnline,
    isSyncing
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'materials'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  // Get current student (leader) data
  const currentStudent = auth.currentStudent
    ? students.find(s => s.id === auth.currentStudent?.id) || auth.currentStudent
    : null;

  // Check if user is a leader
  useEffect(() => {
    if (!auth.isStudentLoggedIn || !currentStudent?.isLeader) {
      navigate('/student-portal');
    }
  }, [auth.isStudentLoggedIn, currentStudent, navigate]);

  // Get students in same session as leader
  const sessionStudents = students.filter(s => s.session === currentStudent?.session);

  // Filter students
  const filteredStudents = sessionStudents.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get session materials
  const sessionMaterials = materials.filter(m =>
    !m.targetSession || m.targetSession === '' || m.targetSession === currentStudent?.session
  );

  // Stats
  const stats = {
    totalStudents: sessionStudents.length,
    activeStudents: sessionStudents.filter(s => s.status === 'active').length,
    verifiedPayments: sessionStudents.filter(s => s.paymentStatus === 'approved').length,
    totalMaterials: sessionMaterials.length
  };

  if (!auth.isStudentLoggedIn || !currentStudent?.isLeader) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-500 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {currentStudent.profilePicture ? (
                <img
                  src={currentStudent.profilePicture}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-yellow-700 flex items-center justify-center text-xl font-bold border-2 border-white">
                  {currentStudent.firstName[0]}{currentStudent.lastName[0]}
                </div>
              )}
              <span className="absolute -top-1 -right-1 text-xl">⭐</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Leader Portal</h1>
              <p className="text-sm text-yellow-200">
                {currentStudent.firstName} {currentStudent.lastName} • {currentStudent.session}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              {isSyncing && <span className="animate-pulse">🔄</span>}
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-300' : 'bg-red-400'}`}></span>
            </div>
            <button
              onClick={() => navigate('/student-portal')}
              className="bg-yellow-700 hover:bg-yellow-800 px-4 py-2 rounded-lg transition"
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
            <div className="text-gray-500">Session Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-green-600">{stats.activeStudents}</div>
            <div className="text-gray-500">Active Students</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-purple-600">{stats.verifiedPayments}</div>
            <div className="text-gray-500">Verified Payments</div>
          </div>
          <div className="bg-white rounded-xl shadow p-4">
            <div className="text-3xl font-bold text-orange-600">{stats.totalMaterials}</div>
            <div className="text-gray-500">Materials</div>
          </div>
        </div>

        {/* Leader Info */}
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl">⭐</span>
            <div>
              <h2 className="text-xl font-bold">Welcome, Leader!</h2>
              <p className="text-yellow-100">
                As a session leader, you can view students in your session and help coordinate activities.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'overview'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'students'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            👥 Students ({sessionStudents.length})
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'materials'
                ? 'bg-yellow-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            📚 Materials
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Session Info */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Session Information</h3>
              {(() => {
                const session = sessions.find(s => s.name === currentStudent.session);
                return session ? (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Session Name</span>
                      <span className="font-medium">{session.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Start Date</span>
                      <span className="font-medium">{session.startDate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">End Date</span>
                      <span className="font-medium">{session.endDate}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-500">Status</span>
                      <span className={`font-medium capitalize ${
                        session.status === 'ongoing' ? 'text-green-600' :
                        session.status === 'upcoming' ? 'text-blue-600' :
                        'text-gray-600'
                      }`}>{session.status}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-500">Price</span>
                      <span className="font-medium text-green-600">{session.price}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Session information not available</p>
                );
              })()}
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-bold mb-4">Session Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">👥</span>
                    <span>Total Students</span>
                  </div>
                  <span className="font-bold text-blue-600">{stats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">✅</span>
                    <span>Verified Payments</span>
                  </div>
                  <span className="font-bold text-green-600">{stats.verifiedPayments}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">⏳</span>
                    <span>Pending Payments</span>
                  </div>
                  <span className="font-bold text-yellow-600">
                    {sessionStudents.filter(s => s.paymentStatus === 'pending').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🎓</span>
                    <span>Certificates Issued</span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {sessionStudents.filter(s => s.certificate).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Students in Your Session</h3>
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border rounded-lg px-4 py-2 w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Reg. No.</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Certificate</th>
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
                            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-bold">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                          )}
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                              {student.isLeader && <span className="ml-1 text-yellow-500">⭐</span>}
                            </div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{student.registrationNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          student.status === 'active' ? 'bg-green-100 text-green-800' :
                          student.status === 'graduated' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.paymentStatus === 'approved' ? 'bg-green-100 text-green-800' :
                          student.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          student.paymentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {student.paymentStatus === 'approved' ? '✓ Verified' :
                           student.paymentStatus === 'pending' ? 'Pending' :
                           student.paymentStatus === 'rejected' ? 'Rejected' :
                           'Not Submitted'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {student.certificate ? (
                          <span className="text-green-600">✓ Issued</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
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
            <h3 className="text-lg font-bold mb-4">Session Materials</h3>
            {sessionMaterials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <span className="text-6xl mb-4 block">📚</span>
                <p className="text-lg">No materials available yet</p>
                <p className="text-sm">Materials will appear here when uploaded by the coordinator</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {sessionMaterials.map((material) => (
                  <div key={material.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                    <div>
                      <h4 className="font-medium">{material.title}</h4>
                      <p className="text-sm text-gray-500">{material.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {material.fileName} • {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <a
                      href={material.fileData}
                      download={material.fileName}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderPortal;
