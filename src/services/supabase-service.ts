/**
 * Supabase Service for Light House Academy
 * This service handles all database operations using Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../supabase-config';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types for our database tables
export interface DbStudent {
  id?: string;
  reg_number: string;
  full_name: string;
  email: string;
  phone: string;
  drama_group?: string;
  position?: string;
  country: string;
  state: string;
  passport?: string;
  sessions?: string[];
  is_leader?: boolean;
  created_at?: string;
  payment_receipt?: string;
  payment_status?: string;
  registration_approved?: boolean;
  registration_payment_receipt?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface DbSession {
  id?: string;
  name: string;
  description?: string;
  price?: string;
  status?: string;
  facilitator_name?: string;
  facilitator_image?: string;
  created_at?: string;
}

export interface DbSessionRegistration {
  id?: string;
  student_id: string;
  session_id: string;
  payment_receipt?: string;
  payment_verified?: boolean;
  certificate_file?: string;
  certificate_unlocked?: boolean;
  created_at?: string;
}

export interface DbMaterial {
  id?: string;
  name: string;
  file_data: string;
  uploaded_at?: string;
  session_id?: string;
}

export interface DbChatMessage {
  id?: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar?: string;
  content: string;
  type?: string;
  file_data?: string;
  file_name?: string;
  timestamp?: string;
  deleted?: boolean;
  edited?: boolean;
}

// ============ STUDENT OPERATIONS ============

export const studentService = {
  // Get all students
  async getAll() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get student by email
  async getByEmail(email: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  // Get student by registration number
  async getByRegNumber(regNumber: string) {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('reg_number', regNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Register new student
  async register(student: DbStudent) {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update student
  async update(id: string, updates: Partial<DbStudent>) {
    const { data, error } = await supabase
      .from('students')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Approve registration
  async approveRegistration(id: string, approvedBy: string) {
    const { data, error } = await supabase
      .from('students')
      .update({
        registration_approved: true,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get pending approvals
  async getPendingApprovals() {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('registration_approved', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};

// ============ SESSION OPERATIONS ============

export const sessionService = {
  // Get all sessions
  async getAll() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Get session by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Create new session
  async create(session: DbSession) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([session])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update session
  async update(id: string, updates: Partial<DbSession>) {
    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete session
  async delete(id: string) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============ SESSION REGISTRATION OPERATIONS ============

export const registrationService = {
  // Register student for a session
  async register(registration: DbSessionRegistration) {
    const { data, error } = await supabase
      .from('session_registrations')
      .insert([registration])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get registrations by student
  async getByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('session_registrations')
      .select('*, sessions(*)')
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data;
  },

  // Get registrations by session
  async getBySession(sessionId: string) {
    const { data, error } = await supabase
      .from('session_registrations')
      .select('*, students(*)')
      .eq('session_id', sessionId);
    
    if (error) throw error;
    return data;
  },

  // Verify payment
  async verifyPayment(id: string) {
    const { data, error } = await supabase
      .from('session_registrations')
      .update({ payment_verified: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Upload certificate
  async uploadCertificate(id: string, certificateFile: string) {
    const { data, error } = await supabase
      .from('session_registrations')
      .update({ 
        certificate_file: certificateFile,
        certificate_unlocked: true 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============ MATERIAL OPERATIONS ============

export const materialService = {
  // Get all materials
  async getAll() {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .order('uploaded_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Upload material
  async upload(material: DbMaterial) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete material
  async delete(id: string) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};

// ============ CHAT OPERATIONS ============

export const chatService = {
  // Get all messages
  async getMessages(limit = 100) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('deleted', false)
      .order('timestamp', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data?.reverse() || [];
  },

  // Send message
  async sendMessage(message: DbChatMessage) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Edit message
  async editMessage(id: string, content: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ content, edited: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete message
  async deleteMessage(id: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .update({ deleted: true })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Subscribe to new messages
  subscribeToMessages(callback: (message: DbChatMessage) => void) {
    const channel = supabase
      .channel('chat')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        (payload) => {
          callback(payload.new as DbChatMessage);
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// ============ SETTINGS OPERATIONS ============

export const settingsService = {
  // Get site settings
  async getSiteSettings() {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || { site_name: 'LIGHT HOUSE ACADEMY', logo: null };
  },

  // Update site settings
  async updateSiteSettings(settings: { site_name?: string; logo?: string }) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ id: 1, ...settings })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get chat settings
  async getChatSettings() {
    const { data, error } = await supabase
      .from('chat_settings')
      .select('*')
      .eq('id', 1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || {
      group_name: 'Light House Family',
      group_description: 'Welcome to Light House Academy family group chat.',
      allow_only_admin_send: false,
      allow_members_send: true
    };
  },

  // Update chat settings
  async updateChatSettings(settings: Partial<{
    group_name: string;
    group_description: string;
    allow_only_admin_send: boolean;
    allow_members_send: boolean;
  }>) {
    const { data, error } = await supabase
      .from('chat_settings')
      .upsert({ id: 1, ...settings })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============ STAFF OPERATIONS ============

export const staffService = {
  // Get all staff profiles
  async getAll() {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  // Get staff by role
  async getByRole(role: string) {
    const { data, error } = await supabase
      .from('staff_profiles')
      .select('*')
      .eq('role', role)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Update staff profile
  async updateProfile(role: string, profile: Partial<{
    name: string;
    picture: string;
    occupation: string;
    school: string;
    email: string;
    phone: string;
  }>) {
    const { data, error } = await supabase
      .from('staff_profiles')
      .update(profile)
      .eq('role', role)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

// ============ FILE STORAGE OPERATIONS ============

export const storageService = {
  // Upload file to Supabase Storage
  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    return data;
  },

  // Get public URL for a file
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Delete file
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  },

  // Create storage buckets (run once during setup)
  async createBuckets() {
    const buckets = ['materials', 'certificates', 'passports', 'receipts'];
    
    for (const bucket of buckets) {
      const { error } = await supabase.storage.createBucket(bucket, {
        public: true
      });
      
      if (error && !error.message?.includes('already exists')) {
        console.error(`Error creating bucket ${bucket}:`, error);
      }
    }
  }
};

// ============ INITIALIZATION ============

export const initializeDatabase = async () => {
  try {
    // Test connection
    const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    
    if (error && error.code === '42P01') {
      console.error('Tables not found. Please run the SQL schema in Supabase SQL editor first.');
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase database!');
    
    // Create storage buckets if they don't exist
    await storageService.createBuckets();
    console.log('✅ Storage buckets ready');
    
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

// Export the supabase client for direct use if needed
export default supabase;