// Renderer.js

import { ModalManager } from "./ModalManager.js";
import { loadData, saveData } from "../storage.js";
import { DataExchange } from "../export/DataExchange.js";
import { DocumentManager } from "../managers/DocumentManager.js";
import { renderKaart,renderKaartActies,renderDetailKaart } from "./CardTemplates.js";

export class Renderer {
  constructor(container) {
    this.container = container;
    this.modals = new ModalManager(this);
  }

  // ✅ Herbruikbare kaart-renderer voor een paard
  static renderPaardKaart(paard) {
    return renderKaart({ type: "paard", data: paard });
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
  //--------------------------------------------------------
  //Dashbord
  //--------------------------------------------------------
  showDashboard() {
    console.log("🏠 Dashboard tonen");

    const dashboard = document.getElementById("dashboard");
    const tabContainer = document.getElementById("tab-container");

    if (!dashboard) {
        console.error("❌ Element #dashboard bestaat niet!");
        return;
    }

    // Dashboard terug tonen
    dashboard.style.display = "block";
    dashboard.classList.add("active");

    // Tabs verbergen
    tabContainer.style.display = "none";
}

// -------------------------------------------------------
  // PAARDEN
  // -------------------------------------------------------

  showPaarden() {

  this._switchToTab("tab-paarden");
  

  const paarden = loadData("paarden") || [];
  let currentPage = 1;
  let pageSize = 4;
  let searchTerm = "";
  let sortAsc = true;

  const container = document.getElementById("tab-paarden");
  container.innerHTML = "";

  // === HEADER
  const header = document.createElement("div");
  header.className = "tab-header";

  const backBtn = document.createElement("button");
  backBtn.className = "back-btn";
  backBtn.textContent = "⬅ Terug";
  backBtn.addEventListener("click", () => this.showDashboard());

  const title = document.createElement("h2");
  title.innerHTML = `<img src="../img/icons/Paard.png" class="kaart-icon-lg" /> Paarden`;

  header.append(backBtn, title);
  container.appendChild(header);

  // === TOOLBAR
  const toolbar = document.createElement("div");
  toolbar.className = "kaart-toolbar";

  // Zoekveld
  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "search-input";
  searchInput.placeholder = "Zoek op naam...";
  searchInput.value = searchTerm;
  searchInput.addEventListener("input", e => {
    searchTerm = e.target.value;
    currentPage = 1;
    render();
  });

  // Page size dropdown
  const pageSizeWrapper = document.createElement("div");
  pageSizeWrapper.className = "page-size-wrapper";
  pageSizeWrapper.innerHTML = `
    <label for="pageSizeSelect">Per pagina:</label>
    <select id="pageSizeSelect">
      ${[2, 4, 6, 10].map(n =>
        `<option value="${n}" ${n === pageSize ? "selected" : ""}>${n}</option>`
      ).join("")}
    </select>
  `;
  pageSizeWrapper.querySelector("select").addEventListener("change", e => {
    pageSize = parseInt(e.target.value);
    currentPage = 1;
    render();
  });

  // Sorteerknop
  const sortBtn = document.createElement("button");
  sortBtn.className = "btn-secondary";
  sortBtn.textContent = `Sorteer: ${sortAsc ? "A → Z" : "Z → A"}`;
  sortBtn.addEventListener("click", () => {
    sortAsc = !sortAsc;
    sortBtn.textContent = `Sorteer: ${sortAsc ? "A → Z" : "Z → A"}`;
    render();
  });

  // Export
  const exportBtn = document.createElement("button");
  exportBtn.className = "btn-secondary";
  exportBtn.textContent = "📤 Exporteer";
  exportBtn.addEventListener("click", () =>
    DataExchange.exportPaardenToExcel()
  );

  // Template (lege Excel)
  const templateBtn = document.createElement("button");
  templateBtn.className = "btn-secondary";
  templateBtn.textContent = "📄 Sjabloon";
  templateBtn.addEventListener("click", () =>
    DataExchange.downloadPaardenTemplate()
  );

  // Import
  const importLabel = document.createElement("label");
  importLabel.className = "btn-secondary";
  importLabel.innerHTML = `
    📥 Importeren
    <input type="file" accept=".xlsx,.xls" style="display:none;" />
  `;
  importLabel.querySelector("input").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (file) {
      await DataExchange.importPaardenFromExcel(file, () => this.showPaarden());
    }
  });

  // Nieuw paard
  const addBtn = document.createElement("button");
  addBtn.className = "btn-primary";
  addBtn.textContent = "+ Nieuw Paard";
  addBtn.addEventListener("click", () =>
    this.modals.openPaardForm(null, () => this.showPaarden())
  );

  // Toolbar toevoegen
  toolbar.append(
    searchInput,
    pageSizeWrapper,
    sortBtn,
    exportBtn,
    templateBtn,
    importLabel,
    addBtn
  );
  container.appendChild(toolbar);

  // === LIJST
  const listContainer = document.createElement("div");
  listContainer.id = "paardenList";
  container.appendChild(listContainer);

  const pagination = document.createElement("div");
  pagination.className = "pagination";
  container.appendChild(pagination);

  // === RENDER FUNCTIE
  const render = () => {
    listContainer.innerHTML = "";
    pagination.innerHTML = "";

    const filtered = paarden
      .filter(p => p.naam.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) =>
        sortAsc ? a.naam.localeCompare(b.naam) : b.naam.localeCompare(a.naam)
      );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const offset = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(offset, offset + pageSize);

    if (pageItems.length === 0) {
      const leeg = document.createElement("div");
      leeg.className = "empty-state";
      leeg.textContent = "🚫 Geen paarden gevonden.";
      listContainer.appendChild(leeg);
    } else {
      const grid = document.createElement("div");
      grid.className = "paard-grid";

      pageItems.forEach(paard => {
        const kaart = renderKaart({
          type: "paard",
          data: paard
        });

        // ✅ Actieknoppen (bewerken/verwijderen)
        const acties = renderKaartActies({
          onEdit: () => this.modals.openPaardForm(paard, () => this.showPaarden()),
          onDelete: () => {
            if (confirm(`❗ Weet je zeker dat je ${paard.naam} wilt verwijderen?`)) {
              const nieuwLijst = paarden.filter(p => p.id !== paard.id);
              saveData("paarden", nieuwLijst);
              paarden.splice(0, paarden.length, ...nieuwLijst);
              render();
            }
          }
        });

        kaart.appendChild(acties);

        // Detailweergave openen bij klik op kaart
        kaart.addEventListener("click", () => this.showPaardDetails(paard));

        grid.appendChild(kaart);
      });

      listContainer.appendChild(grid);
    }

    // === PAGINERING
    const prev = document.createElement("button");
    prev.textContent = "◀";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        render();
      }
    });

    const next = document.createElement("button");
    next.textContent = "▶";
    next.disabled = currentPage >= totalPages;
    next.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        render();
      }
    });

    const info = document.createElement("span");
    info.textContent = `Pagina ${currentPage} / ${totalPages || 1}`;

    pagination.append(prev, info, next);
  };

  render();
}

showPaardDetails(paard) {
  console.log("✅ showPaardDetails geladen voor paard:", paard.naam);

  const tab = document.getElementById("tab-paarden");
  tab.innerHTML = "";

  // 🔙 Header
  const header = document.createElement("div");
  header.className = "tab-header";
  header.innerHTML = `
    <button class="back-btn" id="backBtn">⬅ Terug</button>
    <h2>🐴 ${paard.naam}</h2>
  `;
  tab.appendChild(header);

  // ✅ Acties
  const acties = renderKaartActies({
    onEdit: () => this.modals.openPaardForm(paard, () => this.showPaarden()),
    onDelete: () => {
      if (confirm(`❗ Weet je zeker dat je ${paard.naam} wilt verwijderen?`)) {
        const lijst = loadData("paarden") || [];
        const gefilterd = lijst.filter(p => p.id !== paard.id);
        saveData("paarden", gefilterd);
        this.showPaarden();
      }
    }
  });

  // ✅ Zet booleans om naar emoji
  if (paard.training !== undefined) {
    paard.training = paard.training ? "✅ Ja" : "❌ Nee";
  }

  // 🐴 GEGEVENSKAART
  const velden = [
    "leeftijd", "ras", "stallocatie", "stalnr", "training", "trainer",
    "eigenaar", "dierenarts", "hoefsmid", "vaccinatie", "ontworming", "opmerkingen"
  ];

  const gegevensKaart = renderDetailKaart({
    type: "paard",
    data: paard,
    velden
  });

  gegevensKaart.querySelector(".kaart-body").appendChild(acties);
  tab.appendChild(gegevensKaart);

  // 📁 DOCUMENTEN-KAART
  const documentenKaart = document.createElement("div");
  documentenKaart.className = "kaart kaart-paarden";
  documentenKaart.innerHTML = `<div class="kaart-header">📁 Documenten</div>`;

  const documentenBody = document.createElement("div");
  documentenBody.className = "kaart-body";

  const paspoort = document.createElement("p");
  paspoort.innerHTML = `<strong>📘 Paspoort:</strong> ${
    paard.paspoort
      ? `<a href="${paard.paspoort.data}" target="_blank">${paard.paspoort.name}</a>`
      : "Geen document"
  }`;
  documentenBody.appendChild(paspoort);

  const verslagenTitel = document.createElement("p");
  verslagenTitel.innerHTML = `<strong>🩺 Dierenartsverslagen:</strong>`;
  documentenBody.appendChild(verslagenTitel);

  const verslagenContainer = document.createElement("div");
  const verslagenPerJaar = {};

  (paard.verslagen || []).forEach(doc => {
    const jaar = doc.jaar || "Onbekend";
    if (!verslagenPerJaar[jaar]) verslagenPerJaar[jaar] = [];
    verslagenPerJaar[jaar].push(doc);
  });

  if (Object.keys(verslagenPerJaar).length > 0) {
    Object.keys(verslagenPerJaar)
      .sort((a, b) => b - a)
      .forEach(jaar => {
        const mapHeader = document.createElement("div");
        mapHeader.innerHTML = `<strong>📁 ${jaar}</strong>`;

        const ul = document.createElement("ul");
        verslagenPerJaar[jaar].forEach(doc => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="${doc.data}" target="_blank">${doc.name}</a>`;
          ul.appendChild(li);
        });

        verslagenContainer.appendChild(mapHeader);
        verslagenContainer.appendChild(ul);
      });
  } else {
    verslagenContainer.innerHTML = "<p>Geen verslagen beschikbaar</p>";
  }

  documentenBody.appendChild(verslagenContainer);
  documentenKaart.appendChild(documentenBody);
  tab.appendChild(documentenKaart);

  // ⬆️ UPLOAD-KAART
  const uploadKaart = document.createElement("div");
  uploadKaart.className = "kaart kaart-paarden";
  uploadKaart.innerHTML = `
    <div class="kaart-header">📤 Upload nieuwe documenten</div>
    <div class="kaart-body">
      <div class="upload-choice">
        <label><input type="radio" name="uploadType" value="paspoort" checked /> 📘 Paspoort</label>
        <label><input type="radio" name="uploadType" value="verslagen" /> 🩺 Dierenartsverslagen</label>
      </div>
      <div id="uploadZone" class="upload-dropzone"></div>
      <p class="upload-help">Sleep hier een bestand in of klik<br><small>Toegestaan: PDF, JPG, PNG</small></p>
    </div>
  `;
  tab.appendChild(uploadKaart);

  // 🔁 Upload logica
  const docMgr = new DocumentManager("paard", paard.id);
  const uploadZone = uploadKaart.querySelector("#uploadZone");

  const renderUpload = (type) => {
    docMgr.renderUploadUI(uploadZone, {
      type: type === "paspoort" ? "paspoort" : "verslag",
      multiple: type === "verslagen",
      onUploadComplete: () => {
        const herladen = loadData("paarden").find(p => p.id === paard.id);
        this.showPaardDetails(herladen);
      }
    });
  };

  renderUpload("paspoort");

  uploadKaart.querySelectorAll('input[name="uploadType"]').forEach(radio =>
    radio.addEventListener("change", e => renderUpload(e.target.value))
  );

  // ⬅️ Terug
  header.querySelector("#backBtn").addEventListener("click", () => this.showPaarden());
}


  // -------------------------------------------------------
  // Contacten
  // -------------------------------------------------------
 showContacten() {
  this._switchToTab("tab-contacten");

  let contacten = loadData("contacten") || [];
  let currentPage = 1;
  let pageSize = 4;
  let searchTerm = "";
  let sortAsc = true;

  const container = document.getElementById("tab-contacten");

  const render = () => {
    const filtered = contacten
      .filter(c => `${c.Voornaam} ${c.Achternaam}`.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) =>
        sortAsc ? a.Voornaam.localeCompare(b.Voornaam) : b.Voornaam.localeCompare(a.Voornaam)
      );

    const totalPages = Math.ceil(filtered.length / pageSize);
    const offset = (currentPage - 1) * pageSize;
    const pageItems = filtered.slice(offset, offset + pageSize);

    const listHTML = pageItems.length
      ? `<div class="contact-grid">
          ${pageItems.map(c => `
            <div class="card contact-card" data-id="${c.id}">
              <h3>${c.Voornaam} ${c.Achternaam}</h3>
              <p><strong>Email:</strong> ${c.Email}</p>
              <p><strong>Telefoon:</strong> ${c.Telefoon}</p>
              <p><strong>Rol:</strong> ${c.rol}</p>
            </div>
          `).join("")}
        </div>`
      : `<div class="empty-state">🚫 Geen contacten gevonden.</div>`;

    container.innerHTML = `
      <div class="tab-header">
        <button class="back-btn" id="backBtn">⬅ Terug</button>
        <h2>📇 Contacten</h2>
      </div>

      <div class="contacten-search-wrapper">
        <input type="text" id="searchInput" class="search-input" placeholder="Zoek op voornaam of achternaam..." value="${searchTerm}" />
        
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
        <button id="addContact" class="btn-primary">+ Nieuw Contact</button>
      </div>

      ${listHTML}

      <div class="pagination">
        <button id="prevPage" ${currentPage === 1 ? "disabled" : ""}>◀</button>
        <span>Pagina ${currentPage} / ${totalPages || 1}</span>
        <button id="nextPage" ${currentPage === totalPages || totalPages === 0 ? "disabled" : ""}>▶</button>
      </div>
    `;

    document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());
    document.getElementById("addContact").addEventListener("click", () => this.modals.openContactForm(null, () => this.showContacten()));
    document.getElementById("exportBtn").addEventListener("click", () => DataExchange.exportContactenToExcel());
    document.getElementById("downloadTemplate").addEventListener("click", () => DataExchange.downloadContactenTemplate());

    document.getElementById("importInput").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (file) {
        await DataExchange.importContactenFromExcel(file, () => this.showContacten());
      }
    });

    container.querySelectorAll(".contact-card").forEach(card => {
      const id = parseInt(card.dataset.id);
      const contact = contacten.find(c => c.id === id);
      if (contact) {
        card.addEventListener("click", () => this.showContactDetails(contact));
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

showContactDetails(contact) {
  const tab = document.getElementById("tab-contacten");

  tab.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>👤 ${contact.Voornaam} ${contact.Achternaam}</h2>
    </div>

    <div class="card-details">
      <p><strong>Voornaam:</strong> ${contact.Voornaam}</p>
      <p><strong>Achternaam:</strong> ${contact.Achternaam}</p>
      <p><strong>Telefoon:</strong> ${contact.Telefoon}</p>
      <p><strong>Email:</strong> ${contact.Email}</p>
      <p><strong>Adres:</strong> ${contact.Adres}</p>
      <p><strong>Rol:</strong> ${contact.rol}</p>
      <p><strong>Paardnaam:</strong> ${contact.Paardnaam}</p>
      <p><strong>Klant-ID:</strong> ${contact.klant_ID}</p>
    </div>

    <div class="card-actions">
      <button id="editBtn" class="btn-primary">✏️ Bewerken</button>
      <button id="deleteBtn" class="btn-secondary">🗑️ Verwijderen</button>
    </div>

    <div class="card-docs">
      <h3>📁 Contracten</h3>
      <ul>
        ${
          contact.contract && contact.contract.length
            ? contact.contract.map(doc => `<li><a href="${doc.data}" target="_blank">${doc.name}</a></li>`).join("")
            : "<li>Geen contracten beschikbaar</li>"
        }
      </ul>
    </div>

    <div class="document-section">
      <h3>📂 Upload nieuwe contracten</h3>
      <div class="upload-group">
        <h4>📝 Contracten (meerdere bestanden)</h4>
        <div id="contractUpload"></div>
        <p class="upload-help">Toegestaan: PDF, JPG, PNG</p>
      </div>
    </div>
  `;

  // 🔙 Terugknop
  document.getElementById("backBtn").addEventListener("click", () => this.showContacten());

  // ✏️ Bewerken
  document.getElementById("editBtn").addEventListener("click", () => {
    this.modals.openContactForm(contact, () => this.showContacten());
  });

  // 🗑️ Verwijderen
  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (confirm(`❗ Weet je zeker dat je ${contact.Voornaam} ${contact.Achternaam} wilt verwijderen?`)) {
      const contacten = loadData("contacten") || [];
      const nieuwLijst = contacten.filter(c => c.id !== contact.id);
      saveData("contacten", nieuwLijst);
      this.showContacten();
    }
  });

  // 📂 Upload contracten
  const docMgr = new DocumentManager("contact", contact.id);

  docMgr.renderUploadUI(document.getElementById("contractUpload"), {
    type: "contract",
    multiple: true,
    onUploadComplete: () => {
      const updated = loadData("contacten").find(c => c.id === contact.id);
      this.showContactDetails(updated);
    }
  });
}

  // -------------------------------------------------------
  // Voeding
  // -------------------------------------------------------
  showVoeding() {
  this._switchToTab("tab-voeding");

  const container = document.getElementById("tab-voeding");
  const voedingLijst = loadData("voeding") || [];
  const paarden = loadData("paarden") || [];

  const standaardVoeding = voedingLijst.find(v => !v.paardId);
  const individueleVoedingen = voedingLijst.filter(v => v.paardId);

  const getPaardNaam = (id) => {
    const paard = paarden.find(p => String(p.id) === String(id));
    return paard?.naam || "❓ Onbekend paard";
  };

  const renderVoedingBlok = (titel, voeding) => `
    <div class="voeding-blok">
      <h3>${titel}</h3>
      <p><strong>Ochtend:</strong> ${voeding.ochtend || "-"}</p>
      <p><strong>Middag:</strong> ${voeding.middag || "-"}</p>
      <p><strong>Avond:</strong> ${voeding.avond || "-"}</p>
      <p><strong>Supplementen:</strong></p>
      <ul>
        <li><strong>Ochtend:</strong> ${voeding.supplementen?.ochtend || "-"}</li>
        <li><strong>Middag:</strong> ${voeding.supplementen?.middag || "-"}</li>
        <li><strong>Avond:</strong> ${voeding.supplementen?.avond || "-"}</li>
      </ul>
      <button class="btn-secondary edit-voeding-btn" data-id="${voeding.id}">✏️ Bewerken</button>
    </div>
  `;

  container.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>🍽️ Voedingsschema’s</h2>
    </div>

    ${standaardVoeding ? renderVoedingBlok("🌐 Standaard voeding", standaardVoeding) : `
      <div class="empty-state">
        ⚠️ Geen standaard voeding ingesteld.
        <button class="btn-primary" id="addStandaardVoeding">+ Voeg standaard voeding toe</button>
      </div>
    `}

    <div class="voeding-paarden-lijst">
      <h3>🐴 Individuele paarden</h3>
      ${individueleVoedingen.length
        ? individueleVoedingen.map(v =>
            renderVoedingBlok(getPaardNaam(v.paardId), v)
          ).join("")
        : `<p>Geen individuele voedingsschema’s.</p>`
      }
    </div>

    <div class="voeding-acties">
      <button class="btn-primary" id="addIndividueleVoeding">+ Voeg paard-specifieke voeding toe</button>
    </div>
  `;

  // 🔙 Terug
  document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());

  // ➕ Standaard voeding
  const standaardBtn = document.getElementById("addStandaardVoeding");
  if (standaardBtn) {
    standaardBtn.addEventListener("click", () => {
      this.modals.openVoedingForm(null, () => this.showVoeding(), true); // isStandaard = true
    });
  }

  // ➕ Individueel
  document.getElementById("addIndividueleVoeding").addEventListener("click", () => {
    this.modals.openVoedingForm(null, () => this.showVoeding(), false); // isStandaard = false
  });

  // ✏️ Bewerken
  container.querySelectorAll(".edit-voeding-btn").forEach(btn => {
    const id = btn.dataset.id;
    const item = [...individueleVoedingen, standaardVoeding].find(v => v.id === id);
    if (item) {
      btn.addEventListener("click", () => {
        const isStandaard = !item.paardId;
        this.modals.openVoedingForm(item, () => this.showVoeding(), isStandaard);
      });
    }
  });
}
showVoedingDetails(voeding) {
  const container = document.getElementById("tab-voeding");

  const paard = loadData("paarden")?.find(p => String(p.id) === String(voeding.paardId));

  container.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>🍽️ Voeding - ${paard?.naam || "Onbekend paard"}</h2>
    </div>

    <div class="card-details">
      <h3>🕒 Voeding</h3>
      <p><strong>Ochtend:</strong> ${voeding.ochtend || "-"}</p>
      <p><strong>Middag:</strong> ${voeding.middag || "-"}</p>
      <p><strong>Avond:</strong> ${voeding.avond || "-"}</p>

      <h3>💊 Supplementen</h3>
      <p><strong>Ochtend:</strong> ${voeding.supplementen?.ochtend || "-"}</p>
      <p><strong>Middag:</strong> ${voeding.supplementen?.middag || "-"}</p>
      <p><strong>Avond:</strong> ${voeding.supplementen?.avond || "-"}</p>
    </div>

    <div class="card-actions">
      <button id="editBtn" class="btn-primary">✏️ Bewerken</button>
      <button id="deleteBtn" class="btn-secondary">🗑️ Verwijderen</button>
    </div>
  `;

  document.getElementById("backBtn").addEventListener("click", () => this.showVoeding());

  document.getElementById("editBtn").addEventListener("click", () => {
    this.modals.openVoedingForm(voeding, () => this.showVoeding());
  });

  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (confirm(`❗ Weet je zeker dat je de voeding voor ${paard?.naam} wilt verwijderen?`)) {
      const lijst = loadData("voeding") || [];
      const nieuw = lijst.filter(v => v.id !== voeding.id);
      saveData("voeding", nieuw);
      this.showVoeding();
    }
  });
}
showStandaardVoeding() {
  const container = document.getElementById("tab-voeding");
  const voedingLijst = loadData("voeding") || [];
  const standaard = voedingLijst.find(v => !v.paardId);

  container.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>🍽️ Standaard Voeding</h2>
    </div>

    ${standaard ? `
      <div class="card-details">
        <h3>🕒 Voeding</h3>
        <p><strong>Ochtend:</strong> ${standaard.ochtend || "-"}</p>
        <p><strong>Middag:</strong> ${standaard.middag || "-"}</p>
        <p><strong>Avond:</strong> ${standaard.avond || "-"}</p>

        <h3>💊 Supplementen</h3>
        <p><strong>Ochtend:</strong> ${standaard.supplementen?.ochtend || "-"}</p>
        <p><strong>Middag:</strong> ${standaard.supplementen?.middag || "-"}</p>
        <p><strong>Avond:</strong> ${standaard.supplementen?.avond || "-"}</p>
      </div>

      <div class="card-actions">
        <button id="editBtn" class="btn-primary">✏️ Bewerken</button>
      </div>
    ` : `
      <div class="empty-state">
        🚫 Nog geen standaard voeding ingesteld.
      </div>

      <div class="card-actions">
        <button id="addBtn" class="btn-primary">+ Nieuwe Standaard Voeding</button>
      </div>
    `}
  `;

  document.getElementById("backBtn").addEventListener("click", () => this.showVoeding());

  if (standaard) {
    document.getElementById("editBtn").addEventListener("click", () => {
      this.modals.openVoedingForm(standaard, () => this.showStandaardVoeding(), true);
    });
  } else {
    document.getElementById("addBtn").addEventListener("click", () => {
      this.modals.openVoedingForm(null, () => this.showStandaardVoeding(), true);
    });
  }
}

  // -------------------------------------------------------
  // Medicatie
  // -------------------------------------------------------
 showMedicatie() {
  this._switchToTab("tab-medicatie");

  const medicatieLijst = loadData("medicatie") || [];
  const paarden = loadData("paarden") || [];

  const actievePaarden = paarden.filter(p => p.actief !== false);
  const vandaag = new Date().toISOString().split("T")[0];

  const container = document.getElementById("tab-medicatie");

  const paardenMetActieveMedicatie = actievePaarden.map(paard => {
    const meds = medicatieLijst
      .filter(m => String(m.paardId) === String(paard.id))
      .filter(m => !m.eindDatum || m.eindDatum >= vandaag); // Alleen actieve

    return meds.length ? { paard, meds } : null;
  }).filter(Boolean);

  const listHTML = paardenMetActieveMedicatie.length
    ? `<div class="kaart-lijst">
        ${paardenMetActieveMedicatie.map(({ paard, meds }) => `
          <div class="card card-click" data-id="${paard.id}">
            <h3>💊 ${paard.naam}</h3>
            <ul>
              ${meds.map(m => `
                <li>
                  <strong>${m.medicatie}</strong> — Start: ${m.startDatum}, Dosering: ${m.dosering}
                </li>
              `).join("")}
            </ul>
          </div>
        `).join("")}
      </div>`
    : `<div class="empty-state">🚫 Geen actieve medicatie gevonden.</div>`;

  container.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>💊 Medicatie</h2>
    </div>

    <div class="paarden-search-wrapper">
      <button id="addBtn" class="btn-primary">+ Nieuwe Medicatie</button>
    </div>

    ${listHTML}
  `;

  // ⬅ Terug
  document.getElementById("backBtn").addEventListener("click", () => this.showDashboard());

  // ➕ Toevoegen
  document.getElementById("addBtn").addEventListener("click", () => {
    this.modals.openMedicatieForm(null, () => this.showMedicatie());
  });

  // 📄 Kaart aanklikken = toon alle medicatie van paard
  container.querySelectorAll(".card-click").forEach(card => {
    const paardId = card.dataset.id;
    const paard = paarden.find(p => String(p.id) === paardId);
    if (paard) {
      card.addEventListener("click", () => this.showMedicatieDetails(paard));
    }
  });
}
showMedicatieDetails(paard) {
  const container = document.getElementById("tab-medicatie");
  const medicatieLijst = loadData("medicatie") || [];

  const meds = medicatieLijst.filter(m => String(m.paardId) === String(paard.id));

  container.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backBtn">⬅ Terug</button>
      <h2>💊 Medicatie - ${paard.naam}</h2>
    </div>

    ${meds.length === 0
      ? `<p>Geen medicaties voor dit paard.</p>`
      : meds.map(m => `
          <div class="card">
            <h3>${m.medicatie}</h3>
            <p><strong>Start:</strong> ${m.startDatum}</p>
            <p><strong>Eind:</strong> ${m.eindDatum || "–"}</p>
            <p><strong>Dosering:</strong> ${m.dosering}</p>
            <p><strong>Frequentie:</strong> ${m.frequentie || "–"}</p>
            <p><strong>Toediening:</strong> ${m.toediening || "–"}</p>
            <p><strong>Voorgeschreven door:</strong> ${m.voorgeschrevenDoor || "–"}</p>
            <p><strong>Opmerking:</strong> ${m.opmerking || "–"}</p>

            <div class="card-actions">
              <button class="btn-primary edit-btn" data-id="${m.id}">✏️ Bewerken</button>
              <button class="btn-secondary delete-btn" data-id="${m.id}">🗑️ Verwijderen</button>
            </div>
          </div>
        `).join("")}
  `;

  // ⬅ Terug
  document.getElementById("backBtn").addEventListener("click", () => this.showMedicatie());

  // ✏️ Bewerken
  container.querySelectorAll(".edit-btn").forEach(btn => {
    const id = parseInt(btn.dataset.id);
    const item = medicatieLijst.find(m => m.id === id);
    if (item) {
      btn.addEventListener("click", () => {
        this.modals.openMedicatieForm(item, () => this.showMedicatieDetails(paard));
      });
    }
  });

  // 🗑️ Verwijderen
  container.querySelectorAll(".delete-btn").forEach(btn => {
    const id = parseInt(btn.dataset.id);
    btn.addEventListener("click", () => {
      if (confirm("❗ Weet je zeker dat je deze medicatie wilt verwijderen?")) {
        const nieuwLijst = medicatieLijst.filter(m => m.id !== id);
        saveData("medicatie", nieuwLijst);
        this.showMedicatieDetails(paard);
      }
    });
  });
}
    // -------------------------------------------------------
   // Voederen
  // -------------------------------------------------------
showVoederen() {
  this._switchToTab("tab-voederen");

  const locaties = loadData("locaties") || [];
  const stallen = loadData("stallen") || [];
  const paarden = loadData("paarden") || [];

  const voederenList = document.getElementById("voederenList");

  // Groepeer stallen per locatie met gekoppelde paarden
  const locatieKaarten = locaties
    .map(loc => {
      const stallenInLocatie = stallen.filter(s => s.locatieId === loc.id && paarden.some(p => p.id === s.paardId));
      if (stallenInLocatie.length === 0) return null;

      return `
        <div class="card locatie-card" data-id="${loc.id}">
          <h3>${loc.naam}</h3>
          <p>${stallenInLocatie.length} stal(len) met paarden</p>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  voederenList.innerHTML = locatieKaarten || `<div class="empty-state">Geen locaties met paarden gevonden.</div>`;

  // Klikken op locatiekaart → toon stallen met paarden
  document.querySelectorAll(".locatie-card").forEach(card => {
    card.addEventListener("click", () => {
      const locatieId = card.dataset.id;
      this.showVoederenStallen(locatieId);
    });
  });

  document.getElementById("back-voederen").addEventListener("click", () => this.showDashboard());
}
showVoederenStallen(locatieId) {
  const locaties = loadData("locaties") || [];
  const stallen = loadData("stallen") || [];
  const paarden = loadData("paarden") || [];

  const locatie = locaties.find(l => l.id === locatieId);
  const stallenInLoc = stallen.filter(s => s.locatieId === locatieId && s.paardId);
  const voederenList = document.getElementById("voederenList");

  const kaarten = stallenInLoc
    .map(stal => {
      const paard = paarden.find(p => p.id === stal.paardId);
      return `
        <div class="card stal-card" data-id="${stal.id}">
          <h3>Stal ${stal.stalnr}</h3>
          <p>${paard ? paard.naam : "Geen paard"}</p>
        </div>
      `;
    })
    .join("");

  voederenList.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backToLocaties">⬅ Terug</button>
      <h2>${locatie.naam}</h2>
    </div>
    <div class="kaart-lijst">${kaarten}</div>
  `;

  document.getElementById("backToLocaties").addEventListener("click", () => this.showVoederen());

  document.querySelectorAll(".stal-card").forEach(card => {
    card.addEventListener("click", () => {
      const stalId = parseInt(card.dataset.id);
      const stal = stallen.find(s => s.id === stalId);
      const paard = paarden.find(p => p.id === stal.paardId);
      if (paard) this.showVoederenDetails(paard);
    });
  });
}
showVoederenDetails(paard) {
  const voederingen = loadData("voeding") || [];
  const medicaties = loadData("medicatie") || [];

  const standaardVoeding = voederingen.find(v => !v.paardId);
  const paardVoeding = voederingen.find(v => v.paardId === paard.id) || standaardVoeding;

  const actieveMedicatie = medicaties.filter(m =>
    m.paardId === paard.id &&
    (!m.eindDatum || new Date(m.eindDatum) >= new Date())
  );

  const voederenList = document.getElementById("voederenList");

  const medicatieHTML = actieveMedicatie.length
    ? actieveMedicatie.map(m => `
        <div class="mini-card">
          <strong>${m.medicatie}</strong><br />
          ${m.dosering} – ${m.frequentie}
        </div>
      `).join("")
    : "<p>Geen actieve medicatie</p>";

  voederenList.innerHTML = `
    <div class="tab-header">
      <button class="back-btn" id="backToStallen">⬅ Terug</button>
      <h2>🐴 ${paard.naam}</h2>
    </div>

    <div class="card">
      <h3>🍽️ Voeding</h3>
      <p><strong>Ochtend:</strong> ${paardVoeding.ochtend || "–"}</p>
      <p><strong>Middag:</strong> ${paardVoeding.middag || "–"}</p>
      <p><strong>Avond:</strong> ${paardVoeding.avond || "–"}</p>

      <h4>💊 Medicatie</h4>
      <div class="kaart-lijst">
        ${medicatieHTML}
      </div>
    </div>
  `;

  document.getElementById("backToStallen").addEventListener("click", () => {
    const stal = (loadData("stallen") || []).find(s => s.paardId === paard.id);
    if (stal) this.showVoederenStallen(stal.locatieId);
    else this.showVoederen(); // fallback
  });
}
}

