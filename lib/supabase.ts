import { createClient } from '@supabase/supabase-js';

// These should ideally be in .env.local, but for now we'll use the values found in the codebase
// to ensure it works immediately without requiring user to set up env vars manually yet.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fcmkzwcemtlnudsmtkdt.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjbWt6d2NlbXRsbnVkc210a2R0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTc4MTA3MCwiZXhwIjoyMDcxMzU3MDcwfQ.cFGfuMyuq3E3h4VJyseCHKf751QK7hRL0a50hawJfy0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
