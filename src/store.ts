import { v4 as uuidv4 } from 'uuid';

export interface Student {
  id: string;
  regNumber: string;
  fullName: string;
  email: string;
  phone: string;
  dramaGroup: string;
  position: string;
  country: string;
  state: string;
  passport: string;
  sessions: string[];
  isLeader: boolean;
  createdAt: string;
}

export interface SessionRegistration {
  studentId: string;
  sessionId: string;
  paymentReceipt: string;
  paymentVerified: boolean;
  certificateFile: string;
  certificateUnlocked: boolean;
}

export interface AcademySession {
  id: string;
  name: string;
  description: string;
  price: string;
  status: 'open' | 'closed' | 'upcoming' | 'ongoing';
  facilitatorName: string;
  facilitatorImage: string;
  createdAt: string;
}

export interface Material {
  id: string;
  name: string;
  fileData: string;
  uploadedAt: string;
  sessionId: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderAvatar: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'document' | 'video';
  fileData?: string;
  fileName?: string;
  timestamp: string;
  deleted: boolean;
  edited: boolean;
}

export interface StaffProfile {
  role: string;
  name: string;
  picture: string;
  occupation: string;
  school: string;
  email: string;
  phone: string;
}

export interface SiteSettings {
  siteName: string;
  logo: string;
}

export interface ChatSettings {
  groupName: string;
  groupDescription: string;
  allowOnlyAdminSend: boolean;
  allowMembersSend: boolean;
}

// Helper functions
function getItem<T>(key: string, defaultVal: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setItem(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Students
export function getStudents(): Student[] {
  return getItem<Student[]>('lha_students', []);
}

export function saveStudents(students: Student[]) {
  setItem('lha_students', students);
}

export function findStudentByEmail(email: string): Student | undefined {
  return getStudents().find(s => s.email.toLowerCase() === email.toLowerCase());
}

export function findStudentByRegNumber(regNumber: string): Student | undefined {
  return getStudents().find(s => s.regNumber === regNumber);
}

export function registerStudent(data: Omit<Student, 'id' | 'regNumber' | 'isLeader' | 'createdAt'>): { success: boolean; message: string; regNumber?: string } {
  const students = getStudents();
  const existing = students.find(s => s.email.toLowerCase() === data.email.toLowerCase());
  
  if (existing) {
    // Check if trying to register for same session
    const newSessions = data.sessions;
    const alreadyRegistered = newSessions.filter(s => existing.sessions.includes(s));
    if (alreadyRegistered.length > 0) {
      return { success: false, message: 'You already have an account with this email. Please login to the Student Portal with your registration number: ' + existing.regNumber };
    }
    // Register for new session
    existing.sessions = [...new Set([...existing.sessions, ...newSessions])];
    // Add session registrations
    newSessions.forEach(sessionId => {
      const regs = getSessionRegistrations();
      if (!regs.find(r => r.studentId === existing.id && r.sessionId === sessionId)) {
        regs.push({
          studentId: existing.id,
          sessionId,
          paymentReceipt: '',
          paymentVerified: false,
          certificateFile: '',
          certificateUnlocked: false
        });
        saveSessionRegistrations(regs);
      }
    });
    if (data.passport) existing.passport = data.passport;
    saveStudents(students);
    return { success: true, message: 'Registered for new session(s) successfully! Your registration number is: ' + existing.regNumber, regNumber: existing.regNumber };
  }

  const count = students.length + 1;
  const regNumber = 'LHA-' + String(count).padStart(4, '0');
  const student: Student = {
    id: uuidv4(),
    regNumber,
    ...data,
    isLeader: false,
    createdAt: new Date().toISOString()
  };
  students.push(student);
  saveStudents(students);

  // Create session registrations
  data.sessions.forEach(sessionId => {
    const regs = getSessionRegistrations();
    regs.push({
      studentId: student.id,
      sessionId,
      paymentReceipt: '',
      paymentVerified: false,
      certificateFile: '',
      certificateUnlocked: false
    });
    saveSessionRegistrations(regs);
  });

  // Add to group chat
  const members = getGroupMembers();
  if (!members.includes(student.id)) {
    members.push(student.id);
    setItem('lha_group_members', members);
  }

  return { success: true, message: 'Registration successful! Your Registration Number is: ' + regNumber + '. Use this as your login password.', regNumber };
}

// Session Registrations
export function getSessionRegistrations(): SessionRegistration[] {
  return getItem<SessionRegistration[]>('lha_session_regs', []);
}

export function saveSessionRegistrations(regs: SessionRegistration[]) {
  setItem('lha_session_regs', regs);
}

// Sessions
export function getSessions(): AcademySession[] {
  const sessions = getItem<AcademySession[]>('lha_sessions', []);
  if (sessions.length === 0) {
    const defaultSession: AcademySession = {
      id: 'default-2026',
      name: '2026 Two Weeks Training',
      description: 'Online Training program for drama and theater arts.',
      price: 'Free',
      status: 'open',
      facilitatorName: '',
      facilitatorImage: '',
      createdAt: new Date().toISOString()
    };
    sessions.push(defaultSession);
    saveSessions(sessions);
  }
  return sessions;
}

export function saveSessions(sessions: AcademySession[]) {
  setItem('lha_sessions', sessions);
}

// Materials
export function getMaterials(): Material[] {
  return getItem<Material[]>('lha_materials', []);
}

export function saveMaterials(materials: Material[]) {
  setItem('lha_materials', materials);
}

// Chat
export function getChatMessages(): ChatMessage[] {
  return getItem<ChatMessage[]>('lha_chat', []);
}

export function saveChatMessages(msgs: ChatMessage[]) {
  setItem('lha_chat', msgs);
}

export function getGroupMembers(): string[] {
  return getItem<string[]>('lha_group_members', []);
}

// Staff Profiles
export function getStaffProfiles(): StaffProfile[] {
  return getItem<StaffProfile[]>('lha_staff', [
    { role: 'Admin', name: 'Admin', picture: '', occupation: '', school: '', email: '', phone: '' },
    { role: 'Secretary', name: 'Secretary', picture: '', occupation: '', school: '', email: '', phone: '' },
    { role: 'SCO', name: 'Student Coordinator', picture: '', occupation: '', school: '', email: '', phone: '' }
  ]);
}

export function saveStaffProfiles(staff: StaffProfile[]) {
  setItem('lha_staff', staff);
}

// Site Settings
export function getSiteSettings(): SiteSettings {
  return getItem<SiteSettings>('lha_settings', { siteName: 'LIGHT HOUSE ACADEMY', logo: '' });
}

export function saveSiteSettings(settings: SiteSettings) {
  setItem('lha_settings', settings);
}

// Chat Settings
export function getChatSettings(): ChatSettings {
  return getItem<ChatSettings>('lha_chat_settings', {
    groupName: 'Light House Family',
    groupDescription: 'Welcome to Light House Academy family group chat. A place for students and staff to connect, share, and learn together.',
    allowOnlyAdminSend: false,
    allowMembersSend: true
  });
}

export function saveChatSettings(settings: ChatSettings) {
  setItem('lha_chat_settings', settings);
}

// Countries and states data
export function getCountries(): Record<string, string[]> {
  return {
    'Nigeria': ['Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara'],
    'Ghana': ['Ashanti','Brong-Ahafo','Central','Eastern','Greater Accra','Northern','Upper East','Upper West','Volta','Western'],
    'Kenya': ['Nairobi','Mombasa','Kisumu','Nakuru','Uasin Gishu','Kiambu','Machakos','Kajiado','Kilifi','Kwale'],
    'South Africa': ['Eastern Cape','Free State','Gauteng','KwaZulu-Natal','Limpopo','Mpumalanga','North West','Northern Cape','Western Cape'],
    'United States': ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'],
    'United Kingdom': ['England','Scotland','Wales','Northern Ireland'],
    'Canada': ['Alberta','British Columbia','Manitoba','New Brunswick','Newfoundland and Labrador','Nova Scotia','Ontario','Prince Edward Island','Quebec','Saskatchewan'],
    'India': ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'],
    'Other': ['N/A']
  };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
