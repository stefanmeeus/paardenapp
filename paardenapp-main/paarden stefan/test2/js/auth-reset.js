// js/auth-reset.js
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// --- Vul hier je Supabase projectgegevens in ---
const SUPABASE_URL = "https://YOUR-PROJECT.supabase.co"; // <- vervang
const SUPABASE_ANON_KEY = "eyJhbGci...";                // <- vervang

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById("resetForm");
const passwordInput = document.getElementById("newPassword");
const feedback = document.getElementById("feedback");

function showFeedback(msg, isError = true) {
  feedback.textContent = msg;
  feedback.style.color = isError ? "#b23" : "#196619";
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = passwordInput.value.trim();

  if (newPassword.length < 6) {
    return showFeedback("Wachtwoord moet minstens 6 tekens bevatten.");
  }

  showFeedback("Wachtwoord wordt bijgewerkt...", false);

  // Update het wachtwoord van de ingelogde user via Supabase Auth
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    console.error(error);
    showFeedback("Fout bij bijwerken wachtwoord: " + error.message);
    return;
  }

  showFeedback("Wachtwoord succesvol gewijzigd!", false);

  // Automatisch terug naar loginpagina na korte delay
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1500);
});
