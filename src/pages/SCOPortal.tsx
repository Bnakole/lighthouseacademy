import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStudents, getSessions, getMaterials, saveMaterials, getStaffProfiles, saveStaffProfiles, getChatMessages, saveChatMessages, getSiteSettings, fileToBase64 } from '../store';
import type { Student } from '../store';
import { LogOut, X, Send, MessageCircle, Download, Eye, BookOpen, Users, Target, Upload, Home, User, Mic, MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export function SCOPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [refresh, setRefresh] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (sessionStorage.getItem('lha_admin_role') !== 'sco') navigate('/admin-login'); }, [navigate]);

  const doRefresh = () => setRefresh(r => r + 1); void refresh;

  const students = getStudents();
  const sessions = getSessions();
  const materials = getMaterials();
  const staff = getStaffProfiles();
  const settings = getSiteSettings();

  const uploadMaterial = async (sessionId: string, file: File) => {
    const data = await fileToBase64(file);
    const all = getMaterials(); all.push({ id: uuidv4(), name: file.name, fileData: data, uploadedAt: new Date().toISOString(), sessionId }); saveMaterials(all); doRefresh();
  };

  const scoIdx = staff.findIndex(s => s.role === 'SCO');
  const [editingProfile, setEditingProfile] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMsg, setReplyMsg] = useState('');

  const studentMessages = getChatMessages().filter(m => m.senderRole === 'student' && !m.deleted);

  const sendReply = (studentName: string) => {
    if (!replyMsg.trim()) return;
    const msgs = getChatMessages(); const scoStaff = staff.find(s => s.role === 'SCO');
    msgs.push({ id: uuidv4(), senderId: 'sco', senderName: scoStaff?.name || 'SCO', senderRole: 'sco', senderAvatar: scoStaff?.picture || '', content: `@${studentName}: ${replyMsg.trim()}`, type: 'text', timestamp: new Date().toISOString(), deleted: false, edited: false });
    saveChatMessages(msgs); setReplyMsg(''); setReplyTo(null);
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msgs = getChatMessages(); const scoStaff = staff.find(s => s.role === 'SCO');
    msgs.push({ id: uuidv4(), senderId: 'sco', senderName: scoStaff?.name || 'SCO', senderRole: 'sco', senderAvatar: scoStaff?.picture || '', content: chatMsg.trim(), type: 'text', timestamp: new Date().toISOString(), deleted: false, edited: false });
    saveChatMessages(msgs); setChatMsg('');
  };

  const sendVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream); const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => chunks.push(e.data);
      recorder.onstop = async () => { stream.getTracks().forEach(t => t.stop()); const blob = new Blob(chunks, { type: 'audio/webm' }); const f = new File([blob], 'voice.webm'); const data = await fileToBase64(f); const msgs = getChatMessages(); const scoStaff = staff.find(s => s.role === 'SCO'); msgs.push({ id: uuidv4(), senderId: 'sco', senderName: scoStaff?.name || 'SCO', senderRole: 'sco', senderAvatar: scoStaff?.picture || '', content: 'Voice Message', type: 'voice', fileData: data, fileName: 'voice.webm', timestamp: new Date().toISOString(), deleted: false, edited: false }); saveChatMessages(msgs); };
      recorder.start(); setTimeout(() => recorder.stop(), 10000); alert('Recording...');
    } catch { alert('Microphone access denied'); }
  };

  const chatMessages = getChatMessages().filter(m => !m.deleted);
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={15} /> },
    { id: 'materials', label: 'Materials', icon: <BookOpen size={15} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={15} /> },
    { id: 'students', label: 'Students', icon: <Users size={15} /> },
    { id: 'profile', label: 'My Profile', icon: <User size={15} /> },
  ];

  return (
    <div className="fade-in">
      <div className="card-premium overflow-hidden mb-6">
        <div className="gradient-purple p-6 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl">
                <Target size={28} className="text-white" />
              </div>
              <div><h1 className="text-2xl font-extrabold text-white">SCO Portal</h1><p className="text-white/50 text-sm">Student Coordinator — Materials & Messages</p></div>
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
            <div className="stat-card bg-gradient-to-br from-violet-500 to-violet-600 text-white"><Users size={22} className="mx-auto mb-2 opacity-80" /><div className="text-3xl font-extrabold">{students.length}</div><div className="text-sm text-white/60 mt-1">Students</div></div>
            <div className="stat-card bg-gradient-to-br from-blue-500 to-blue-600 text-white"><BookOpen size={22} className="mx-auto mb-2 opacity-80" /><div className="text-3xl font-extrabold">{materials.length}</div><div className="text-sm text-white/60 mt-1">Materials</div></div>
          </div>
        )}

        {tab === 'materials' && (
          <div className="space-y-6 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><Upload size={20} className="text-violet-500" /> Upload Materials</h2>
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
                      <div className="flex items-center gap-2"><BookOpen size={14} className="text-violet-400" /> <span className="font-medium text-gray-700">{m.name}</span></div>
                      <a href={m.fileData} download={m.name} className="text-violet-500 hover:text-violet-700"><Download size={14} /></a>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'messages' && (
          <div className="space-y-4 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 flex items-center gap-2"><MessageSquare size={20} className="text-violet-500" /> Student Messages</h2>
            {students.map(st => {
              const msgs = studentMessages.filter(m => m.senderId === st.id);
              if (msgs.length === 0) return (
                <div key={st.id} className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-100">
                  <div className="flex items-center gap-3">
                    {st.passport ? <img src={st.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">{st.fullName.charAt(0)}</div>}
                    <span className="font-semibold text-gray-700">{st.fullName}</span>
                  </div>
                  <span className="text-xs text-gray-300">No messages</span>
                </div>
              );
              return (
                <div key={st.id} className="card-premium p-5">
                  <div className="flex items-center gap-3 mb-3">
                    {st.passport ? <img src={st.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" /> : null}
                    <h3 className="font-bold text-gray-800">{st.fullName}</h3>
                  </div>
                  {msgs.map(m => (
                    <div key={m.id} className="bg-gray-50 p-3 rounded-xl mb-2 text-sm border border-gray-100">
                      <p className="text-gray-700">{m.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                  {replyTo === st.id ? (
                    <div className="flex gap-2 mt-3">
                      <input value={replyMsg} onChange={e => setReplyMsg(e.target.value)} placeholder="Reply..." className="input-premium flex-1 py-2 text-sm" />
                      <button onClick={() => sendReply(st.fullName)} className="btn-accent text-sm py-2 px-4">Send</button>
                    </div>
                  ) : (
                    <button onClick={() => setReplyTo(st.id)} className="text-violet-500 text-sm font-semibold mt-2 hover:text-violet-700 transition">Reply →</button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'students' && (
          <div className="slide-up space-y-6">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-violet-500" /> 
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
                    <BookOpen size={18} className="text-violet-500" />
                    {session.name}
                    <span className="badge badge-info ml-2">{sessionStudents.length} students</span>
                  </h3>
                  
                  <div className="space-y-2">
                    {sessionStudents.map(s => (
                      <div key={s.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          {s.passport ? (
                            <img src={s.passport} alt="" className="w-10 h-10 rounded-full object-cover avatar" />
                          ) : (
                            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                              {s.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-700">{s.fullName}</p>
                            <p className="text-xs text-gray-400">{s.regNumber} • {s.email}</p>
                            <p className="text-xs text-gray-500 mt-1">📞 {s.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${s.paymentStatus === 'verified' ? 'badge-success' : 'badge-warning'} text-xs`}>
                            {s.paymentStatus === 'verified' ? '✓ Verified' : 'Unverified'}
                          </span>
                          <button 
                            onClick={() => setSelectedStudent(s)} 
                            className="p-2 rounded-xl bg-violet-50 text-violet-500 hover:bg-violet-100 transition"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
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

        {tab === 'profile' && scoIdx >= 0 && (
          <div className="max-w-md mx-auto slide-up">
            <h2 className="text-xl font-extrabold text-gray-800 mb-4">My Profile</h2>
            <div className="text-center mb-4">
              {staff[scoIdx].picture ? <img src={staff[scoIdx].picture} alt="" className="w-24 h-24 rounded-full mx-auto object-cover avatar-ring shadow-lg" /> : <div className="w-24 h-24 rounded-full mx-auto gradient-purple flex items-center justify-center text-white text-3xl font-bold shadow-lg">{staff[scoIdx].name.charAt(0)}</div>}
              <h3 className="font-bold text-lg mt-3">{staff[scoIdx].name}</h3>
              <span className="badge badge-info mt-1 inline-block">{staff[scoIdx].role}</span>
            </div>
            <button onClick={() => setEditingProfile(!editingProfile)} className="btn-accent w-full mb-4">{editingProfile ? 'Close Editor' : 'Edit Profile'}</button>
            {editingProfile && (
              <div className="space-y-3 scale-in">
                <input placeholder="Name" value={staff[scoIdx].name} onChange={e => { const a = [...staff]; a[scoIdx] = { ...a[scoIdx], name: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Email" value={staff[scoIdx].email} onChange={e => { const a = [...staff]; a[scoIdx] = { ...a[scoIdx], email: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Phone" value={staff[scoIdx].phone} onChange={e => { const a = [...staff]; a[scoIdx] = { ...a[scoIdx], phone: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <input placeholder="Occupation" value={staff[scoIdx].occupation} onChange={e => { const a = [...staff]; a[scoIdx] = { ...a[scoIdx], occupation: e.target.value }; saveStaffProfiles(a); doRefresh(); }} className="input-premium" />
                <div className="file-upload">
                  <label className="text-sm text-gray-500">Profile Picture</label>
                  <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (f) { const d = await fileToBase64(f); const a = [...staff]; a[scoIdx] = { ...a[scoIdx], picture: d }; saveStaffProfiles(a); doRefresh(); } }} className="text-sm mt-1" />
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

      <button onClick={() => setChatOpen(!chatOpen)} className="chat-fab gradient-purple text-white">
        {chatOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>
      {chatOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[480px] h-[520px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 scale-in overflow-hidden">
          <div className="gradient-purple text-white p-5 flex items-center justify-between"><div><h3 className="font-bold text-sm">{settings.siteName} - Group Chat</h3><p className="text-xs text-white/40">SCO</p></div><button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white"><X size={20} /></button></div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {chatMessages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.senderId === 'sco' ? 'flex-row-reverse' : ''}`}>
                <div className={m.senderId === 'sco' ? 'chat-bubble-own' : 'chat-bubble-other'}>
                  <p className="text-xs font-bold mb-1">{m.senderName}</p>
                  {m.type === 'voice' && m.fileData ? <audio controls src={m.fileData} /> : <p className="text-sm">{m.content}</p>}
                  <p className="text-[10px] mt-1 opacity-40">{new Date(m.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="p-3 border-t bg-white flex gap-2 items-center">
            <button onClick={sendVoice} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-violet-100 hover:text-violet-600 transition"><Mic size={18} /></button>
            <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder="Type a message..." className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-200" />
            <button onClick={sendChat} className="p-2.5 rounded-xl gradient-purple text-white hover:opacity-90 transition shadow-lg"><Send size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
