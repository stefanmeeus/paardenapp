// public/js/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ✅ Gebruik environment-variabelen als ze bestaan (voor productie)
const SUPABASE_URL =
  window?.SUPABASE_URL ||
  (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_URL) ||
  "https://omxjdnxlcwewjneamnsk.supabase.co";

const SUPABASE_ANON_KEY =
  window?.SUPABASE_ANON_KEY ||
  (typeof import.meta !== "undefined" && import.meta.env?.SUPABASE_ANON_KEY) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9teGpkbnhsY3dld2puZWFtbnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NTIwMzUsImV4cCI6MjA3ODEyODAzNX0.xQKC7Sfnuf1VrgdWsD0Hjc3rpPzeGIrzJ4mW6KyBIVs";

// ⚠️ Log een waarschuwing als de variabelen ontbreken
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("⚠️ SUPABASE_URL of SUPABASE_ANON_KEY niet gezet. Controleer environment variables.");
}

// ✅ Maak Supabase client aan
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ Testverbinding (optioneel)
(async () => {
  const { data, error } = await supabase.from("paarden").select("id").limit(1);
  if (error) {
    console.error("❌ Fout bij verbinding met Supabase:", error.message);
  } else {
    console.log("✅ Verbonden met Supabase");
  }
})();
