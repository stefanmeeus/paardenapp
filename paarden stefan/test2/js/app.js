import { Renderer } from "./ui/Renderer.js";
import { ModalManager } from "./ui/ModalManager.js";
import { loadData, saveData } from "./storage.js";

import { Paard } from "./classes/Paard.js";
import { Stal } from "./classes/Stal.js";
import { Voeding } from "./classes/Voeding.js";
import { Contact } from "./classes/Contact.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Paardenbeheer geladen");

  const tabContainer = document.getElementById("tab-container");
  const tiles = document.querySelectorAll(".tile");

  const renderer = new Renderer(tabContainer);
  const modals = new ModalManager();

  // Eventlisteners voor tegels
  tiles.forEach(tile => {
    tile.addEventListener("click", () => {
      if (tile.classList.contains("paarden")) renderer.showPaarden();
      else if (tile.classList.contains("stallen")) renderer.showStallen();
      else if (tile.classList.contains("voeding")) renderer.showVoeding();
      else if (tile.classList.contains("contacten")) renderer.showContacten();
    });
  });

  // Startscherm
  renderer.showDashboard();
});
