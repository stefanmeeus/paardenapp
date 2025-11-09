import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ✅ Haal de gegevens dynamisch uit Netlify environment variables
const SUPABASE_URL =
  window?.SUPABASE_URL ||
  import.meta.env.SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://omxjdnxlcwewjneamnsk.supabase.co" // optionele fallback

const SUPABASE_ANON_KEY =
  window?.SUPABASE_ANON_KEY ||
  import.meta.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGpkbnhsY3dld2puZWFtbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTIwMzUsImV4cCI6MjA3ODEyODAzNX0.xQKC7Sfnuf1VrgdWsD0Hjc3rpPzeGIrzJ4mW6KyBIVs" // optionele fallback

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
