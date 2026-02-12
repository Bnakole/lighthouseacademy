import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { findStudentByRegNumber, getSessions, getMaterials, getSessionRegistrations, saveSessionRegistrations, fileToBase64, getStaffProfiles, getChatMessages, saveChatMessages, getSiteSettings, getChatSettings, getStudents } from '../store';
import type { Student, ChatMessage } from '../store';
import { LogOut, BookOpen, Award, CreditCard, Users, MessageCircle, Send, X, Download, Home, ExternalLink, Phone, Mail, Briefcase, Mic, ArrowRight, CheckCircle, AlertCircle, Smile, Settings, UserCheck, Info } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Emoji picker data
const emojis = ['😀', '😊', '😄', '🤣', '😍', '🤩', '😎', '🤔', '😢', '😭', '😡', '👍', '👎', '👏', '🙏', '💯', '❤️', '💔', '🔥', '⭐', '✨', '🎉', '🎊', '🎯', '🎭'];

export function StudentPortal() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [tab, setTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const reg = sessionStorage.getItem('lha_student_session');
    if (!reg) { navigate('/student-login'); return; }
    const s = findStudentByRegNumber(reg);
    if (!s) { navigate('/student-login'); return; }
    setStudent(s);
  }, [navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatOpen]);

  const handleLogout = () => { 
    sessionStorage.removeItem('lha_student_session'); 
    navigate('/student-login'); 
  };

  if (!student) return null;

  const sessions = getSessions();
  const materials = getMaterials();
  const regs = getSessionRegistrations().filter(r => r.studentId === student.id);
  const staff = getStaffProfiles();
  const settings = getSiteSettings();
  const chatSettings = getChatSettings();
  const allStudents = getStudents();

  const uploadReceipt = async (sessionId: string, file: File) => {
    const data = await fileToBase64(file);
    const allRegs = getSessionRegistrations();
    const reg = allRegs.find(r => r.studentId === student.id && r.sessionId === sessionId);
    if (reg) { 
      reg.paymentReceipt = data; 
      reg.paymentVerified = false; // Reset verification status
      saveSessionRegistrations(allRegs); 
      window.location.reload(); 
    }
  };

  const sendChat = () => {
    if (!chatMsg.trim()) return;
    const msgs = getChatMessages();
    const msg: ChatMessage = {
      id: uuidv4(), senderId: student.id, senderName: student.fullName,
      senderRole: 'student', senderAvatar: student.passport || '',
      content: chatMsg.trim(), type: 'text', timestamp: new Date().toISOString(),
      deleted: false, edited: false
    };
    msgs.push(msg);
    saveChatMessages(msgs);
    setChatMsg('');
    setShowEmoji(false);
    // Play notification sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF');
    audio.play().catch(() => {});
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
        const msgs = getChatMessages();
        msgs.push({
          id: uuidv4(), senderId: student.id, senderName: student.fullName,
          senderRole: 'student', senderAvatar: student.passport || '',
          content: 'Voice Message', type: 'voice', fileData: data, fileName: 'voice.webm',
          timestamp: new Date().toISOString(), deleted: false, edited: false
        });
        saveChatMessages(msgs);
      };
      recorder.start();
      setTimeout(() => recorder.stop(), 10000);
      alert('Recording... will stop after 10 seconds.');
    } catch { alert('Microphone access denied'); }
  };

  const sendFile = async (file: File) => {
    const data = await fileToBase64(file);
    const msgs = getChatMessages();
    const type = file.type.startsWith('image/') ? 'image' : 'document';
    msgs.push({
      id: uuidv4(), senderId: student.id, senderName: student.fullName,
      senderRole: 'student', senderAvatar: student.passport || '',
      content: file.name, type, fileData: data, fileName: file.name,
      timestamp: new Date().toISOString(), deleted: false, edited: false
    });
    saveChatMessages(msgs);
  };

  const addEmoji = (emoji: string) => {
    setChatMsg(prev => prev + emoji);
  };

  const chatMessages = getChatMessages().filter(m => !m.deleted);
  const groupMembers = allStudents.concat(staff.map(s => ({
    id: s.role, fullName: s.name, email: s.email || '', phone: s.phone || '',
    sessions: [], regNumber: '', passport: s.picture, isLeader: false,
    dramaGroup: '', position: s.role, country: '', state: '',
    createdAt: new Date().toISOString()
  })));

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home size={16} /> },
    { id: 'materials', label: 'Materials', icon: <BookOpen size={16} /> },
    { id: 'payment', label: 'Payment', icon: <CreditCard size={16} /> },
    { id: 'certificate', label: 'Certificate', icon: <Award size={16} /> },
    { id: 'joinclass', label: 'Join Class', icon: <ExternalLink size={16} /> },
    { id: 'contact', label: 'Contact Staff', icon: <Phone size={16} /> },
  ];

  return (
    <div className="fade-in">
      {/* Profile Header */}
      <div className="card-premium overflow-hidden mb-6">
        <div className="gradient-primary p-6 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg" />
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {student.passport ? (
                <img src={student.passport} alt="" className="w-18 h-18 rounded-full object-cover avatar-ring shadow-xl" style={{width:'72px',height:'72px'}} />
              ) : (
                <div className="w-18 h-18 rounded-full gradient-gold flex items-center justify-center text-primary-dark text-2xl font-black shadow-xl" style={{width:'72px',height:'72px'}}>
                  {student.fullName.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl md:text-2xl font-extrabold text-white">{student.fullName}</h1>
                <p className="text-white/40 text-sm font-mono">Reg: {student.regNumber}</p>
                {student.isLeader && <span className="badge badge-gold mt-1 inline-block">⭐ Leader</span>}
              </div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 text-white/50 hover:text-red-400 text-sm font-semibold transition-colors bg-white/5 px-4 py-2 rounded-xl hover:bg-white/10">
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

      {/* Tab Content */}
      <div className="card-premium p-6 md:p-8">
        {tab === 'dashboard' && (
          <div className="space-y-6 slide-up">
            <h2 className="text-xl font-extrabold text-gray-800">Welcome, {student.fullName}! 👋</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Email', value: student.email, icon: <Mail size={14} className="text-indigo-400" /> },
                { label: 'Phone', value: student.phone, icon: <Phone size={14} className="text-emerald-400" /> },
                { label: 'Drama Group', value: student.dramaGroup || 'N/A', icon: <Users size={14} className="text-violet-400" /> },
                { label: 'Position', value: student.position, icon: <Briefcase size={14} className="text-amber-400" /> },
                { label: 'Country / State', value: `${student.country}, ${student.state}`, icon: <Home size={14} className="text-blue-400" /> },
                { label: 'Sessions', value: student.sessions.map(sid => sessions.find(s => s.id === sid)?.name || sid).join(', '), icon: <BookOpen size={14} className="text-rose-400" /> },
              ].map((item, i) => (
                <div key={i} className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 hover:bg-gray-50 transition">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                    {item.icon} {item.label}
                  </div>
                  <p className="font-semibold text-gray-700 text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'materials' && (
          <div className="slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center">
                <BookOpen size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">Study Materials</h2>
            </div>
            {materials.filter(m => student.sessions.includes(m.sessionId) || m.sessionId === 'general').length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <BookOpen size={24} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">No materials uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {materials.filter(m => student.sessions.includes(m.sessionId) || m.sessionId === 'general').map(m => (
                  <div key={m.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                        <BookOpen size={16} className="text-indigo-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 text-sm">{m.name}</p>
                        <p className="text-xs text-gray-400">{new Date(m.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <a href={m.fileData} download={m.name} className="btn-accent text-xs py-2 px-3 flex items-center gap-1">
                      <Download size={13} /> Download
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'payment' && (
          <div className="space-y-6 slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center">
                <CreditCard size={18} className="text-primary-dark" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">Payment</h2>
            </div>
            
            {/* Account Details */}
            <div className="payment-card">
              <h3 className="font-extrabold text-amber-900 text-lg mb-4 flex items-center gap-2">💳 Bank Account Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white/60 rounded-xl p-3">
                  <span className="text-gray-600 text-sm font-medium">Bank</span>
                  <span className="font-bold text-gray-800">OPAY</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-xl p-3">
                  <span className="text-gray-600 text-sm font-medium">Account Number</span>
                  <span className="font-extrabold font-mono text-xl text-primary-dark tracking-wider">8080498742</span>
                </div>
                <div className="flex justify-between items-center bg-white/60 rounded-xl p-3">
                  <span className="text-gray-600 text-sm font-medium">Account Name</span>
                  <span className="font-bold text-gray-800">LIGHT HOUSE ACADEMY</span>
                </div>
              </div>
            </div>

            {regs.map(reg => {
              const sess = sessions.find(s => s.id === reg.sessionId);
              return (
                <div key={reg.sessionId} className="card-premium p-5 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800">{sess?.name || 'Session'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-gold">{sess?.price || 'Free'}</span>
                      {reg.paymentReceipt && (
                        <span className={`badge ${reg.paymentVerified ? 'badge-success' : 'badge-warning'}`}>
                          {reg.paymentVerified ? 'Verified' : 'Unverified'}
                        </span>
                      )}
                    </div>
                  </div>
                  {reg.paymentReceipt ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`status-dot ${reg.paymentVerified ? 'bg-emerald-500' : 'bg-amber-500'} ${reg.paymentVerified ? 'text-emerald-500' : 'text-amber-500'}`} />
                        <span className={`${reg.paymentVerified ? 'text-emerald-600' : 'text-amber-600'} text-sm font-semibold`}>
                          Receipt uploaded
                        </span>
                      </div>
                      {reg.paymentVerified ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                          <p className="text-emerald-700 font-bold">Payment Verified</p>
                          <p className="text-emerald-600 text-sm mt-1">You can now download your certificate</p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                          <p className="text-amber-700 font-bold">Payment Unverified</p>
                          <p className="text-amber-600 text-sm mt-1">Awaiting admin verification...</p>
                        </div>
                      )}
                      {reg.paymentReceipt.startsWith('data:image') && (
                        <img src={reg.paymentReceipt} alt="receipt" className="max-w-xs rounded-xl border shadow-sm mx-auto" />
                      )}
                    </div>
                  ) : (
                    <div className="file-upload">
                      <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm font-semibold text-gray-500 mb-1">Upload Receipt Here</p>
                      <p className="text-xs text-gray-400 mb-3">Image or PDF accepted</p>
                      <input type="file" accept="image/*,.pdf" onChange={e => {
                        const f = e.target.files?.[0]; if (f) uploadReceipt(reg.sessionId, f);
                      }} className="text-sm" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'certificate' && (
          <div className="slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-success flex items-center justify-center">
                <Award size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">CERTIFICATE</h2>
            </div>
            {regs.map(reg => {
              const sess = sessions.find(s => s.id === reg.sessionId);
              const canDownload = reg.certificateFile && reg.certificateUnlocked && reg.paymentVerified;
              
              return (
                <div key={reg.sessionId} className="card-premium p-5 mb-4">
                  <h3 className="font-bold text-gray-800 mb-3">{sess?.name || 'Session'}</h3>
                  {canDownload ? (
                    <div className="text-center py-4 space-y-3">
                      <div className="w-16 h-16 rounded-full gradient-success flex items-center justify-center mx-auto bounce-in shadow-lg">
                        <Award size={28} className="text-white" />
                      </div>
                      <p className="text-emerald-600 font-bold">🎉 Your certificate is ready!</p>
                      <a href={reg.certificateFile} download={`Certificate_${student.fullName}_${sess?.name}.pdf`}
                        className="btn-success inline-flex items-center gap-2">
                        <Download size={16} /> Download Certificate
                      </a>
                    </div>
                  ) : reg.certificateFile && !reg.paymentVerified ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                        <AlertCircle size={24} className="text-amber-500" />
                      </div>
                      <p className="text-amber-600 font-medium">Certificate available after payment verification</p>
                      <p className="text-amber-500 text-sm mt-1">Please complete payment first</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Award size={24} className="text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">Certificate not yet available, try again.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'joinclass' && (
          <div className="text-center py-8 space-y-6 slide-up">
            <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mx-auto shadow-xl bounce-in">
              <ExternalLink size={32} className="text-white" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800">Join Class</h2>
            <p className="text-gray-500 max-w-md mx-auto">The training will take place on a closed WhatsApp group.</p>
            <a href="https://t.me/+k7GOXSYPzYozNjM0" target="_blank" rel="noopener noreferrer"
              className="btn-success inline-flex items-center gap-2 py-4 px-10 text-lg">
              Join Now <ArrowRight size={20} />
            </a>
          </div>
        )}

        {tab === 'contact' && (
          <div className="slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-800">Contact Staff</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {staff.map((s, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
                  {s.picture ? (
                    <img src={s.picture} alt="" className="w-18 h-18 rounded-full mx-auto object-cover avatar-ring mb-3 shadow-lg" style={{width:'72px',height:'72px'}} />
                  ) : (
                    <div className="w-18 h-18 rounded-full mx-auto gradient-primary flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-lg" style={{width:'72px',height:'72px'}}>
                      {s.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="font-bold text-gray-800">{s.name}</h3>
                  <span className="badge badge-gold mt-1 inline-block">{s.role}</span>
                  {s.email && <p className="text-xs text-indigo-500 mt-2 flex items-center justify-center gap-1"><Mail size={11} /> {s.email}</p>}
                  {s.phone && <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1"><Phone size={11} /> {s.phone}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Group Chat FAB */}
      <button onClick={() => setChatOpen(!chatOpen)}
        className="chat-fab gradient-primary text-white pulse-glow">
        {chatOpen ? <X size={24} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Window */}
      {chatOpen && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:w-[520px] h-[580px] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col z-50 scale-in overflow-hidden">
          <div className="gradient-primary text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold">Light House Family</h3>
                <p className="text-xs text-white/60">{groupMembers.length} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowGroupInfo(!showGroupInfo)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <Info size={18} />
              </button>
              <button onClick={() => setChatOpen(false)} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Group Info Panel */}
          {showGroupInfo && (
            <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
              <div className="gradient-purple p-5 flex items-center justify-between">
                <h3 className="font-bold text-white">Group Information</h3>
                <button onClick={() => setShowGroupInfo(false)} className="text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Group Name</h4>
                  <p className="text-gray-600">{chatSettings.groupName}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Description</h4>
                  <p className="text-gray-600 text-sm">{chatSettings.groupDescription}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Members ({groupMembers.length})</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {groupMembers.map(m => (
                      <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        {m.passport ? (
                          <img src={m.passport} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                            {m.fullName.charAt(0)}
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{m.fullName}</p>
                          <p className="text-xs text-gray-500">{m.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
            {chatMessages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.senderId === student.id ? 'flex-row-reverse' : ''}`}>
                {m.senderAvatar && (
                  <img src={m.senderAvatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                )}
                <div className={m.senderId === student.id ? 'chat-bubble-own' : 'chat-bubble-other'}>
                  <p className={`text-xs font-bold mb-1 ${m.senderId === student.id ? 'text-amber-300' : 'text-indigo-500'}`}>
                    {m.senderName} <span className="font-normal opacity-60">({m.senderRole})</span>
                  </p>
                  {m.type === 'voice' && m.fileData ? (
                    <audio controls src={m.fileData} className="max-w-full" />
                  ) : m.type === 'image' && m.fileData ? (
                    <img src={m.fileData} alt="" className="max-w-full rounded-lg" />
                  ) : m.type === 'document' && m.fileData ? (
                    <a href={m.fileData} download={m.fileName} className="flex items-center gap-2 text-blue-400 hover:underline">
                      <Download size={14} /> {m.fileName}
                    </a>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${m.senderId === student.id ? 'text-white/40' : 'text-gray-300'}`}>
                    {new Date(m.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji Picker */}
          {showEmoji && (
            <div className="absolute bottom-16 left-4 right-4 bg-white rounded-xl shadow-lg p-3 border grid grid-cols-8 gap-1">
              {emojis.map(e => (
                <button key={e} onClick={() => addEmoji(e)} className="text-xl hover:bg-gray-100 rounded p-1">
                  {e}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 border-t bg-white">
            <div className="flex gap-2 items-center">
              <button onClick={() => setShowEmoji(!showEmoji)} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600 transition">
                <Smile size={18} />
              </button>
              <button onClick={sendVoice} className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600 transition">
                <Mic size={18} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx" 
                onChange={e => { const f = e.target.files?.[0]; if (f) sendFile(f); }} />
              <input value={chatMsg} onChange={e => setChatMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..." className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-200" />
              <button onClick={sendChat} className="p-2.5 rounded-xl gradient-primary text-white hover:opacity-90 transition shadow-lg">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}