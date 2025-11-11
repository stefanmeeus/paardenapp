import { ModalManager } from "./ModalManager.js";
import { loadData, saveData } from "../storage.js";
import { DataExchange } from "../export/DataExchange.js";
import { DocumentManager } from "../managers/DocumentManager.js";

export class Renderer {
  constructor(container) {
    this.container = container;
    this.modals = new ModalManager(this);
  }

  _hideAllTabs() {
    const tabs = document.querySelectorAll(".tab-content");
    tabs.forEach(t => {
      t.classList.remove("active", "fade-in");
      t.style.opacity = "0";
      t.style.display = "none";
      t.style.transition = "";
    });
  }

  _switchToTab(id) {
    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.style.display = "none";

    if (!this.container) {
      console.warn("⚠️ Renderer.container ontbreekt — controleer initialisatie.");
      return;
    }

    this.container.style.display = "block";
    this._hideAllTabs();

    const tab = document.getElementById(id);
    if (!tab) {
      console.warn(`⚠️ Tab met id "${id}" niet gevonden.`);
      return;
    }

    tab.style.display = "block";
    tab.style.opacity = "0";
    tab.style.transition = "none";
    void tab.offsetWidth;

    requestAnimationFrame(() => {
      tab.style.transition = "opacity 350ms ease-in-out";
      tab.style.opacity = "1";
      tab.classList.add("active", "fade-in");
    });
  }

  showDashboard() {
    document.getElementById("dashboard").style.display = "block";
    this.container.style.display = "none";
    this._hideAllTabs();
  }

  // -------------------------------------------------------
  // PAARDEN
  // -------------------------------------------------------
    showPaarden() {
    this._switchToTab("tab-paarden");

    let paarden = loadData("paarden") || [];
    let currentPage = 1;
    let pageSize = 4;
    let searchTerm = "";
    let sortAsc = true;

    const container = document.getElementById("tab-paarden");

    const render = () => {
      const filtered = paarden
        .filter(p => p.naam.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) =>
          sortAsc ? a.naam.localeCompare(b.naam) : b.naam.localeCompare(a.naam)
        );

      const totalPages = Math.ceil(filtered.length / pageSize);
      const offset = (currentPage - 1) * pageSize;
      const pageItems = filtered.slice(offset, offset + pageSize);

      const listHTML = pageItems.length
        ? `<div class="paard-grid">
            ${pageItems.map(p => `
              <div class="card paard-card" data-id="${p.id}">
                <h3>${p.naam}</h3>
                <p><strong>Eigenaar:</strong> ${p.eigenaar}</p>
                <p><strong>Dierenarts:</strong> ${p.dierenarts}</p>
              </div>`).join("")}
          </div>`
        : `<div class="empty-state">🚫 Geen paarden gevonden.</div>`;

      container.innerHTML = `
        <div class="tab-header">
          <button class="back-btn" id="backBtn">⬅ Terug</button>
          <h2>📁 Paarden</h2>
        </div>

        <div class="paarden-search-wrapper">
          <input type="text" id="searchInput" class="search-input" placeholder="Zoek op naam..." value="${searchTerm}" />
          <div class="page-size-wrapper">
            <label for="pageSizeSelect">Per pagina:</label>
            <select id="pageSizeSelect">
              ${[2, 4, 6, 10].map(n => `<option value="${n}" ${n === pageSize ? "selected" : ""}>${n}</option>`).join("")}
            </select>
          </div>
          <button id="sortBtn" class="btn-secondary">Sorteer: ${sortAsc ? "A → Z" : "Z → A"}</button>
          <button id="exportBtn" class="btn-secondary">📤 Exporteer</button>
          <button id="downloadTemplate" class="btn-secondary">📄 Sjabloon</button>
          <label class="btn-secondary" style="cursor: pointer;">
            📥 Importeren
            <input type="file" id="importInput" accept=".xlsx,.xls" style="display: none;" />
          </label>
          <button id="addPaard" class="btn-primary">+ Nieuw Paard</button>
        </div>

        ${listHTML}

        <div class="pagination">
          <button id="prevPage" ${currentPage === 1 ? "disabled" : ""}>◀</button>
          <span>Pagina ${currentPage} / ${totalPages || 1}</span>
          <button id="nextPage" ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}>▶</button>
        </div>
      `;

      document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());
      document.getElementById("addPaard").addEventListener("click", () => this.modals.openPaardForm(null, () => this.showPaarden()));
      document.getElementById("exportBtn").addEventListener("click", () => DataExchange.exportPaardenToExcel());
      document.getElementById("downloadTemplate").addEventListener("click", () => DataExchange.downloadPaardenTemplate());

      document.getElementById("importInput").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          await DataExchange.importPaardenFromExcel(file, () => this.showPaarden());
        }
      });

      container.querySelectorAll(".paard-card").forEach(card => {
        const id = parseInt(card.dataset.id);
        const paard = paarden.find(p => p.id === id);
        if (paard) {
          card.addEventListener("click", () => this.showPaardDetails(paard));
        }
      });

      document.getElementById("searchInput").addEventListener("input", e => {
        searchTerm = e.target.value;
        currentPage = 1;
        render();
      });

      document.getElementById("pageSizeSelect").addEventListener("change", e => {
        pageSize = parseInt(e.target.value);
        currentPage = 1;
        render();
      });

      document.getElementById("sortBtn").addEventListener("click", () => {
        sortAsc = !sortAsc;
        render();
      });

      document.getElementById("prevPage").addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          render();
        }
      });

      document.getElementById("nextPage").addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          render();
        }
      });
    };

    render();
  }


    showPaardDetails(paard) {
    const tab = document.getElementById("tab-paarden");

    tab.innerHTML = `
      <div class="tab-header">
        <button class="back-btn" id="backBtn">⬅ Terug</button>
        <h2>🐴 ${paard.naam}</h2>
      </div>

      <div class="card-details">
        <p><strong>Naam:</strong> ${paard.naam}</p>
        <p><strong>Leeftijd:</strong> ${paard.leeftijd}</p>
        <p><strong>Ras:</strong> ${paard.ras}</p>
        <p><strong>Stallocatie:</strong> ${paard.stallocatie}</p>
        <p><strong>Stalnr:</strong> ${paard.stalnr}</p>
        <p><strong>Training:</strong> ${paard.training ? "✅ Ja" : "❌ Nee"}</p>
        <p><strong>Trainer:</strong> ${paard.trainer}</p>
        <p><strong>Eigenaar:</strong> ${paard.eigenaar}</p>
        <p><strong>Dierenarts:</strong> ${paard.dierenarts}</p>
        <p><strong>Hoefsmid:</strong> ${paard.hoefsmid}</p>
        <p><strong>Vaccinatie:</strong> ${paard.vaccinatie}</p>
        <p><strong>Ontworming:</strong> ${paard.ontworming}</p>
        <p><strong>Opmerkingen:</strong> ${paard.opmerkingen || "–"}</p>
      </div>

      <div class="card-actions">
        <button id="editBtn" class="btn-primary">✏️ Bewerken</button>
        <button id="deleteBtn" class="btn-secondary">🗑️ Verwijderen</button>
      </div>

      <div class="card-docs">
        <h3>📁 Documenten</h3>
        <p><strong>📘 Paspoort:</strong> 
          ${paard.paspoort 
            ? `<a href="${paard.paspoort.data}" target="_blank">${paard.paspoort.name}</a>` 
            : "Geen document"}
        </p>

        <p><strong>🩺 Dierenartsverslagen:</strong></p>
        <ul>
          ${
            paard.verslagen && paard.verslagen.length
              ? paard.verslagen.map(doc => `<li><a href="${doc.data}" target="_blank">${doc.name}</a></li>`).join("")
              : "<li>Geen verslagen beschikbaar</li>"
          }
        </ul>
      </div>

      <div class="document-section">
        <h3>📂 Upload nieuwe documenten</h3>

        <div class="upload-group">
          <h4>📘 Paspoort (1 bestand)</h4>
          <div id="paspoortUpload"></div>
          <p class="upload-help">Toegestaan: PDF, JPG, PNG</p>
        </div>

        <div class="upload-group">
          <h4>🩺 Dierenartsverslagen (meerdere bestanden)</h4>
          <div id="verslagenUpload"></div>
          <p class="upload-help">Toegestaan: PDF, JPG, PNG</p>
        </div>
      </div>
    `;

    document.getElementById("backBtn").addEventListener("click", () => this.showPaarden());

    document.getElementById("editBtn").addEventListener("click", () => {
      this.modals.openPaardForm(paard, () => this.showPaarden());
    });

    document.getElementById("deleteBtn").addEventListener("click", () => {
      if (confirm(`❗ Weet je zeker dat je ${paard.naam} wilt verwijderen?`)) {
        const paarden = loadData("paarden") || [];
        const nieuwLijst = paarden.filter(p => p.id !== paard.id);
        saveData("paarden", nieuwLijst);
        this.showPaarden();
      }
    });

    const docMgr = new DocumentManager("paard", paard.id);

    docMgr.renderUploadUI(document.getElementById("paspoortUpload"), {
      type: "paspoort",
      max: 1,
      onUploadComplete: () => this.showPaardDetails(loadData("paarden").find(p => p.id === paard.id))
    });

    docMgr.renderUploadUI(document.getElementById("verslagenUpload"), {
      type: "verslag",
      multiple: true,
      onUploadComplete: () => this.showPaardDetails(loadData("paarden").find(p => p.id === paard.id))
    });
  }

// -------------------------------------------------------
// STALLEN
// -------------------------------------------------------
  showStallen() {
    this._switchToTab("tab-stallen");

    const stallenContainer = document.getElementById("tab-stallen");
    const locaties = loadData("locaties") || [];
    const stallen = loadData("stallen") || [];
    const paarden = loadData("paarden") || [];

    const render = () => {
      const listHTML = locaties.length
        ? `<div class="locatie-grid">
            ${locaties.map(loc => {
              const bijbehorendeStallen = stallen
                .filter(s => String(s.locatieId) === String(loc.id))
                .sort((a, b) => a.stalnr - b.stalnr);

              const stalHTML = bijbehorendeStallen.length
                ? `<div class="stal-grid" id="stallen-${loc.id}" style="display: none;">
                    <h4>${loc.naam.toUpperCase()}</h4>
                    ${bijbehorendeStallen.map(s => {
                      const paard = paarden.find(p => p.id === s.paardId);
                      return `
                        <div class="stal-card ${paard ? "met-paard" : ""}">
                          <strong>Stal ${s.stalnr}</strong>
                          ${paard ? `<span class="paard-badge">${paard.naam}</span>` : "<br/>—"}
                          <div class="stal-actions">
                            ${!paard ? `<button class="btn-secondary koppel-paard" data-id="${s.id}" data-locatie="${loc.naam}" data-stalnr="${s.stalnr}">🐴</button>` : ""}
                            <button class="btn-secondary delete-stal" data-id="${s.id}">🗑️</button>
                          </div>
                        </div>
                      `;
                    }).join("")}
                  </div>`
                : `<div class="stal-grid" id="stallen-${loc.id}" style="display: none;">
                    <h4>${loc.naam.toUpperCase()}</h4>
                    <div class="stal-card">Geen stallen</div>
                  </div>`;

              return `
                <div class="card locatie-card">
                  <div class="locatie-header">
                    <strong>${loc.naam}</strong>
                    <div class="locatie-actions">
                      <button class="btn-primary open-locatie" data-id="${loc.id}"><span class="arrow">▶</span> Open</button>
                      <button class="btn-secondary delete-locatie" data-id="${loc.id}">🗑️ Verwijderen</button>
                    </div>
                  </div>
                  ${stalHTML}
                </div>
              `;
            }).join("")}
          </div>`
        : `<div class="empty-state">🚫 Geen stallocaties gevonden.</div>`;

      stallenContainer.innerHTML = `
        <div class="tab-header">
          <button class="back-btn" id="backBtn">⬅ Terug</button>
          <h2>📁 Stallen</h2>
          <div class="stallen-actions">
            <button id="addLocatie" class="btn-secondary">+ Nieuwe locatie</button>
            <button id="addStalLos" class="btn-primary">+ Nieuwe stal</button>
            <button id="exportStallen" class="btn-secondary">📤 Export</button>
            <label class="btn-secondary" style="cursor: pointer;">
              📥 Import
              <input type="file" id="importStallen" accept=".xlsx,.xls" style="display: none;" />
            </label>
            <button id="downloadTemplateStallen" class="btn-secondary">📄 Sjabloon</button>
          </div>
        </div>
        ${listHTML}
      `;

      document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());
      document.getElementById("addLocatie").addEventListener("click", () => this.modals.openStalLocatieForm(null, () => this.showStallen()));
      document.getElementById("addStalLos").addEventListener("click", () => this.modals.openStalForm(null, null, () => this.showStallen()));

      document.querySelectorAll(".open-locatie").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.id;
          const section = document.getElementById(`stallen-${id}`);
          const isOpen = section.style.display === "block";
          section.style.display = isOpen ? "none" : "block";
          btn.classList.toggle("opened", !isOpen);
          btn.querySelector(".arrow").textContent = isOpen ? "▶" : "▼";
        });
      });

      document.querySelectorAll(".delete-locatie").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.id);
          if (confirm("❗ Verwijder deze locatie en ALLE stallen hieronder?")) {
            const nieuweLocaties = locaties.filter(l => l.id !== id);
            const nieuweStallen = stallen.filter(s => s.locatieId !== id);
            saveData("locaties", nieuweLocaties);
            saveData("stallen", nieuweStallen);
            this.showStallen();
          }
        });
      });

      document.querySelectorAll(".delete-stal").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = Number(btn.dataset.id);
          if (confirm("❗ Verwijder deze stal?")) {
            const nieuweStallen = stallen.filter(s => s.id !== id);
            const nieuwePaarden = paarden.map(p => {
              const s = stallen.find(st => st.id === id);
              if (s && p.stalnr === s.stalnr && p.stallocatie === s.locatienaam) {
                return { ...p, stallocatie: null, stalnr: null };
              }
              return p;
            });
            saveData("stallen", nieuweStallen);
            saveData("paarden", nieuwePaarden);
            this.showStallen();
          }
        });
      });

      document.querySelectorAll(".koppel-paard").forEach(btn => {
        btn.addEventListener("click", () => {
          const stalId = Number(btn.dataset.id);
          const locatieNaam = btn.dataset.locatie;
          const stalnr = parseInt(btn.dataset.stalnr);

          const vrijePaarden = paarden.filter(p => (!p.stalnr && !p.stallocatie));

          if (!vrijePaarden.length) {
            alert("❗ Geen beschikbare paarden om te koppelen.");
            return;
          }

          const keuze = prompt(`Kies een paard:\n\n${vrijePaarden.map((p, i) => `${i + 1}. ${p.naam}`).join("\n")}`);
          const index = parseInt(keuze) - 1;

          if (isNaN(index) || index < 0 || index >= vrijePaarden.length) return;

          const gekozen = vrijePaarden[index];
          gekozen.stallocatie = locatieNaam;
          gekozen.stalnr = stalnr;

          const stal = stallen.find(s => s.id === stalId);
          if (stal) stal.paardId = gekozen.id;

          saveData("paarden", paarden);
          saveData("stallen", stallen);
          this.showStallen();
        });
      });

      document.getElementById("exportStallen").addEventListener("click", () => {
        DataExchange.exportStallen(locaties, stallen, paarden);
      });

      document.getElementById("downloadTemplateStallen").addEventListener("click", () => {
        DataExchange.downloadStallenTemplate();
      });

      document.getElementById("importStallen").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file) {
          await DataExchange.importStallen(file, () => this.showStallen());
        }
      });
    };

    render();
  }
/// voeding////
  showVoeding() {
    this._switchToTab("tab-voeding");

    document.getElementById("tab-voeding").innerHTML = `
      <div class="tab-header">
        <button class="back-btn" id="backBtn">⬅ Terug</button>
        <h2>📁 Voeding</h2>
      </div>
      <p>Voedingsschema’s volgen...</p>
    `;

    document.getElementById("backBtn").addEventListener("click", () => {
      this.showDashboard();
    });
  }
////contacten///
  showContacten() {
    this._switchToTab("tab-contacten");

    document.getElementById("tab-contacten").innerHTML = `
      <div class="tab-header">
        <button class="back-btn" id="backBtn">⬅ Terug</button>
        <h2>📁 Contacten</h2>
      </div>
      <p>Contactpersonen volgen...</p>
    `;

    document.getElementById("backBtn").addEventListener("click", () => {
      this.showDashboard();
    });
  }

 
}

