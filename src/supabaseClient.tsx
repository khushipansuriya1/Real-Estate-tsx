import { createClient } from '@supabase/supabase-js';

// Define types for Supabase URL and Anon Key
const supabaseUrl: string = 'https://znyzyswzocugaxnuvupe.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueXp5c3d6b2N1Z2F4bnV2dXBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzk5NjgsImV4cCI6MjA2NzYxNTk2OH0.tjXam4d1oOG8fhaGy-tO89PHKx-TPC-L3vxt9UKrgRc';

// Create and export the Supabase client with explicit type
export const supabase = createClient(supabaseUrl, supabaseAnonKey);