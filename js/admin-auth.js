// js/admin-auth.js
import { supabase } from "./supabaseClient.js";

// ✳️ VERVANG dit door jouw echte admin-e-mailadres
const SUPERADMIN_EMAIL = "stefan@jouwdomein.be";

document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 🔹 Huidige gebruiker ophalen
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) throw error;

    // 🔹 Als er geen user is, terug naar login
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    // 🔹 Alleen superadmin mag toegang
    if (user.email !== SUPERADMIN_EMAIL) {
      alert("⛔ Je hebt geen toegang tot deze pagina.");
      await supabase.auth.signOut();
      window.location.href = "login.html";
      return;
    }

    console.log("✅ Superadmin herkend:", user.email);

    // 🔹 Toon naam/e-mail rechtsboven
    const naamSpan = document.getElementById("admin-naam");
    if (naamSpan) {
      naamSpan.textContent = `Welkom, ${user.email === SUPERADMIN_EMAIL ? "Stefan (Super Admin)" : user.email}`;
    }

    // 🔹 Voeg uitlog-knop toe in header (naast naam)
    const header = document.querySelector("header");
    if (header) {
      const logoutBtn = document.createElement("button");
      logoutBtn.textContent = "Uitloggen";
      logoutBtn.classList.add("logout-btn");
      logoutBtn.addEventListener("click", async () => {
        await supabase.auth.signOut();
        window.location.href = "login.html";
      });
      header.appendChild(logoutBtn);
    }

  } catch (err) {
    console.error("Fout bij authenticatie:", err);
    window.location.href = "login.html";
  }
});
