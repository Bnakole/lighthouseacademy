import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, getSessions, getSessionRegistrations, saveSessionRegistrations, getStaffProfiles, saveStaffProfiles, getChatMessages, saveChatMessages, getSiteSettings, fileToBase64 } from '../store';
import type { Student } from '../store';
import { LogOut, X, Send, MessageCircle, Eye, Award, CreditCard, Users, ClipboardList, Download, Mic, Home, User } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function SecretaryPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [refresh, setRefresh] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (sessionStorage.getItem('lha_admin_role') !== 'secretary') navigate('/admin-login'); }, [navigate]);

  const doRefresh = () => setRefresh(r => r + 1); void refresh;

  const students = getStudents();
  const sessions = getSessions();
  const regs = getSessionRegistrations();
  const staff = getStaffProfiles();
  const settings = getSiteSettings();

  const uploadCertificate = async (studentId: string, sessionId: string, file: File) => {
    const data = await fileToBase64(file);
    const allRegs = getSessionRegistrations(); const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId);
    if (reg) { reg.certificateFile = data; saveSessionRegistrations(allRegs); doRefresh(); }
  };
  const unlockCertificate = (studentId: string, sessionId: string) => { const allRegs = getSessionRegistrations(); const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId); if (reg) { reg.certificateUnlocked = true; saveSessionRegistrations(allRegs); doRefresh(); } };
  const verifyPayment = (studentId: string, sessionId: string) => { const allRegs = getSessionRegistrations(); const reg = allRegs.find(r => r.studentId === studentId && r.sessionId === sessionId); if (reg) { reg.paymentVerified = true; saveSessionRegistrations(allRegs); doRefresh(); } };

  const [editingProfile, setEditingProfile] = useState(false);
  const secIdx = staff.findIndex(s => s.role === 'Secretary');

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msgs = getChatMessages(); const secStaff = staff.find(s => s.role === 'Secretary');
    msgs.push({ id: uuidv4(), senderId: 'secretary', senderName: secStaff?.name || 'Secretary', senderRole: 'secretary', senderAvatar: secStaff?.picture || '', content: chatMsg.trim(), type: 'text', timestamp: new Date().toISOString(), deleted: false, edited: false });
    saveChatMessages(msgs); setChatMsg('');
  };
  const sendVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream); const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => { stream.getTracks().forEach(t => t.stop()); const blob = new Blob(chunks, { type: 'audio/webm' }); const f = new File([blob], 'voice.webm'); const data = await fileToBase64(f); const msgs = getChatMessages(); const secStaff = staff.find(s => s.role === 'Secretary'); msgs.push({ id: uuidv4(), senderId: 'secretary', senderName: secStaff?.name || 'Secretary', senderRole: 'secretary', senderAvatar: secStaff?.picture || '', content: 'Voice Message', type: 'voice', fileData: data, fileName: 'voice.webm', timestamp: new Date().toISOString(), deleted: false, edited: false }); saveChatMessages(msgs); };
      recorder.start(); setTimeout(() => recorder.stop(), 10000); alert('Recording...');
    } catch { alert('Microphone access denied'); }
  };

  const chatMessages = getChatMessages().filter(m => !m.deleted);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={15} /> },
    { id: 'certificates', label: 'Certificates', icon: <Award size={15} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={15} /> },
    { id: 'students', label: 'Students', icon: <Users size={15} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
  ];

  return (
    <div className="fade-in">
      <div className="card-premium overflow-hidden mb-6">
        <div className="gradient-blue p-6 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                <ClipboardList size={28} className="text-white" />
              </div>
              <div><h1 className="text-2xl font-extrabold text-white">Secretary Portal</h1><p className="text-white/50 text-sm">Certificate & Payment Management</p></div>
            </div>
            <button onClick={() => { sessionStorage.removeItem('lha_admin_role'); navigate('/admin-login'); }} className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold bg-white/10 px-4 py-2 rounded-xl transition"><LogOut size={16} /> Logout</button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'tab-btn-active' : 'tab-btn-inactive'}`}>{t.icon} {t.label}</button>))}
      </div>

      <div className="card-premium p-6 md:p-8">
        {tab === 'dashboard' && (
          <div className="grid grid-cols-2 gap-5 slide-up">
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white"><Users size={22} className="mx-auto mb-2 opacity-80" /><div className="text-3xl font-extrabold">{students.length}</div><div className="text-sm text-white/60 mt-1">Students</div></div>
            <div className="stat-card bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"><CreditCard size={22} className="mx-auto mb-2 opacity-80" /><div className="text-3xl font-extrabold">{regs.filter(r => r.paymentVerified).length}</div><div className="text-sm text-white/60 mt-1">Verified</div></div>
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
                  <h3 className="font-bold text-gray-800 text-lg mb-4">{sess.name}</h3>
                  <div className="space-y-3">
                    {sessionStudents.map(({ reg, student: st }) => (
                      <div key={st.id} className="bg-gray-50 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 border border-gray-100">
                        <div className="flex items-center gap-3">
                          {st.passport ? <img src={st.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : null}
                          <span className="font-semibold text-gray-700 text-sm">{st.fullName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {reg.certificateFile ? (<>{!reg.certificateUnlocked ? <button onClick={() => unlockCertificate(st.id, sess.id)} className="btn-success text-xs py-1.5 px-3">Unlock</button> : <span className="badge badge-info">🔓 Unlocked</span>}</>) : (
                            <input type="file" accept=".pdf,image/*" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCertificate(st.id, sess.id, f); }} className="text-xs w-40" />
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
              const st = students.find(s => s.id === reg.studentId); const sess = sessions.find(s => s.id === reg.sessionId);
              if (!st) return null;
              return (
                <div key={`${reg.studentId}-${reg.sessionId}`} className="card-premium p-5 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-gray-800">{st.fullName}</p><p className="text-sm text-gray-400">{sess?.name}</p>
                    {reg.paymentReceipt.startsWith('data:image') && <img src={reg.paymentReceipt} alt="" className="mt-2 max-w-[200px] rounded-xl border shadow-sm" />}
                    {reg.paymentReceipt.startsWith('data:application/pdf') && <a href={reg.paymentReceipt} download="receipt.pdf" className="text-indigo-500 text-sm flex items-center gap-1"><Download size={13} /> PDF Receipt</a>}
                  </div>
                  {reg.paymentVerified ? <span className="badge badge-success">✅ Verified</span> : <button onClick={() => verifyPayment(reg.studentId, reg.sessionId)} className="btn-success text-sm">Verify</button>}
                </div>
              );
            })}
            {regs.filter(r => r.paymentReceipt).length === 0 && <div className="text-center py-12"><div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3"><CreditCard size={24} className="text-gray-300" /></div><p className="text-gray-400">No receipts uploaded yet.</p></div>}
          </div>
        )}

        {tab === 'students' && (
          <div className="slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">Students</h2>
            <div className="space-y-2">
              {students.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center gap-3">
                    {s.passport ? <img src={s.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">{s.fullName.charAt(0)}</div>}
                    <div><p className="font-semibold text-gray-700">{s.fullName}</p><p className="text-xs text-gray-400">{s.regNumber}</p></div>
                  </div>
                  <button onClick={() => setSelectedStudent(s)} className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100 transition"><Eye size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && secIdx >= 0 && (
          <div className="max-w-md mx-auto slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">My Profile</h2>
            <div className="text-center mb-4">
              {staff[secIdx].picture ? <img src={staff[secIdx].picture} alt="" className="w-24 h-24 rounded-full mx-auto object-cover avatar-ring shadow-lg" /> : <div className="w-24 h-24 rounded-full mx-auto gradient-blue flex items-center justify-center text-white text-3xl font-bold shadow-lg">{staff[secIdx].name.charAt(0)}</div>}
              <h3 className="font-bold text-lg mt-3">{staff[secIdx].name}</h3>
              <span className="badge badge-info mt-1 inline-block">{staff[secIdx].role}</span>
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} className="btn-accent w-full mb-4">{editingProfile ? 'Close Editor' : 'Edit Profile'}</button>
            {editingProfile && (
              <div className="space-y-3 scale-in">
                <input placeholder="Name" value={staff[secIdx].name} onChange={e => { const a = [...staff]; a[secIdx] = { ...a[secIdx], name: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Email" value={staff[secIdx].email} onChange={e => { const a = [...staff]; a[secIdx] = { ...a[secIdx], email: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Phone" value={staff[secIdx].phone} onChange={e => { const a = [...staff]; a[secIdx] = { ...a[secIdx], phone: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Occupation" value={staff[secIdx].occupation} onChange={e => { const a = [...staff]; a[secIdx] = { ...a[secIdx], occupation: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <div className="file-upload">
                  <label className="text-sm text-gray-500">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { const d = await fileToBase64(f); const a = [...staff]; a[secIdx] = { ...a[secIdx], picture: d }; saveStaffProfiles(a); doRefresh(); } }} className="text-sm mt-1" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div className="modal-overlay" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-3xl p-7 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto modal-content shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4"><h2 className="text-xl font-extrabold text-gray-800">Student Profile</h2><button onClick={() => setSelectedStudent(null)} className="p-2 rounded-xl hover:bg-gray-100"><X size={20} /></button></div>
            <div className="text-center mb-4">
              {selectedStudent.passport ? <img src={selectedStudent.passport} alt="" className="w-28 h-28 rounded-full mx-auto object-cover avatar-ring shadow-xl" /> : <div className="w-28 h-28 rounded-full mx-auto gradient-primary flex items-center justify-center text-white text-4xl font-bold shadow-xl">{selectedStudent.fullName.charAt(0)}</div>}
              <h3 className="font-bold text-xl mt-3">{selectedStudent.fullName}</h3>
            </div>
            <div className="space-y-2">
              {[['Reg Number', selectedStudent.regNumber], ['Email', selectedStudent.email], ['Phone', selectedStudent.phone], ['Drama Group', selectedStudent.dramaGroup], ['Position', selectedStudent.position], ['Country', selectedStudent.country], ['State', selectedStudent.state]].map(([k, v]) => (
                <div key={k} className="flex justify-between bg-gray-50 p-3 rounded-xl border border-gray-100"><span className="text-gray-400 text-sm">{k}</span><span className="font-semibold text-gray-700 text-sm">{v || 'N/A'}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setChatOpen(!chatOpen)} className="chat-fab gradient-blue text-white">
        {chatOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
      {chatOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[480px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 scale-in overflow-hidden">
          <div className="gradient-blue text-white p-5 flex items-center justify-between"><div><h3 className="font-bold text-sm">{settings.siteName} - Group Chat</h3><p className="text-xs text-white/40">Secretary</p></div><button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {chatMessages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.senderId === 'secretary' ? 'flex-row-reverse' : ''}`}>
                <div className={m.senderId === 'secretary' ? 'chat-bubble-own' : 'chat-bubble-other'}>
                  <p className="text-xs font-bold mb-1">{m.senderName}</p>
                  {m.type === 'voice' && m.fileData ? <audio controls src={m.fileData} /> : <p className="text-sm">{m.content}</p>}
                  <p className="text-[10px] mt-1 opacity-40">{new Date(m.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2 items-center">
            <button onClick={sendVoice} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition"><Mic size={18} /></button>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-200" />
            <button onClick={sendChat} className="p-2.5 rounded-xl gradient-blue text-white hover:opacity-90 transition shadow-lg"><Send size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
