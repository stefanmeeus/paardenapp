// js/app.js
import { Renderer } from "./ui/Renderer.js";
import { loadData, saveData, addPaard, getPaarden } from "./storage.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Paardenbeheer geladen");

  const tiles = document.querySelectorAll(".tile");
  const tabContainer = document.getElementById("tab-container");
  const renderer = new Renderer();

  const modalPaard = document.getElementById("modalPaard");
  const opslaanPaardBtn = document.getElementById("opslaanPaard");
  const sluitPaardBtn = document.getElementById("sluitPaard");

  const naamField = document.getElementById("paardNaam");
  const rasField = document.getElementById("paardRas");
  const leeftijdField = document.getElementById("paardLeeftijd");
  const stalField = document.getElementById("paardStal");

  function openPaardModal() {
    modalPaard.style.display = "flex";
    document.body.classList.add("modal-open");
    naamField.focus();
  }

  function closePaardModal() {
    modalPaard.style.display = "none";
    document.body.classList.remove("modal-open");
    naamField.value = "";
    rasField.value = "";
    leeftijdField.value = "";
    stalField.value = "";
  }

  if (sluitPaardBtn) sluitPaardBtn.addEventListener("click", closePaardModal);
  window.addEventListener("click", e => {
    if (e.target === modalPaard) closePaardModal();
  });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") closePaardModal();
  });

  // Huidige sectie (welk tabblad actief is)
  let currentTab = null;

  /** Render lijst met paarden */
  function renderPaardenLijst() {
    const paarden = getPaarden();
    const listHtml = paarden.length
      ? `<ul>${paarden.map(p => `
            <li>
              <strong>${p.naam}</strong> (${p.ras || "onbekend"}) – ${p.leeftijd || "-"} jaar
            </li>`).join("")}</ul>`
      : "<p>Er zijn nog geen paarden toegevoegd.</p>";

    const refs = renderer.renderSection(tabContainer, "Paarden", listHtml, true, "Nieuw Paard");
    if (refs.addBtn) {
      refs.addBtn.addEventListener("click", openPaardModal);
    }
  }

  /** Opslaan paard */
  if (opslaanPaardBtn) {
    opslaanPaardBtn.addEventListener("click", () => {
      const naam = naamField.value.trim();
      if (!naam) {
        alert("Vul minstens de naam van het paard in.");
        return;
      }
      const nieuwPaard = {
        naam,
        ras: rasField.value.trim(),
        leeftijd: parseInt(leeftijdField.value.trim() || "0"),
        stal: stalField.value.trim()
      };
      addPaard(nieuwPaard);
      console.log("💾 Paard toegevoegd:", nieuwPaard);
      closePaardModal();
      renderPaardenLijst();
    });
  }

  /** Klik op tiles */
  tiles.forEach(tile => {
    tile.addEventListener("click", () => {
      const type = tile.classList.contains("paarden") ? "paarden"
                 : tile.classList.contains("stallen") ? "stallen"
                 : tile.classList.contains("voeding") ? "voeding"
                 : "contacten";

      currentTab = type;
      console.log("🔷 Tile geklikt:", type);

      if (type === "paarden") {
        renderPaardenLijst();
      } else {
        renderer.showTab(tabContainer, type);
      }
    });
  });

  renderer.showDashboard(tabContainer);
});
