import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';
import { Student, Session, Message, GroupMessage, Material, SiteSettings, StaffProfile, Feature } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  isStudentLoggedIn: boolean;
  isAdminLoggedIn: boolean;
  userType: 'student' | 'admin' | 'secretary' | 'sco' | null;
  currentStudent: Student | null;
}

interface AppContextType {
  // Students
  students: Student[];
  addStudent: (student: Partial<Student>) => Student;
  updateStudent: (id: string, data: Partial<Student>) => void;
  updateStudentStatus: (id: string, status: 'active' | 'inactive' | 'graduated') => void;
  deleteStudent: (id: string) => void;
  getStudentsBySession: (sessionName: string) => Student[];
  
  // Sessions
  sessions: Session[];
  addSession: (session: Partial<Session>) => void;
  updateSession: (id: string, data: Partial<Session>) => void;
  deleteSession: (id: string) => void;
  
  // Messages
  messages: Message[];
  sendMessage: (senderId: string, senderName: string, senderType: string, recipientId: string, recipientType: string, content: string) => void;
  markMessagesAsRead: (recipientId: string, recipientType: string) => void;
  getMessagesForUser: (userId: string, userType: string) => Message[];
  getMessagesByStudent: (studentId: string) => Message[];
  getUnreadCount: (userId: string, userType: string) => number;
  
  // Group Messages
  groupMessages: GroupMessage[];
  sendGroupMessage: (message: Partial<GroupMessage>) => void;
  editGroupMessage: (id: string, content: string) => void;
  deleteGroupMessage: (id: string) => void;
  
  // Materials
  materials: Material[];
  addMaterial: (material: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  
  // Auth
  auth: AuthState;
  loginStudent: (registrationNumber: string) => { success: boolean; message: string };
  loginAdmin: (password: string) => boolean;
  loginStaff: (role: 'secretary' | 'sco', password: string) => boolean;
  logout: () => void;
  logoutStudent: () => void;
  logoutAdmin: () => void;
  
  // Profile
  updateProfilePicture: (studentId: string, picture: string) => void;
  verifyEmail: (registrationNumber: string, code: string) => { success: boolean; message: string };
  resendVerificationCode: (registrationNumber: string) => { success: boolean; code: string };
  
  // Certificates & Payments
  uploadCertificate: (studentId: string, certificate: string) => void;
  approvePayment: (studentId: string) => void;
  rejectPayment: (studentId: string) => void;
  uploadPaymentReceipt: (studentId: string, receipt: string) => void;
  
  // Site Settings
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => void;
  
  // Staff Profiles
  staffProfiles: StaffProfile[];
  updateStaffProfile: (id: string, data: Partial<StaffProfile>) => void;
  
  // Leaders
  appointLeader: (studentId: string) => void;
  removeLeader: (studentId: string) => void;
  toggleLeader: (studentId: string) => void;
  
  // Sync status
  isOnline: boolean;
  isSyncing: boolean;
}

const defaultSiteSettings: SiteSettings = {
  siteName: 'Light House Academy',
  primaryColor: '#3B82F6',
  contactEmail: 'info@lighthouseacademy.com',
  contactPhone: '+234 800 000 0000',
  features: [],
  socialLinks: {},
  staffContacts: {
    secretary: { name: 'Secretary', email: 'secretary@lighthouseacademy.com', phone: '+234 800 000 0001' },
    sco: { name: 'Student Coordinator', email: 'sco@lighthouseacademy.com', phone: '+234 800 000 0002' },
    admin: { name: 'Administrator', email: 'admin@lighthouseacademy.com', phone: '+234 800 000 0003' }
  }
};

const defaultSessions: Session[] = [
  {
    id: '2026-1',
    name: '2026 Two Weeks Training',
    startDate: '2026-01-06',
    endDate: '2026-01-20',
    status: 'upcoming',
    registrationStatus: 'open',
    price: 'Free',
    description: 'Intensive two weeks online training program'
  },
  {
    id: '2026-2',
    name: '2026 November Two Weeks Training',
    startDate: '2026-11-02',
    endDate: '2026-11-16',
    status: 'upcoming',
    registrationStatus: 'open',
    price: 'Free',
    description: 'November edition of our training program'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // State
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('lha_students');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [sessions, setSessions] = useState<Session[]>(() => {
    const saved = localStorage.getItem('lha_sessions');
    return saved ? JSON.parse(saved) : defaultSessions;
  });
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('lha_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>(() => {
    const saved = localStorage.getItem('lha_group_messages');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [materials, setMaterials] = useState<Material[]>(() => {
    const saved = localStorage.getItem('lha_materials');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const saved = localStorage.getItem('lha_site_settings');
    return saved ? { ...defaultSiteSettings, ...JSON.parse(saved) } : defaultSiteSettings;
  });
  
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>(() => {
    const saved = localStorage.getItem('lha_staff_profiles');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem('lha_auth');
    return saved ? JSON.parse(saved) : { 
      isAuthenticated: false, 
      isStudentLoggedIn: false,
      isAdminLoggedIn: false,
      userType: null, 
      currentStudent: null 
    };
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('lha_students', JSON.stringify(students));
  }, [students]);
  
  useEffect(() => {
    localStorage.setItem('lha_sessions', JSON.stringify(sessions));
  }, [sessions]);
  
  useEffect(() => {
    localStorage.setItem('lha_messages', JSON.stringify(messages));
  }, [messages]);
  
  useEffect(() => {
    localStorage.setItem('lha_group_messages', JSON.stringify(groupMessages));
  }, [groupMessages]);
  
  useEffect(() => {
    localStorage.setItem('lha_materials', JSON.stringify(materials));
  }, [materials]);
  
  useEffect(() => {
    localStorage.setItem('lha_site_settings', JSON.stringify(siteSettings));
  }, [siteSettings]);
  
  useEffect(() => {
    localStorage.setItem('lha_staff_profiles', JSON.stringify(staffProfiles));
  }, [staffProfiles]);
  
  useEffect(() => {
    localStorage.setItem('lha_auth', JSON.stringify(auth));
  }, [auth]);

  // Supabase real-time sync
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    setIsSyncing(true);

    const loadFromSupabase = async () => {
      try {
        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData && studentsData.length > 0) {
          const parsedStudents = studentsData.map(s => s.data as Student);
          setStudents(parsedStudents);
        }

        const { data: sessionsData } = await supabase.from('sessions').select('*');
        if (sessionsData && sessionsData.length > 0) {
          const parsedSessions = sessionsData.map(s => s.data as Session);
          setSessions(parsedSessions);
        }

        const { data: messagesData } = await supabase.from('messages').select('*');
        if (messagesData && messagesData.length > 0) {
          const parsedMessages = messagesData.map(m => m.data as Message);
          setMessages(parsedMessages);
        }

        const { data: groupMessagesData } = await supabase.from('group_messages').select('*');
        if (groupMessagesData && groupMessagesData.length > 0) {
          const parsedGroupMessages = groupMessagesData.map(gm => gm.data as GroupMessage);
          setGroupMessages(parsedGroupMessages);
        }

        const { data: settingsData } = await supabase.from('site_settings').select('*').eq('id', 'main').single();
        if (settingsData) {
          setSiteSettings({ ...defaultSiteSettings, ...(settingsData.data as SiteSettings) });
        }

        setIsOnline(true);
      } catch (error) {
        console.log('Using localStorage fallback:', error);
        setIsOnline(false);
      } finally {
        setIsSyncing(false);
      }
    };

    loadFromSupabase();

    // Set up real-time subscriptions
    const channel = supabase
      .channel('all_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newStudent = payload.new.data as Student;
          setStudents(prev => {
            const exists = prev.find(s => s.id === newStudent.id);
            if (exists) {
              return prev.map(s => s.id === newStudent.id ? newStudent : s);
            }
            return [...prev, newStudent];
          });
        } else if (payload.eventType === 'DELETE') {
          setStudents(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new.data as Message;
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newMessage = payload.new.data as GroupMessage;
          setGroupMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        } else if (payload.eventType === 'UPDATE') {
          const updatedMessage = payload.new.data as GroupMessage;
          setGroupMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          const newSession = payload.new.data as Session;
          setSessions(prev => {
            const exists = prev.find(s => s.id === newSession.id);
            if (exists) {
              return prev.map(s => s.id === newSession.id ? newSession : s);
            }
            return [...prev, newSession];
          });
        } else if (payload.eventType === 'DELETE') {
          setSessions(prev => prev.filter(s => s.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Helper function to sync to Supabase
  const syncToSupabase = async (table: string, id: string, data: unknown) => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from(table).upsert({ id, data });
    } catch (error) {
      console.error('Supabase sync error:', error);
    }
  };

  const deleteFromSupabase = async (table: string, id: string) => {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from(table).delete().eq('id', id);
    } catch (error) {
      console.error('Supabase delete error:', error);
    }
  };

  // Generate registration number
  const generateRegistrationNumber = (): string => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `LHA-2026-${randomNum}`;
  };

  // Generate verification code
  const generateVerificationCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Student functions
  const addStudent = (studentData: Partial<Student>): Student => {
    const newStudent: Student = {
      id: Date.now().toString(),
      firstName: studentData.firstName || '',
      lastName: studentData.lastName || '',
      email: studentData.email || '',
      phone: studentData.phone || '',
      gender: studentData.gender || '',
      dramaGroup: studentData.dramaGroup || '',
      position: studentData.position || '',
      country: studentData.country || '',
      state: studentData.state || '',
      program: studentData.program || '',
      session: studentData.session || '',
      statementOfPurpose: studentData.statementOfPurpose || '',
      registrationNumber: generateRegistrationNumber(),
      registrationDate: new Date().toISOString(),
      status: 'active',
      emailConfirmed: false,
      verificationCode: generateVerificationCode(),
      profilePicture: studentData.profilePicture
    };
    
    setStudents(prev => [...prev, newStudent]);
    syncToSupabase('students', newStudent.id, newStudent);
    return newStudent;
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
      const student = updated.find(s => s.id === id);
      if (student) syncToSupabase('students', id, student);
      return updated;
    });
    
    if (auth.currentStudent?.id === id) {
      setAuth(prev => ({
        ...prev,
        currentStudent: prev.currentStudent ? { ...prev.currentStudent, ...data } : null
      }));
    }
  };

  const updateStudentStatus = (id: string, status: 'active' | 'inactive' | 'graduated') => {
    updateStudent(id, { status });
  };

  const deleteStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
    deleteFromSupabase('students', id);
  };

  const getStudentsBySession = (sessionName: string): Student[] => {
    return students.filter(s => s.session === sessionName);
  };

  // Session functions
  const addSession = (sessionData: Partial<Session>) => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: sessionData.name || '',
      startDate: sessionData.startDate || '',
      endDate: sessionData.endDate || '',
      status: sessionData.status || 'upcoming',
      registrationStatus: sessionData.registrationStatus || 'closed',
      price: sessionData.price || 'Free',
      description: sessionData.description,
      facilitators: sessionData.facilitators
    };
    setSessions(prev => [...prev, newSession]);
    syncToSupabase('sessions', newSession.id, newSession);
  };

  const updateSession = (id: string, data: Partial<Session>) => {
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...data } : s);
      const session = updated.find(s => s.id === id);
      if (session) syncToSupabase('sessions', id, session);
      return updated;
    });
  };

  const deleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    deleteFromSupabase('sessions', id);
  };

  // Message functions
  const sendMessage = (senderId: string, senderName: string, senderType: string, recipientId: string, recipientType: string, content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId,
      senderName,
      senderType: senderType as Message['senderType'],
      recipientId,
      recipientType: recipientType as Message['recipientType'],
      content,
      timestamp: new Date().toISOString(),
      read: false,
      studentId: senderType === 'student' ? senderId : recipientId
    };
    setMessages(prev => [...prev, newMessage]);
    syncToSupabase('messages', newMessage.id, newMessage);
  };

  const markMessagesAsRead = (recipientId: string, recipientType: string) => {
    setMessages(prev => prev.map(m => 
      m.recipientId === recipientId && m.recipientType === recipientType
        ? { ...m, read: true }
        : m
    ));
  };

  const getMessagesForUser = (userId: string, userType: string): Message[] => {
    return messages.filter(m => 
      (m.senderId === userId && m.senderType === userType) ||
      (m.recipientId === userId && m.recipientType === userType)
    );
  };

  const getMessagesByStudent = (studentId: string): Message[] => {
    return messages.filter(m => m.studentId === studentId || m.senderId === studentId || m.recipientId === studentId);
  };

  const getUnreadCount = (userId: string, userType: string): number => {
    return messages.filter(m => 
      m.recipientId === userId && 
      m.recipientType === userType && 
      !m.read
    ).length;
  };

  // Group Message functions
  const sendGroupMessage = (messageData: Partial<GroupMessage>) => {
    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      senderId: messageData.senderId || '',
      senderName: messageData.senderName || '',
      senderType: messageData.senderType || 'student',
      senderPhoto: messageData.senderPhoto,
      content: messageData.content || '',
      timestamp: new Date().toISOString(),
      type: messageData.type || 'text',
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName
    };
    setGroupMessages(prev => [...prev, newMessage]);
    syncToSupabase('group_messages', newMessage.id, newMessage);
  };

  const editGroupMessage = (id: string, content: string) => {
    setGroupMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, content, editedAt: new Date().toISOString() } : m);
      const message = updated.find(m => m.id === id);
      if (message) syncToSupabase('group_messages', id, message);
      return updated;
    });
  };

  const deleteGroupMessage = (id: string) => {
    setGroupMessages(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, deleted: true, content: 'This message was deleted' } : m);
      const message = updated.find(m => m.id === id);
      if (message) syncToSupabase('group_messages', id, message);
      return updated;
    });
  };

  // Material functions
  const addMaterial = (materialData: Partial<Material>) => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      title: materialData.title || '',
      description: materialData.description || '',
      fileUrl: materialData.fileUrl || '',
      fileType: materialData.fileType || '',
      fileName: materialData.fileName,
      fileSize: materialData.fileSize,
      fileData: materialData.fileData,
      uploadedAt: new Date().toISOString(),
      session: materialData.session || '',
      program: materialData.program || '',
      targetSession: materialData.targetSession
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  // Auth functions
  const loginStudent = (registrationNumber: string): { success: boolean; message: string } => {
    const student = students.find(s => s.registrationNumber === registrationNumber);
    
    if (!student) {
      return { success: false, message: 'Invalid registration number' };
    }
    
    // Email verification removed - students can login directly
    setAuth({
      isAuthenticated: true,
      isStudentLoggedIn: true,
      isAdminLoggedIn: false,
      userType: 'student',
      currentStudent: student
    });
    
    return { success: true, message: 'Login successful' };
  };

  const loginAdmin = (password: string): boolean => {
    if (password === 'LHA2026') {
      setAuth({
        isAuthenticated: true,
        isStudentLoggedIn: false,
        isAdminLoggedIn: true,
        userType: 'admin',
        currentStudent: null
      });
      return true;
    }
    return false;
  };

  const loginStaff = (role: 'secretary' | 'sco', password: string): boolean => {
    const passwords = {
      secretary: 'Sec-LHA-2026',
      sco: 'Sco-LHA-2026'
    };
    
    if (password === passwords[role]) {
      setAuth({
        isAuthenticated: true,
        isStudentLoggedIn: false,
        isAdminLoggedIn: true,
        userType: role,
        currentStudent: null
      });
      return true;
    }
    return false;
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      isStudentLoggedIn: false,
      isAdminLoggedIn: false,
      userType: null,
      currentStudent: null
    });
  };

  const logoutStudent = () => logout();
  const logoutAdmin = () => logout();

  // Profile functions
  const updateProfilePicture = (studentId: string, picture: string) => {
    updateStudent(studentId, { profilePicture: picture });
  };

  const verifyEmail = (registrationNumber: string, code: string): { success: boolean; message: string } => {
    const student = students.find(s => s.registrationNumber === registrationNumber);
    
    if (!student) {
      return { success: false, message: 'Student not found' };
    }
    
    if (student.verificationCode === code) {
      updateStudent(student.id, { emailConfirmed: true });
      return { success: true, message: 'Email verified successfully' };
    }
    
    return { success: false, message: 'Invalid verification code' };
  };

  const resendVerificationCode = (registrationNumber: string): { success: boolean; code: string } => {
    const student = students.find(s => s.registrationNumber === registrationNumber);
    
    if (!student) {
      return { success: false, code: '' };
    }
    
    const newCode = generateVerificationCode();
    updateStudent(student.id, { verificationCode: newCode });
    return { success: true, code: newCode };
  };

  // Certificate & Payment functions
  const uploadCertificate = (studentId: string, certificate: string) => {
    updateStudent(studentId, { certificate });
  };

  const approvePayment = (studentId: string) => {
    updateStudent(studentId, { paymentStatus: 'approved', certificateUnlocked: true });
  };

  const rejectPayment = (studentId: string) => {
    updateStudent(studentId, { paymentStatus: 'rejected' });
  };

  const uploadPaymentReceipt = (studentId: string, receipt: string) => {
    updateStudent(studentId, { paymentReceipt: receipt, paymentStatus: 'pending' });
  };

  // Site Settings functions
  const updateSiteSettings = (settings: Partial<SiteSettings>) => {
    setSiteSettings(prev => {
      const updated = { ...prev, ...settings };
      syncToSupabase('site_settings', 'main', updated);
      return updated;
    });
  };

  // Staff Profile functions
  const updateStaffProfile = (id: string, data: Partial<StaffProfile>) => {
    setStaffProfiles(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.map(p => p.id === id ? { ...p, ...data } : p);
      }
      return [...prev, { id, ...data } as StaffProfile];
    });
  };

  // Leader functions
  const appointLeader = (studentId: string) => {
    updateStudent(studentId, { isLeader: true });
  };

  const removeLeader = (studentId: string) => {
    updateStudent(studentId, { isLeader: false });
  };

  const toggleLeader = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      updateStudent(studentId, { isLeader: !student.isLeader });
    }
  };

  const value: AppContextType = {
    students,
    addStudent,
    updateStudent,
    updateStudentStatus,
    deleteStudent,
    getStudentsBySession,
    sessions,
    addSession,
    updateSession,
    deleteSession,
    messages,
    sendMessage,
    markMessagesAsRead,
    getMessagesForUser,
    getMessagesByStudent,
    getUnreadCount,
    groupMessages,
    sendGroupMessage,
    editGroupMessage,
    deleteGroupMessage,
    materials,
    addMaterial,
    deleteMaterial,
    auth,
    loginStudent,
    loginAdmin,
    loginStaff,
    logout,
    logoutStudent,
    logoutAdmin,
    updateProfilePicture,
    verifyEmail,
    resendVerificationCode,
    uploadCertificate,
    approvePayment,
    rejectPayment,
    uploadPaymentReceipt,
    siteSettings,
    updateSiteSettings,
    staffProfiles,
    updateStaffProfile,
    appointLeader,
    removeLeader,
    toggleLeader,
    isOnline,
    isSyncing
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export type { AppContextType, AuthState };
