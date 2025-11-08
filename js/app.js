// ✅ app.js

import { Renderer } from "./ui/Renderer.js";
import { ModalManager } from "./ui/ModalManager.js";
import { loadData, saveData } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Paardenbeheer geladen");

  // 🔹 Haal het tab-container element op
  const tabContainer = document.getElementById("tab-container");

  // 🔹 Initialiseer Renderer
  const renderer = new Renderer(tabContainer);

  // 🔹 Injecteer ModalManager mét referentie naar renderer
  renderer.modals = new ModalManager(renderer);

  // 🔹 Klikken op dashboard-tegels => juiste tab tonen
  document.querySelector(".tile.paarden").addEventListener("click", () => {
    renderer.showPaarden();
  });

  document.querySelector(".tile.stallen").addEventListener("click", () => {
    renderer.showStallen();
  });

  document.querySelector(".tile.voeding").addEventListener("click", () => {
    renderer.showVoeding();
  });

  document.querySelector(".tile.contacten").addEventListener("click", () => {
    renderer.showContacten();
  });

  // 🔹 Startscherm tonen
  renderer.showDashboard();
});
window.loadData = loadData;
window.saveData = saveData;
