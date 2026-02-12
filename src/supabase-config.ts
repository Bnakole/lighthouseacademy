/**
 * Supabase Configuration for Light House Academy
 * 
 * To set up your free Supabase backend:
 * 
 * 1. Go to https://supabase.com and create a free account
 * 2. Create a new project (choose a region close to your users)
 * 3. Go to Settings > API and copy your Project URL and anon/public API key
 * 4. Replace the placeholders below with your actual values
 * 
 * 5. Run these SQL commands in the Supabase SQL editor to create the tables:
 */

// ============ SUPABASE CONFIGURATION ============
// Your Supabase credentials are now configured
export const SUPABASE_URL = 'https://iqiowjdyjqjnboxdnkir.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaW93amR5anFqbmJveGRua2lyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4Nzk1MzQsImV4cCI6MjA4NjQ1NTUzNH0.YDwsYtW1m4tYj0UKplSUVcoLz_5H0G2wDr5vnbL9oII';

// ============ SQL SCHEMA FOR SUPABASE ============
/*
Copy and run this SQL in your Supabase SQL editor:

-- Students table
CREATE TABLE students (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reg_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  drama_group VARCHAR(255),
  position VARCHAR(50),
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  passport TEXT,
  sessions TEXT[] DEFAULT '{}',
  is_leader BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  payment_receipt TEXT,
  payment_status VARCHAR(20) DEFAULT 'unverified',
  registration_approved BOOLEAN DEFAULT false,
  registration_payment_receipt TEXT,
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price VARCHAR(50) DEFAULT 'Free',
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('open', 'closed', 'upcoming', 'ongoing')),
  facilitator_name VARCHAR(255),
  facilitator_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Session Registrations table
CREATE TABLE session_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  payment_receipt TEXT,
  payment_verified BOOLEAN DEFAULT false,
  certificate_file TEXT,
  certificate_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(student_id, session_id)
);

-- Materials table
CREATE TABLE materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_data TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE
);

-- Chat Messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(50) NOT NULL,
  sender_avatar TEXT,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text' CHECK (type IN ('text', 'image', 'voice', 'document', 'video')),
  file_data TEXT,
  file_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  deleted BOOLEAN DEFAULT false,
  edited BOOLEAN DEFAULT false
);

-- Staff Profiles table
CREATE TABLE staff_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  role VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  picture TEXT,
  occupation VARCHAR(255),
  school VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50)
);

-- Site Settings table
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  site_name VARCHAR(255) DEFAULT 'LIGHT HOUSE ACADEMY',
  logo TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Chat Settings table
CREATE TABLE chat_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  group_name VARCHAR(255) DEFAULT 'Light House Family',
  group_description TEXT DEFAULT 'Welcome to Light House Academy family group chat.',
  allow_only_admin_send BOOLEAN DEFAULT false,
  allow_members_send BOOLEAN DEFAULT true,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default staff profiles
INSERT INTO staff_profiles (role, name) VALUES 
  ('Admin', 'Admin'),
  ('Secretary', 'Secretary'),
  ('SCO', 'Student Coordinator');

-- Insert default site settings
INSERT INTO site_settings (id) VALUES (1);

-- Insert default chat settings
INSERT INTO chat_settings (id) VALUES (1);

-- Insert default session
INSERT INTO sessions (name, description, price, status) VALUES 
  ('2026 Two Weeks Training', 'Online Training program for drama and theater arts.', 'Free', 'open');

-- Create indexes for better performance
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_reg_number ON students(reg_number);
CREATE INDEX idx_session_registrations_student ON session_registrations(student_id);
CREATE INDEX idx_session_registrations_session ON session_registrations(session_id);
CREATE INDEX idx_materials_session ON materials(session_id);
CREATE INDEX idx_chat_messages_timestamp ON chat_messages(timestamp DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (customize as needed)
CREATE POLICY "Public read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON materials FOR SELECT USING (true);
CREATE POLICY "Public read access" ON chat_messages FOR SELECT USING (true);
CREATE POLICY "Public read access" ON staff_profiles FOR SELECT USING (true);
CREATE POLICY "Public read access" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON chat_settings FOR SELECT USING (true);

-- Students can read their own data
CREATE POLICY "Students read own data" ON students 
  FOR SELECT USING (email = current_setting('app.current_user_email', true));

-- Allow inserts for registration
CREATE POLICY "Allow registration" ON students 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow session registration" ON session_registrations 
  FOR INSERT WITH CHECK (true);

-- Allow all operations for admin (you'll need to implement auth)
CREATE POLICY "Admin full access" ON students FOR ALL USING (true);
CREATE POLICY "Admin full access" ON sessions FOR ALL USING (true);
CREATE POLICY "Admin full access" ON session_registrations FOR ALL USING (true);
CREATE POLICY "Admin full access" ON materials FOR ALL USING (true);
CREATE POLICY "Admin full access" ON chat_messages FOR ALL USING (true);
CREATE POLICY "Admin full access" ON staff_profiles FOR ALL USING (true);
CREATE POLICY "Admin full access" ON site_settings FOR ALL USING (true);
CREATE POLICY "Admin full access" ON chat_settings FOR ALL USING (true);
*/

// ============ USAGE INSTRUCTIONS ============
/*
To use Supabase in the application:

1. Install the Supabase client:
   npm install @supabase/supabase-js

2. Import and initialize in your store.ts:
   import { createClient } from '@supabase/supabase-js'
   import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config'
   
   const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

3. Replace localStorage operations with Supabase queries:
   
   // Example: Get students
   const { data: students, error } = await supabase
     .from('students')
     .select('*')
   
   // Example: Register student
   const { data, error } = await supabase
     .from('students')
     .insert([studentData])
     .select()
   
   // Example: Update session
   const { error } = await supabase
     .from('sessions')
     .update({ status: 'open' })
     .eq('id', sessionId)

4. Set up real-time subscriptions for chat:
   
   const subscription = supabase
     .channel('chat')
     .on('postgres_changes', 
       { event: 'INSERT', schema: 'public', table: 'chat_messages' },
       (payload) => {
         // Handle new message
       }
     )
     .subscribe()

5. For file uploads (images, documents), use Supabase Storage:
   
   const { data, error } = await supabase.storage
     .from('materials')
     .upload(`public/${fileName}`, file)
   
   // Get public URL
   const { data: { publicUrl } } = supabase.storage
     .from('materials')
     .getPublicUrl(`public/${fileName}`)

BENEFITS OF USING SUPABASE:
- Free tier includes 500 MB database, 1 GB file storage, 50,000 monthly active users
- Real-time subscriptions for instant updates
- Built-in authentication (can replace current login system)
- Automatic backups
- PostgreSQL database with full SQL support
- RESTful API auto-generated from your schema
- Row Level Security for data protection
- Works seamlessly with React
*/

export const initializeSupabase = () => {
  console.log('Supabase configuration ready.');
  console.log('Please follow the instructions in supabase-config.ts to set up your backend.');
  console.log('Visit https://supabase.com to create your free account.');
};