export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dramaGroup?: string;
  position?: string;
  country?: string;
  state?: string;
  program: string;
  session: string;
  statementOfPurpose?: string;
  registrationNumber: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'graduated';
  emailConfirmed?: boolean;
  verificationCode?: string;
  profilePicture?: string;
  isLeader?: boolean;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  paymentReceipt?: string;
  certificate?: string;
  certificateUnlocked?: boolean;
}

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationStatus: 'open' | 'closed' | 'upcoming' | 'ongoing';
  price: string;
  description?: string;
  flier?: string;
  tutors?: Tutor[];
  facilitators?: Facilitator[];
}

export interface Tutor {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
  email?: string;
  phone?: string;
}

export interface StaffOnlineStatus {
  admin: boolean;
  adminLastSeen?: string;
  secretary: boolean;
  secretaryLastSeen?: string;
  sco: boolean;
  scoLastSeen?: string;
}

export interface Facilitator {
  id: string;
  name: string;
  role: string;
  photo?: string;
  bio?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'student' | 'admin' | 'secretary' | 'sco';
  recipientId: string;
  recipientType: 'student' | 'admin' | 'secretary' | 'sco';
  content: string;
  timestamp: string;
  read: boolean;
  studentId?: string;
}

export interface GroupMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'student' | 'admin' | 'secretary' | 'sco';
  senderPhoto?: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  editedAt?: string;
  deleted?: boolean;
}

export interface Material {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileName?: string;
  fileSize?: number;
  fileData?: string;
  uploadedAt: string;
  session: string;
  program: string;
  targetSession?: string;
}

export interface StaffContact {
  name: string;
  email: string;
  phone: string;
  occupation?: string;
  school?: string;
  profilePicture?: string;
}

export interface SiteSettings {
  siteName: string;
  primaryColor: string;
  contactEmail: string;
  contactPhone: string;
  features: Feature[];
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    whatsapp?: string;
    telegram?: string;
  };
  staffContacts: {
    secretary: StaffContact;
    sco: StaffContact;
    admin: StaffContact;
  };
  aiApiKey?: string;
  logo?: string;
  announcement?: string;
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'secretary' | 'sco';
  occupation?: string;
  school?: string;
  profilePicture?: string;
}

export interface Feature {
  id: string;
  type: 'countdown' | 'announcement' | 'social';
  enabled: boolean;
  config: Record<string, unknown>;
  placement: 'dashboard' | 'header' | 'footer';
  createdAt: string;
}

export interface CallRecord {
  id: string;
  callerId: string;
  callerName: string;
  callType: 'voice' | 'video';
  participants: string[];
  startTime: string;
  endTime?: string;
  duration?: number;
  recordingUrl?: string;
  status: 'ongoing' | 'completed' | 'missed';
}

export interface Subscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  active: boolean;
}
