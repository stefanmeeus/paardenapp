import { supabase } from "./supabaseClient.js";

const form = document.getElementById("login-form");
const message = document.getElementById("message");
const forgotPassword = document.getElementById("forgot-password");

// 🟢 LOGIN FUNCTIE
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.textContent = "";

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    message.textContent = "Vul alle velden in.";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    message.textContent = "❌ " + error.message;
  } else {
    message.style.color = "green";
    message.textContent = "✅ Ingelogd, even geduld...";
    // ⏩ Stuur door naar de hoofdapp
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
  }
});

// 🩹 WACHTWOORD VERGETEN
forgotPassword.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = prompt("Vul je e-mailadres in om een resetlink te ontvangen:");
  if (!email) return;

  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    alert("❌ " + error.message);
  } else {
    alert("📩 Controleer je e-mail voor de resetlink.");
  }
});
