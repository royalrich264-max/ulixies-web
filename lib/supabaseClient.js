import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zofzrpigxontxfoedazx.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZnpycGlneG9udHhmb2VkYXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2OTA5OTQsImV4cCI6MjEwMzI2Njk5NH0.dZiwuLiINpXIVhh0sO6uuZE7x8zEKhKHOct4t3Gw1E4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);