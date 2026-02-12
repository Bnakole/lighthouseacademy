import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, saveStudents, getSessions, saveSessions, getMaterials, saveMaterials, getSessionRegistrations, saveSessionRegistrations, getStaffProfiles, saveStaffProfiles, getSiteSettings, saveSiteSettings, getChatMessages, saveChatMessages, fileToBase64 } from '../store';
import type { AcademySession, Student } from '../store';
import { LogOut, X, Send, MessageCircle, Download, Eye, Plus, Settings, Users, BookOpen, Award, CreditCard, Crown, Mic, Image, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function AdminPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [refresh, setRefresh] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sessionStorage.getItem('lha_admin_role') !== 'admin') navigate('/admin-login');
  }, [navigate]);

  const doRefresh = () => setRefresh(r => r + 1);
  void refresh;

  const students = getStudents();
  const sessions = getSessions();
  const materials = getMaterials();
  const regs = getSessionRegistrations();
  const staff = getStaffProfiles();
  const settings = getSiteSettings();

  const [newSession, setNewSession] = useState<Partial<AcademySession>>({ name: '', description: '', price: 'Free', status: 'upcoming', facilitatorName: '', facilitatorImage: '' });

  const addSession = () => {
    try {
      if (!newSession.name) return;
      const s: AcademySession = {
        id: uuidv4(),
        name: newSession.name || '',
        description: newSession.description || '',
        price: newSession.price || 'Free',
        status: (newSession.status as AcademySession['status']) || 'upcoming',
        facilitatorName: newSession.facilitatorName || '',
        facilitatorImage: newSession.facilitatorImage || '',
        createdAt: new Date().toISOString()
      };
      const all = getSessions();
      all.push(s);
      saveSessions(all);
      setNewSession({ name: '', description: '', price: 'Free', status: 'upcoming', facilitatorName: '', facilitatorImage: '' });
      doRefresh();
    } catch (error) {
      console.error('Error adding session:', error);
      alert('Error creating session. Please try again.');
    }
  };

  const updateSessionStatus = (id: string, status: AcademySession['status']) => {
    try {
      const all = getSessions();
      const s = all.find(x => x.id === id);
      if (s) {
        s.status = status;
        saveSessions(all);
        doRefresh();
      }
    } catch (error) {
      console.error('Error updating session status:', error);
      alert('Error updating session status. Please try again.');
    }
  };
  
  const updateSessionPrice = (id: string, price: string) => {
    try {
      const all = getSessions();
      const s = all.find(x => x.id === id);
      if (s) {
        s.price = price;
        saveSessions(all);
        doRefresh();
      }
    } catch (error) {
      console.error('Error updating session price:', error);
      alert('Error updating session price. Please try again.');
    }
  };

  const uploadMaterial = async (sessionId: string, file: File) => {
    const data = await fileToBase64(file);
    const all = getMaterials(); all.push({ id: uuidv4(), name: file.name, fileData: data, uploadedAt: new Date().toISOString(), sessionId }); saveMaterials(all); doRefresh();
  };

  const uploadCertificate = async (studentId: string, sessionId: string, file: File) => {
    const data = await fileToBase64(file);
    const allRegs = getSessionRegistrations(); const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId);
    if (reg) { reg.certificateFile = data; saveSessionRegistrations(allRegs); doRefresh(); }
  };

  const unlockCertificate = (studentId: string, sessionId: string) => {
    try {
      const allRegs = getSessionRegistrations();
      const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId);
      if (reg) {
        reg.certificateUnlocked = true;
        saveSessionRegistrations(allRegs);
        doRefresh();
      }
    } catch (error) {
      console.error('Error unlocking certificate:', error);
      alert('Error unlocking certificate. Please try again.');
    }
  };
  const verifyPayment = (studentId: string, sessionId: string) => {
    try {
      const allRegs = getSessionRegistrations();
      const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId);
      if (reg) {
        reg.paymentVerified = true;
        saveSessionRegistrations(allRegs);
        
        // Also update student payment status
        const allStudents = getStudents();
        const student = allStudents.find(s => s.id === studentId);
        if (student) {
          student.paymentStatus = 'verified';
          saveStudents(allStudents);
        }
        doRefresh();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      alert('Error verifying payment. Please try again.');
    }
  };
  
  const approveRegistration = (studentId: string) => {
    try {
      const all = getStudents();
      const student = all.find(s => s.id === studentId);
      if (student) {
        student.registrationApproved = true;
        student.approvedBy = 'Admin';
        student.approvedAt = new Date().toISOString();
        // Auto-verify payment for free sessions
        const studentSessions = sessions.filter(s => student.sessions.includes(s.id));
        if (studentSessions.every(s => s.price === 'Free')) {
          student.paymentStatus = 'verified';
        }
        saveStudents(all);
        doRefresh();
      }
    } catch (error) {
      console.error('Error approving registration:', error);
      alert('Error approving registration. Please try again.');
    }
  };
  
  const rejectRegistration = (studentId: string) => {
    try {
      const all = getStudents();
      const student = all.find(s => s.id === studentId);
      if (student) {
        student.registrationApproved = false;
        saveStudents(all);
        doRefresh();
      }
    } catch (error) {
      console.error('Error rejecting registration:', error);
      alert('Error rejecting registration. Please try again.');
    }
  };
  
  const toggleLeader = (studentId: string) => {
    try {
      const all = getStudents();
      const s = all.find(x => x.id === studentId);
      if (s) {
        s.isLeader = !s.isLeader;
        saveStudents(all);
        doRefresh();
      }
    } catch (error) {
      console.error('Error toggling leader status:', error);
      alert('Error updating leader status. Please try again.');
    }
  };

  const [siteName, setSiteName] = useState(settings.siteName);
  const saveName = () => { saveSiteSettings({ ...getSiteSettings(), siteName }); doRefresh(); };
  const uploadLogo = async (file: File) => { const data = await fileToBase64(file); saveSiteSettings({ ...getSiteSettings(), logo: data }); doRefresh(); };

  const [editingStaff, setEditingStaff] = useState<number | null>(null);

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msgs = getChatMessages(); const adminStaff = staff.find(s => s.role === 'Admin');
    msgs.push({ id: uuidv4(), senderId: 'admin', senderName: adminStaff?.name || 'Admin', senderRole: 'admin', senderAvatar: adminStaff?.picture || '', content: chatMsg.trim(), type: 'text', timestamp: new Date().toISOString(), deleted: false, edited: false });
    saveChatMessages(msgs); setChatMsg('');
  };

  const sendVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const f = new File([blob], 'voice.webm');
        const data = await fileToBase64(f);
        const msgs = getChatMessages(); const adminStaff = staff.find(s => s.role === 'Admin');
        msgs.push({ id: uuidv4(), senderId: 'admin', senderName: adminStaff?.name || 'Admin', senderRole: 'admin', senderAvatar: adminStaff?.picture || '', content: 'Voice Message', type: 'voice', fileData: data, fileName: 'voice.webm', timestamp: new Date().toISOString(), deleted: false, edited: false });
        saveChatMessages(msgs);
      };
      recorder.start(); setTimeout(() => recorder.stop(), 10000);
      alert('Recording... will stop after 10 seconds.');
    } catch { alert('Microphone access denied'); }
  };

  const chatMessages = getChatMessages().filter(m => !m.deleted);
  const pendingStudents = students.filter(s => !s.registrationApproved);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Crown size={15} /> },
    { id: 'approvals', label: `Approvals${pendingStudents.length > 0 ? ` (${pendingStudents.length})` : ''}`, icon: <CheckCircle size={15} /> },
    { id: 'sessions', label: 'Sessions', icon: <Plus size={15} /> },
    { id: 'students', label: 'Students', icon: <Users size={15} /> },
    { id: 'materials', label: 'Materials', icon: <BookOpen size={15} /> },
    { id: 'certificates', label: 'Certificates', icon: <Award size={15} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={15} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={15} /> },
    { id: 'staff', label: 'Staff', icon: <Users size={15} /> },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card-premium overflow-hidden mb-6">
        <div className="gradient-gold p-6 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
                <Crown size={28} className="text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-primary-dark">Admin Portal</h1>
                <p className="text-primary-dark/50 text-sm">Full access to all features</p>
              </div>
            </div>
            <button onClick={() => { sessionStorage.removeItem('lha_admin_role'); navigate('/admin-login'); }}
              className="flex items-center gap-2 text-primary-dark/60 hover:text-red-700 text-sm font-semibold bg-white/30 px-4 py-2 rounded-xl transition">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`tab-btn ${tab === t.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div className="card-premium p-6 md:p-8">
        {tab === 'approvals' && (
          <div className="space-y-4 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2">
              <CheckCircle size={20} className="text-emerald-500" /> Registration Approvals
            </h2>
            {pendingStudents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400">No pending registrations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingStudents.map(s => {
                  const studentSessions = sessions.filter(sess => s.sessions.includes(sess.id));
                  const hasPaidSession = studentSessions.some(sess => sess.price !== 'Free');
                  return (
                    <div key={s.id} className="card-premium p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {s.passport ? (
                            <img src={s.passport} alt="" className="w-14 h-14 rounded-full object-cover avatar" />
                          ) : (
                            <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                              {s.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{s.fullName}</h3>
                            <p className="text-sm text-gray-500">{s.email}</p>
                            <p className="text-xs text-gray-400 mt-1">Phone: {s.phone}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="badge badge-info text-xs">
                                {s.dramaGroup || 'No group'} - {s.position}
                              </span>
                              <span className="badge badge-gold text-xs">
                                {s.country}, {s.state}
                              </span>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-gray-600 mb-1">Sessions:</p>
                              <div className="flex flex-wrap gap-1">
                                {studentSessions.map(sess => (
                                  <span key={sess.id} className="badge badge-info text-xs">
                                    {sess.name} ({sess.price})
                                  </span>
                                ))}
                              </div>
                            </div>
                            {hasPaidSession && s.paymentReceipt && (
                              <div className="mt-3">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Payment Receipt:</p>
                                {s.paymentReceipt.startsWith('data:image') ? (
                                  <img src={s.paymentReceipt} alt="Receipt" className="max-w-[200px] rounded-lg border shadow-sm" />
                                ) : (
                                  <a href={s.paymentReceipt} download="receipt.pdf" className="text-indigo-500 text-sm flex items-center gap-1">
                                    <Download size={13} /> Download PDF
                                  </a>
                                )}
                                <span className={`badge mt-2 ${s.paymentStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                                  Payment: {s.paymentStatus === 'verified' ? 'Verified' : 'Unverified'}
                                </span>
                              </div>
                            )}
                            {!hasPaidSession && (
                              <div className="mt-3">
                                <span className="badge badge-success text-xs">Free Session - No Payment Required</span>
                              </div>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Registered: {new Date(s.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => approveRegistration(s.id)}
                            className="btn-success text-sm py-2 px-4 flex items-center gap-1"
                          >
                            <CheckCircle size={16} /> Approve
                          </button>
                          <button
                            onClick={() => rejectRegistration(s.id)}
                            className="btn-primary bg-red-500 hover:bg-red-600 text-sm py-2 px-4 flex items-center gap-1"
                          >
                            <XCircle size={16} /> Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 slide-up">
            {[
              { label: 'Students', value: students.length, gradient: 'from-blue-500 to-blue-600', icon: <Users size={22} /> },
              { label: 'Sessions', value: sessions.length, gradient: 'from-emerald-500 to-emerald-600', icon: <BookOpen size={22} /> },
              { label: 'Materials', value: materials.length, gradient: 'from-violet-500 to-violet-600', icon: <BookOpen size={22} /> },
              { label: 'Receipts', value: regs.filter(r => r.paymentReceipt).length, gradient: 'from-amber-500 to-amber-600', icon: <CreditCard size={22} /> },
            ].map((s, i) => (
              <div key={i} className={`stat-card bg-gradient-to-br ${s.gradient} text-white stagger-${i+1}`}>
                <div className="mb-2 opacity-80">{s.icon}</div>
                <div className="text-3xl font-extrabold">{s.value}</div>
                <div className="text-sm text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {tab === 'sessions' && (
          <div className="space-y-6 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Plus size={20} className="text-indigo-500" /> Manage Sessions</h2>
            <div className="card-premium p-5 bg-gray-50/50 space-y-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2"><Plus size={16} /> Create New Session</h3>
              <input placeholder="Session Name" value={newSession.name || ''} onChange={e => setNewSession(s => ({ ...s, name: e.target.value }))} className="input-premium" />
              <textarea placeholder="Description" value={newSession.description || ''} onChange={e => setNewSession(s => ({ ...s, description: e.target.value }))} className="input-premium" rows={2} />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Price (Free or ₦5000)" value={newSession.price || ''} onChange={e => setNewSession(s => ({ ...s, price: e.target.value }))} className="input-premium" />
                <select value={newSession.status || 'upcoming'} onChange={e => setNewSession(s => ({ ...s, status: e.target.value as AcademySession['status'] }))} className="select-premium">
                  <option value="upcoming">Upcoming</option><option value="open">Open</option><option value="ongoing">Ongoing</option><option value="closed">Closed</option>
                </select>
              </div>
              <input placeholder="Facilitator Name" value={newSession.facilitatorName || ''} onChange={e => setNewSession(s => ({ ...s, facilitatorName: e.target.value }))} className="input-premium" />
              <div>
                <label className="text-sm text-gray-500 font-medium flex items-center gap-1 mb-1"><Image size={13} /> Facilitator Image</label>
                <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { const d = await fileToBase64(f); setNewSession(s => ({ ...s, facilitatorImage: d })); } }} className="text-sm" />
              </div>
              <button onClick={addSession} className="btn-primary flex items-center gap-2"><Plus size={16} /> Create Session</button>
            </div>

            <div className="space-y-3">
              {sessions.map(s => (
                <div key={s.id} className="card-premium p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800">{s.name}</h3>
                    <p className="text-sm text-gray-400">{s.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-gold">{s.price}</span>
                      <span className={`badge ${s.status === 'open' ? 'badge-success' : s.status === 'ongoing' ? 'badge-info' : s.status === 'upcoming' ? 'badge-warning' : 'badge-danger'}`}>{s.status.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input value={s.price} onChange={e => updateSessionPrice(s.id, e.target.value)} className="input-premium text-sm w-28 py-2" placeholder="Price" />
                    <select value={s.status} onChange={e => updateSessionStatus(s.id, e.target.value as AcademySession['status'])} className="select-premium text-sm w-32 py-2">
                      <option value="upcoming">Upcoming</option><option value="open">Open</option><option value="ongoing">Ongoing</option><option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'students' && (
          <div className="slide-up space-y-6">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-indigo-500" /> 
              Approved Students ({students.filter(s => s.registrationApproved).length})
            </h2>
            
            {/* Organize students by session */}
            {sessions.map(session => {
              const sessionStudents = students.filter(s => 
                s.registrationApproved && s.sessions?.includes(session.id)
              );
              
              if (sessionStudents.length === 0) return null;
              
              return (
                <div key={session.id} className="card-premium p-6">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-emerald-500" />
                    {session.name}
                    <span className="badge badge-info ml-2">{sessionStudents.length} students</span>
                  </h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="table-premium">
                      <thead>
                        <tr>
                          <th>Photo</th>
                          <th>Name</th>
                          <th>Reg#</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Leader</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sessionStudents.map(s => (
                          <tr key={s.id}>
                            <td>
                              {s.passport ? (
                                <img src={s.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" />
                              ) : (
                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                                  {s.fullName.charAt(0)}
                                </div>
                              )}
                            </td>
                            <td className="font-semibold text-gray-700">{s.fullName}</td>
                            <td className="font-mono text-xs text-gray-500">{s.regNumber}</td>
                            <td className="text-gray-500 text-sm">{s.email}</td>
                            <td className="text-gray-500 text-sm">{s.phone}</td>
                            <td>
                              <span className={`badge ${s.paymentStatus === 'verified' ? 'badge-success' : 'badge-warning'}`}>
                                {s.paymentStatus === 'verified' ? '✓ Verified' : 'Unverified'}
                              </span>
                            </td>
                            <td>
                              <button 
                                onClick={() => toggleLeader(s.id)} 
                                className={`badge ${s.isLeader ? 'badge-gold' : 'bg-gray-100 text-gray-500 border border-gray-200'} cursor-pointer transition hover:scale-105`}
                              >
                                {s.isLeader ? '⭐ Leader' : 'Set Leader'}
                              </button>
                            </td>
                            <td>
                              <button 
                                onClick={() => setSelectedStudent(s)} 
                                className="p-2 rounded-xl bg-indigo-50 text-indigo-500 hover:bg-indigo-100 transition"
                              >
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            
            {students.filter(s => s.registrationApproved).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400">No approved students yet.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'materials' && (
          <div className="space-y-6 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Upload size={20} className="text-indigo-500" /> Upload Materials</h2>
            {sessions.map(s => (
              <div key={s.id} className="card-premium p-5">
                <h3 className="font-bold text-gray-800 mb-3">{s.name}</h3>
                <div className="file-upload mb-3">
                  <Upload size={24} className="mx-auto text-gray-300 mb-1" />
                  <p className="text-xs text-gray-400 mb-2">Upload study materials</p>
                  <input type="file" onChange={e => { const f = e.target.files?.[0]; if (f) uploadMaterial(s.id, f); }} className="text-sm" />
                </div>
                <div className="space-y-2">
                  {materials.filter(m => m.sessionId === s.id).map(m => (
                    <div key={m.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl text-sm border border-gray-100">
                      <div className="flex items-center gap-2"><BookOpen size={14} className="text-indigo-400" /> <span className="font-medium text-gray-700">{m.name}</span></div>
                      <a href={m.fileData} download={m.name} className="text-indigo-500 hover:text-indigo-700"><Download size={14} /></a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'certificates' && (
          <div className="space-y-6 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Award size={20} className="text-emerald-500" /> Upload Certificate</h2>
            {sessions.map(sess => {
              const sessionRegs = regs.filter(r => r.sessionId === sess.id);
              const sessionStudents = sessionRegs.map(r => ({ reg: r, student: students.find(s => s.id === r.studentId)! })).filter(x => x.student);
              if (sessionStudents.length === 0) return null;
              return (
                <div key={sess.id} className="card-premium p-5">
                  <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2"><Award size={18} className="text-emerald-500" /> {sess.name}</h3>
                  <div className="space-y-3">
                    {sessionStudents.map(({ reg, student: st }) => (
                      <div key={st.id} className="bg-gray-50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                          {st.passport ? <img src={st.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">{st.fullName.charAt(0)}</div>}
                          <span className="font-semibold text-gray-700 text-sm">{st.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {reg.certificateFile ? (
                            <>
                              <span className="badge badge-success">Uploaded</span>
                              {!reg.certificateUnlocked ? (
                                <button onClick={() => unlockCertificate(st.id, sess.id)} className="btn-success text-xs py-1.5 px-3">Unlock</button>
                              ) : (
                                <span className="badge badge-info">🔓 Unlocked</span>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input type="file" accept=".pdf,image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCertificate(st.id, sess.id, f); }} className="text-xs w-40" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'payments' && (
          <div className="space-y-4 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><CreditCard size={20} className="text-amber-500" /> Payment Receipts</h2>
            {regs.filter(r => r.paymentReceipt).map(reg => {
              const st = students.find(s => s.id === reg.studentId);
              const sess = sessions.find(s => s.id === reg.sessionId);
              if (!st) return null;
              return (
                <div key={`${reg.studentId}-${reg.sessionId}`} className="card-premium p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {st.passport ? <img src={st.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : null}
                      <div>
                        <p className="font-bold text-gray-800">{st.fullName}</p>
                        <p className="text-xs text-gray-400">{sess?.name} — {st.regNumber}</p>
                      </div>
                    </div>
                    {reg.paymentReceipt.startsWith('data:image') && <img src={reg.paymentReceipt} alt="" className="mt-2 max-w-[200px] rounded-xl border shadow-sm" />}
                    {reg.paymentReceipt.startsWith('data:application/pdf') && <a href={reg.paymentReceipt} download="receipt.pdf" className="text-indigo-500 text-sm flex items-center gap-1"><Download size={13} /> Download PDF Receipt</a>}
                  </div>
                  {reg.paymentVerified ? (
                    <span className="badge badge-success text-sm py-1.5 px-4">✅ Verified</span>
                  ) : (
                    <button onClick={() => verifyPayment(reg.studentId, reg.sessionId)} className="btn-success text-sm">Verify Payment</button>
                  )}
                </div>
              );
            })}
            {regs.filter(r => r.paymentReceipt).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><CreditCard size={24} className="text-gray-300" /></div>
                <p className="text-gray-400">No receipts uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6 max-w-lg slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Settings size={20} className="text-gray-500" /> Site Settings</h2>
            <div className="card-premium p-5 space-y-3">
              <label className="text-sm font-semibold text-gray-600">Site Name</label>
              <div className="flex gap-2">
                <input value={siteName} onChange={e => setSiteName(e.target.value)} className="input-premium flex-1" />
                <button onClick={saveName} className="btn-primary">Save</button>
              </div>
            </div>
            <div className="card-premium p-5 space-y-3">
              <label className="text-sm font-semibold text-gray-600">Site Logo</label>
              <div className="file-upload">
                <Image size={24} className="mx-auto text-gray-300 mb-1" />
                <p className="text-xs text-gray-400 mb-2">Upload new logo</p>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} className="text-sm" />
              </div>
              {settings.logo && <img src={settings.logo} alt="" className="w-20 h-20 rounded-full mt-2 object-cover avatar-ring mx-auto" />}
            </div>
          </div>
        )}

        {tab === 'staff' && (
          <div className="space-y-4 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Users size={20} className="text-indigo-500" /> Staff Profiles</h2>
            {staff.map((s, i) => (
              <div key={i} className="card-premium p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {s.picture ? <img src={s.picture} alt="" className="w-14 h-14 rounded-full object-cover avatar-ring" /> : <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xl">{s.name.charAt(0)}</div>}
                    <div>
                      <h3 className="font-bold text-gray-800">{s.name}</h3>
                      <span className="badge badge-gold">{s.role}</span>
                    </div>
                  </div>
                  <button onClick={() => setEditingStaff(editingStaff === i ? null : i)} className="btn-accent text-xs py-1.5 px-3">
                    {editingStaff === i ? 'Close' : 'Edit'}
                  </button>
                </div>
                {editingStaff === i && (
                  <div className="space-y-3 mt-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 scale-in">
                    <input placeholder="Name" value={s.name} onChange={e => { const all = [...staff]; all[i] = { ...all[i], name: e.target.value }; saveStaffProfiles(all); doRefresh(); }} className="input-premium" />
                    <input placeholder="Email" value={s.email} onChange={e => { const all = [...staff]; all[i] = { ...all[i], email: e.target.value }; saveStaffProfiles(all); doRefresh(); }} className="input-premium" />
                    <input placeholder="Phone" value={s.phone} onChange={e => { const all = [...staff]; all[i] = { ...all[i], phone: e.target.value }; saveStaffProfiles(all); doRefresh(); }} className="input-premium" />
                    <input placeholder="Occupation" value={s.occupation} onChange={e => { const all = [...staff]; all[i] = { ...all[i], occupation: e.target.value }; saveStaffProfiles(all); doRefresh(); }} className="input-premium" />
                    <input placeholder="School" value={s.school} onChange={e => { const all = [...staff]; all[i] = { ...all[i], school: e.target.value }; saveStaffProfiles(all); doRefresh(); }} className="input-premium" />
                    <div className="file-upload">
                      <label className="text-xs text-gray-500 font-medium">Profile Picture</label>
                      <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { const d = await fileToBase64(f); const all = [...staff]; all[i] = { ...all[i], picture: d }; saveStaffProfiles(all); doRefresh(); } }} className="text-sm mt-1" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Student Modal */}
      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto modal-content shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-800">Student Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="p-2 rounded-xl hover:bg-gray-100 transition"><X size={20} /></button>
            </div>
            <div className="text-center mb-6">
              {selectedStudent.passport ? <img src={selectedStudent.passport} alt="" className="w-28 h-28 rounded-full mx-auto object-cover avatar-ring shadow-xl" /> : <div className="w-28 h-28 rounded-full mx-auto gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-xl">{selectedStudent.fullName.charAt(0)}</div>}
              <h3 className="font-bold text-xl mt-3 text-gray-800">{selectedStudent.fullName}</h3>
              {selectedStudent.isLeader && <span className="badge badge-gold mt-1 inline-block">⭐ Leader</span>}
            </div>
            <div className="space-y-2">
              {[['Reg Number', selectedStudent.regNumber], ['Email', selectedStudent.email], ['Phone', selectedStudent.phone], ['Drama Group', selectedStudent.dramaGroup], ['Position', selectedStudent.position], ['Country', selectedStudent.country], ['State', selectedStudent.state], ['Sessions', selectedStudent.sessions.map(sid => sessions.find(s => s.id === sid)?.name || sid).join(', ')]].map(([k, v]) => (
                <div key={k} className="flex justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <span className="text-gray-400 text-sm">{k}</span><span className="font-semibold text-gray-700 text-sm">{v || 'N/A'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chat FAB */}
      <button onClick={() => setChatOpen(!chatOpen)} className="chat-fab gradient-gold text-primary-dark">
        {chatOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {chatOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[480px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 scale-in overflow-hidden">
          <div className="gradient-primary text-white p-5 flex items-center justify-between">
            <div><h3 className="font-bold text-sm">{settings.siteName} - Group Chat</h3><p className="text-xs text-white/40">Admin</p></div>
            <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white transition"><X size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {chatMessages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.senderId === 'admin' ? 'flex-row-reverse' : ''}`}>
                <div className={m.senderId === 'admin' ? 'chat-bubble-own' : 'chat-bubble-other'}>
                  <p className={`text-xs font-bold mb-1 ${m.senderId === 'admin' ? 'text-amber-300' : 'text-indigo-500'}`}>{m.senderName} ({m.senderRole})</p>
                  {m.type === 'voice' && m.fileData ? <audio controls src={m.fileData} className="max-w-full" /> : <p className="text-sm">{m.content}</p>}
                  <p className="text-[10px] mt-1 opacity-40">{new Date(m.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2 items-center">
            <button onClick={sendVoice} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition"><Mic size={18} /></button>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
            <button onClick={sendChat} className="p-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition shadow-lg"><Send size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
