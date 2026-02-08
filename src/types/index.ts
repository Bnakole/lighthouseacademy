export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dramaGroup: string;
  position: string;
  country: string;
  state: string;
  program: string;
  session: string;
  statementOfPurpose: string;
  registrationNumber: string;
  registrationDate: string;
  status: 'active' | 'inactive' | 'graduated';
  emailConfirmed: boolean;
  verificationCode: string;
  profilePicture?: string;
  certificate?: string;
  certificateUnlocked?: boolean;
  paymentReceipt?: string;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  isLeader?: boolean;
}

export interface Facilitator {
  id: string;
  name: string;
  role: string;
  photo?: string;
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
  facilitators?: Facilitator[];
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
  senderType: 'student' | 'admin' | 'secretary' | 'sco' | 'leader';
  senderPhoto?: string;
  content: string;
  timestamp: string;
  type?: 'text' | 'image' | 'voice' | 'document' | 'video' | 'file';
  fileUrl?: string;
  fileName?: string;
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
  fileSize?: string;
  fileData?: string;
  uploadedAt: string;
  session: string;
  program: string;
  targetSession?: string;
}

export interface Feature {
  id: string;
  type: 'countdown' | 'announcement' | 'social';
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface SiteSettings {
  siteName: string;
  logo?: string;
  primaryColor: string;
  announcement?: string;
  announcementType?: 'info' | 'warning' | 'success';
  contactEmail: string;
  contactPhone: string;
  aiApiKey?: string;
  features?: Feature[];
  socialLinks?: {
    whatsapp?: string;
    telegram?: string;
    facebook?: string;
    instagram?: string;
  };
  staffContacts: {
    secretary: { name: string; email: string; phone: string };
    sco: { name: string; email: string; phone: string };
    admin: { name: string; email: string; phone: string };
  };
}

export interface StaffProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'secretary' | 'sco';
  profilePicture?: string;
  occupation?: string;
  school?: string;
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
}
