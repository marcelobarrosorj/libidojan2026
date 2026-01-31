
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://flljtgfsoikwueszhhhv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsbGp0Z2Zzb2lrd3Vlc3poaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODAyODYsImV4cCI6MjA3OTY1NjI4Nn0.oeSo_2w-lCw51HllGAkqYcugJZbVz5gf3wfQP-roacA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
