import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// 🔗 Vul hieronder je eigen gegevens in (zie Supabase > Settings > API)
const SUPABASE_URL = "https://omxjdnxlcwewjneamnsk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGpkbnhsY3dld2puZWFtbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTIwMzUsImV4cCI6MjA3ODEyODAzNX0.xQKC7Sfnuf1VrgdWsD0Hjc3rpPzeGIrzJ4mW6KyBIVs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
