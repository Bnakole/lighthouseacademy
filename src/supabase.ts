import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gxdbhfceujjmlvgmxtgi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4ZGJoZmNldWpqbWx2Z214dGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0ODQ2MDYsImV4cCI6MjA4NjA2MDYwNn0.DExIh9YIoZaCcSnKW8pZt7uH7_E-MooJKieSWaAk1zk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return true; // Supabase is now configured
};
