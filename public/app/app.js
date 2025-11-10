// public/js/app.js
// Robuuste versie van app.js - zorgt dat tegel-kliks altijd werken
import { Renderer } from "/js/ui/Renderer.js";
import { ModalManager } from "/js/ui/ModalManager.js";
import { loadData, saveData } from "/js/storage.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Paardenbeheer (public/js/app.js) geladen");

  // tab-container moet bestaan in app/index.html
  const tabContainer = document.getElementById("tab-container");
  if (!tabContainer) {
    console.warn("⚠️ #tab-container niet gevonden in DOM. Controleer app/index.html");
  }

  // Init renderer en modalmanager
  const renderer = new Renderer(tabContainer || document.createElement("div"));
  renderer.modals = new ModalManager(renderer);

  // Algemene klik-delegatie: alle .tile elementen met data-tab
  const tiles = Array.from(document.querySelectorAll(".tile[data-tab]"));
  if (!tiles.length) {
    console.warn("⚠️ Geen .tile[data-tab] elementen gevonden. Controleer class/data-tab in HTML.");
  }

  tiles.forEach(tile => {
    const tabName = tile.dataset.tab?.trim();
    if (!tabName) return;

    tile.addEventListener("click", () => {
      console.log(`🧱 Tile geklikt: ${tabName}`);
      switch (tabName) {
        case "paarden":
          renderer.showPaarden?.();
          break;
        case "stallen":
          renderer.showStallen?.();
          break;
        case "voeding":
          renderer.showVoeding?.();
          break;
        case "contacten":
          renderer.showContacten?.();
          break;
        case "vaccinatie":
          renderer.showVaccinatie?.();
          break;
        case "contracten":
          renderer.showContracten?.();
          break;
        case "trainingen":
          renderer.showTrainingen?.();
          break;
        default:
          console.warn(`ℹ️ Geen handler voor tile data-tab="${tabName}" gevonden.`);
      }
    });
  });

  // Zorg dat we het dashboard tonen als startpunt
  if (renderer.showDashboard) {
    renderer.showDashboard();
  } else {
    console.warn("⚠️ renderer.showDashboard niet beschikbaar.");
  }

  // -------------------------------------------
  // ✅ Renderer globaal maken voor click handlers en debug
  // -------------------------------------------
  window.renderer = renderer;
  console.log("✅ Renderer is nu beschikbaar in window:", window.renderer);
});

// handig voor debugging vanuit console
window.loadData = loadData;
window.saveData = saveData;
