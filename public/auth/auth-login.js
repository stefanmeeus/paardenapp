// ✅ Correcte import — één map omhoog naar /public/js/supabaseClient.js
import { supabase } from "../js/supabaseClient.js";

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
    message.style.color = "red";
    message.textContent = "❗ Vul alle velden in.";
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    message.style.color = "red";
    message.textContent = "❌ " + error.message;
  } else {
    message.style.color = "green";
    message.textContent = "✅ Ingelogd, even geduld...";

    // ⏩ Stuur correct door naar de hoofdapp
    setTimeout(() => {
      // Aangezien alles in /public zit:
      window.location.href = "../app/index.html";
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
