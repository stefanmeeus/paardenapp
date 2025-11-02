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
    document.querySelectorAll(".tab-content").forEach(tab => {
      tab.classList.remove("active", "fade-in");
      tab.style.display = "none";
    });
  }

  _switchToTab(id) {
    document.getElementById("dashboard").style.display = "none";
    this.container.style.display = "block";
    this._hideAllTabs();
    const tab = document.getElementById(id);
    if (tab) {
      tab.classList.add("active", "fade-in");
      tab.style.display = "block";
    }
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
        .sort((a, b) => {
          if (a.naam < b.naam) return sortAsc ? -1 : 1;
          if (a.naam > b.naam) return sortAsc ? 1 : -1;
          return 0;
        });

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
              </div>
            `).join("")}
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
      document.getElementById("addPaard").addEventListener("click", () => {
        this.modals.openPaardForm(null, () => this.showPaarden());
      });

      document.getElementById("exportBtn").addEventListener("click", () => {
        DataExchange.exportPaardenToExcel();
      });

      document.getElementById("downloadTemplate").addEventListener("click", () => {
        DataExchange.downloadPaardenTemplate();
      });

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
  // -------------------------------------------------------
// STALLEN
// -------------------------------------------------------
showStallen() {
  this._switchToTab("tab-stallen");

  const stallenContainer = document.getElementById("tab-stallen");
  const locaties = loadData("locaties") || [];

  const render = () => {
    const listHTML = locaties.length
      ? `<div class="locatie-grid">
          ${locaties.map(loc => `
            <div class="card locatie-card" data-id="${loc.id}">
              <h3>${loc.naam}</h3>
              <button class="btn-primary view-btn" data-id="${loc.id}">📂 Bekijk</button>
              <button class="btn-secondary edit-btn" data-id="${loc.id}">✏️</button>
              <button class="btn-secondary delete-btn" data-id="${loc.id}">🗑️</button>
            </div>
          `).join("")}
        </div>`
      : `<div class="empty-state">🚫 Geen stallocaties gevonden.</div>`;

    stallenContainer.innerHTML = `
      <div class="tab-header">
        <button class="back-btn" id="backBtn">⬅ Terug</button>
        <h2>📁 Stallen</h2>
        <div class="stallen-actions">
          <button id="addLocatie" class="btn-secondary">+ Nieuwe locatie</button>
          <button id="addStalLos" class="btn-primary">+ Nieuwe stal</button>
        </div>
      </div>

      ${listHTML}
    `;

    document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());

    document.getElementById("addLocatie").addEventListener("click", () => {
      this.modals.openStalLocatieForm(null, () => this.showStallen());
    });

    document.getElementById("addStalLos").addEventListener("click", () => {
      // Wanneer zonder locatie, toont modal dropdown
      this.modals.openStalForm(null, null, () => this.showStallen());
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const locatie = locaties.find(l => l.id === btn.dataset.id);
        this.modals.openStalLocatieForm(locatie, () => this.showStallen());
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("❗ Weet je zeker dat je deze locatie wilt verwijderen?")) {
          const nieuw = locaties.filter(l => l.id !== id);
          saveData("locaties", nieuw);
          this.showStallen();
        }
      });
    });

    document.querySelectorAll(".view-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const locatieId = parseInt(btn.dataset.id);
        const locatie = locaties.find(l => l.id === locatieId);

        if (locatie) {
          this.showStallenVoorLocatie(locatie);
        } else {
          alert("⚠️ Locatie niet gevonden.");
        }
      });
    });
  };

  render();
}
}


    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const locatie = locaties.find(l => l.id === btn.dataset.id);
        this.modals.openStalLocatieForm(locatie, () => this.showStallen());
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        if (confirm("❗ Weet je zeker dat je deze locatie wilt verwijderen?")) {
          const nieuw = locaties.filter(l => l.id !== id);
          saveData("locaties", nieuw);
          this.showStallen();
        }
      });
    });

    document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const locatieId = parseInt(btn.dataset.id);
    const locatie = locaties.find(l => l.id === locatieId);
    if (locatie) {
      this.showStallenVoorLocatie(locatie);
    } else {
      alert("⚠️ Locatie niet gevonden.");
    }
  });
});

  };

  render();
}


  showStallenVoorLocatie(locatie) {
  this._switchToTab("tab-stallen");

  const stallen = loadData("stallen") || [];
  const paarden = loadData("paarden") || [];

  // 🔧 Zorg dat locatie.naam en stal.locatienaam exact overeenkomen
  const bijbehorendeStallen = stallen.filter(s => s.locatienaam === locatie.naam);

  const listHTML = bijbehorendeStallen.length
    ? `<div class="stal-grid">
        ${bijbehorendeStallen.map(s => {
          const paard = paarden.find(p => p.stallocatie === s.locatienaam && p.stalnr === s.stalnr);
          return `
            <div class="card stal-card">
              <h3>Stal ${s.stalnr}</h3>
              <p><strong>Paard:</strong> ${paard ? paard.naam : "Geen"}</p>
              <button class="btn-secondary edit-stal" data-id="${s.id}">✏️</button>
              <button class="btn-secondary delete-stal" data-id="${s.id}">🗑️</button>
            </div>
          `;
        }).join("")}
      </div>`
    : `<div class="empty-state">🚫 Geen stallen in deze locatie.</div>`;

  const tab = document.getElementById("tab-stallen");

  tab.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backToLocaties">⬅ Terug</button>
      <h2>📦 ${locatie.naam}</h2>
      <div class="stallen-actions">
        <button id="addStal" class="btn-primary">+ Nieuwe stal</button>
      </div>
    </div>

    ${listHTML}
  `;

  document.getElementById("backToLocaties").addEventListener("click", () => {
    this.showStallen();
  });

  document.getElementById("addStal").addEventListener("click", () => {
    // 🛠️ Belangrijk: geef locatie object door zodat locatienaam goed wordt ingevuld
    this.modals.openStalForm(null, locatie, () => this.showStallenVoorLocatie(locatie));
  });

  document.querySelectorAll(".edit-stal").forEach(btn => {
    btn.addEventListener("click", () => {
      const stallen = loadData("stallen") || [];
      const stal = stallen.find(s => s.id === btn.dataset.id);
      this.modals.openStalForm(stal, locatie, () => this.showStallenVoorLocatie(locatie));
    });
  });

  document.querySelectorAll(".delete-stal").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (confirm("❗ Weet je zeker dat je deze stal wilt verwijderen?")) {
        const stallen = loadData("stallen") || [];
        const nieuw = stallen.filter(s => s.id !== id);
        saveData("stallen", nieuw);
        this.showStallenVoorLocatie(locatie);
      }
    });
  });
}


  // -------------------------------------------------------
  // OVERIGE TABS
  // -------------------------------------------------------
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
