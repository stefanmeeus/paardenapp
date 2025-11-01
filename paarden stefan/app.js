// ---- Data opslag ----
let paarden = JSON.parse(localStorage.getItem("paarden")) || [];
let stallen = JSON.parse(localStorage.getItem("stallen")) || [];
let voeding = JSON.parse(localStorage.getItem("voeding")) || {};
let training = JSON.parse(localStorage.getItem("training")) || {};
let medicatie = JSON.parse(localStorage.getItem("medicatie")) || {};

// ---- Hulp-functies ----
function saveData() {
  localStorage.setItem("paarden", JSON.stringify(paarden));
  localStorage.setItem("stallen", JSON.stringify(stallen));
  localStorage.setItem("voeding", JSON.stringify(voeding));
  localStorage.setItem("training", JSON.stringify(training));
  localStorage.setItem("medicatie", JSON.stringify(medicatie));
}

// ---- DOM references (modal inputs etc.) ----
const modalPaard = document.getElementById("modalPaard");
const modalStal = document.getElementById("modalStal");

const inpPaardNaam = document.getElementById("paardNaam");
const inpPaardRas = document.getElementById("paardRas");
const inpPaardLeeftijd = document.getElementById("paardLeeftijd");
const selPaardStal = document.getElementById("paardStal");
const btnOpslaanPaard = document.getElementById("opslaanPaard");

const inpStalNaam = document.getElementById("stalNaam");
const inpStalLocatie = document.getElementById("stalLocatie");
const btnOpslaanStal = document.getElementById("opslaanStal");

const addBtn = document.getElementById("addBtn");

// Controls that will be dynamically created for paarden (filter & search)
let filterStalSelect = null;
let searchPaardInput = null;

// ---- UI helpers: create filter/search controls if not present ----
function ensurePaardenControls() {
  const paardenSection = document.getElementById("tab-paarden");
  if (!paardenSection) return;

  // If controls already exist, keep refs
  if (document.getElementById("paardenControls")) {
    filterStalSelect = document.getElementById("filterStal");
    searchPaardInput = document.getElementById("searchPaard");
    return;
  }

  // Build controls container
  const controls = document.createElement("div");
  controls.id = "paardenControls";
  controls.style.display = "flex";
  controls.style.flexWrap = "wrap";
  controls.style.gap = "10px";
  controls.style.alignItems = "center";
  controls.style.marginBottom = "12px";

  // Filter label + select
  const lblFilter = document.createElement("label");
  lblFilter.htmlFor = "filterStal";
  lblFilter.style.fontWeight = "600";
  lblFilter.textContent = "Filter op stal:";
  const sel = document.createElement("select");
  sel.id = "filterStal";
  sel.style.padding = "6px";
  sel.style.borderRadius = "6px";

  // Search label + input
  const lblSearch = document.createElement("label");
  lblSearch.htmlFor = "searchPaard";
  lblSearch.style.fontWeight = "600";
  lblSearch.style.marginLeft = "8px";
  lblSearch.textContent = "Zoek (naam of ras):";
  const inp = document.createElement("input");
  inp.id = "searchPaard";
  inp.placeholder = "Typ om te zoeken...";
  inp.style.padding = "6px";
  inp.style.borderRadius = "6px";
  inp.style.minWidth = "200px";

  // Append to controls
  controls.appendChild(lblFilter);
  controls.appendChild(sel);
  controls.appendChild(lblSearch);
  controls.appendChild(inp);

  // Insert at top of paarden section (before paardenList)
  const paardenList = document.getElementById("paardenList");
  if (paardenList) {
    paardenSection.insertBefore(controls, paardenList);
  } else {
    paardenSection.appendChild(controls);
  }

  // Save refs and events
  filterStalSelect = sel;
  searchPaardInput = inp;

  filterStalSelect.addEventListener("change", () => renderPaarden());
  searchPaardInput.addEventListener("input", () => renderPaarden());

  updateFilterDropdown();
}

// ---- Dropdown updates ----
function updateStalDropdown() {
  if (!selPaardStal) return;
  // Clear and repopulate
  selPaardStal.innerHTML = '<option value="">-- Kies een stal --</option>';
  stallen.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.naam;
    opt.textContent = s.naam;
    selPaardStal.appendChild(opt);
  });
}

function updateFilterDropdown() {
  if (!filterStalSelect) return;
  filterStalSelect.innerHTML = '<option value="">Alle stallen</option>';
  stallen.forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.naam;
    opt.textContent = s.naam;
    filterStalSelect.appendChild(opt);
  });
}

// ---- Rendering functies ----
function renderPaarden() {
  ensurePaardenControls(); // ensure controls exist

  const div = document.getElementById("paardenList");
  if (!div) return;

  if (paarden.length === 0) {
    div.innerHTML = "<div class='card'>Nog geen paarden toegevoegd.</div>";
    return;
  }

  const geselecteerdeStal = filterStalSelect ? filterStalSelect.value : "";
  const zoekterm = searchPaardInput ? searchPaardInput.value.toLowerCase().trim() : "";

  div.innerHTML = "";

  // iterate original array so indexes are stable
  let anyShown = false;
  paarden.forEach((p, idx) => {
    const stalMatch = !geselecteerdeStal || p.stal === geselecteerdeStal;
    const zoekMatch =
      !zoekterm ||
      p.naam.toLowerCase().includes(zoekterm) ||
      (p.ras && p.ras.toLowerCase().includes(zoekterm));

    if (!(stalMatch && zoekMatch)) return;

    anyShown = true;

    const card = document.createElement("div");
    card.className = "card";
    // Build stal dropdown (options)
    let stalOptionsHtml = `<option value="-">Geen stal</option>`;
    stallen.forEach(s => {
      const sel = p.stal === s.naam ? "selected" : "";
      stalOptionsHtml += `<option value="${s.naam}" ${sel}>${s.naam}</option>`;
    });

    // Use data-index to refer to original paarden array index
    card.innerHTML = `
      <strong>${escapeHtml(p.naam)}</strong><br>
      Ras: ${escapeHtml(p.ras || "-")}<br>
      Leeftijd: ${escapeHtml(p.leeftijd || "-")}<br>
      Stal:
      <select data-index="${idx}" class="stal-select">
        ${stalOptionsHtml}
      </select><br>
      <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn-delete" data-index="${idx}">Verwijderen</button>
      </div>
    `;

    div.appendChild(card);
  });

  if (!anyShown) {
    div.innerHTML = "<div class='card'>Geen paarden gevonden voor deze selectie.</div>";
    return;
  }

  // attach event listeners for newly created selects and delete buttons
  div.querySelectorAll(".stal-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      const nieuweStal = e.target.value;
      paarden[index].stal = nieuweStal;
      saveData();
      renderStallen(); // update stal overzicht
      // no need to rerender paarden here (select already changed visually)
    });
  });

  div.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      deletePaard(index);
    });
  });
}

function renderStallen() {
  const div = document.getElementById("stallenList");
  if (!div) return;
  if (stallen.length === 0) {
    div.innerHTML = "<div class='card'>Nog geen stallen toegevoegd.</div>";
    updateStalDropdown();
    updateFilterDropdown();
    return;
  }

  div.innerHTML = "";
  stallen.forEach((s, i) => {
    const paardenInStal = paarden.filter(p => p.stal === s.naam);
    const lijst = paardenInStal.length > 0 ? paardenInStal.map(p => escapeHtml(p.naam)).join(", ") : "Geen paarden in deze stal.";
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${escapeHtml(s.naam)}</strong><br>
      Locatie: ${escapeHtml(s.locatie || "-")}<br>
      <em>Paarden:</em> ${lijst}<br>
      <div style="margin-top:8px">
        <button class="btn-delete-stal" data-index="${i}">Verwijderen</button>
      </div>
    `;
    div.appendChild(card);
  });

  // attach delete handlers
  div.querySelectorAll(".btn-delete-stal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index, 10);
      deleteStal(index);
    });
  });

  // update dropdowns
  updateStalDropdown();
  updateFilterDropdown();
}

function renderVoeding() {
  const div = document.getElementById("voedingList");
  if (!div) return;
  if (paarden.length === 0) {
    div.innerHTML = "<div class='card'>Nog geen paarden om voeding toe te voegen.</div>";
    return;
  }
  div.innerHTML = "";
  paarden.forEach(paard => {
    const key = paard.naam;
    const v = voeding[key] || { ochtend: "", middag: "", avond: "" };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${escapeHtml(paard.naam)}</strong><br>
      Ochtend: <input type="text" id="v-ochtend-${escapeId(key)}" value="${escapeAttr(v.ochtend)}" placeholder="bv. hooi"><br>
      Middag: <input type="text" id="v-middag-${escapeId(key)}" value="${escapeAttr(v.middag)}" placeholder="bv. krachtvoer"><br>
      Avond: <input type="text" id="v-avond-${escapeId(key)}" value="${escapeAttr(v.avond)}" placeholder="bv. slobber"><br>
      <button class="btn-save-voeding" data-key="${escapeHtmlAttr(key)}">Opslaan</button>
    `;
    div.appendChild(card);
  });

  // attach save handlers
  div.querySelectorAll(".btn-save-voeding").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const key = e.target.dataset.key;
      saveVoeding(key);
    });
  });
}

function renderTraining() {
  const div = document.getElementById("trainingList");
  if (!div) return;
  if (paarden.length === 0) {
    div.innerHTML = "<div class='card'>Nog geen paarden om training toe te voegen.</div>";
    return;
  }
  div.innerHTML = "";
  paarden.forEach(paard => {
    const key = paard.naam;
    const v = training[key] || { typetraining: "" };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${escapeHtml(paard.naam)}</strong><br>
      Typetraining: <input type="text" id="v-typetraining-${escapeId(key)}" value="${escapeAttr(v.typetraining)}" placeholder="bv. schriktraining"><br>
      <button class="btn-save-training" data-key="${escapeHtmlAttr(key)}">Opslaan</button>
    `;
    div.appendChild(card);
  });

  div.querySelectorAll(".btn-save-training").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const key = e.target.dataset.key;
      saveTraining(key);
    });
  });
}

function renderMedicatie() {
  const div = document.getElementById("medicatieList");
  if (!div) return;
  if (paarden.length === 0) {
    div.innerHTML = "<div class='card'>Nog geen paarden om medicatie toe te voegen.</div>";
    return;
  }
  div.innerHTML = "";
  paarden.forEach(paard => {
    const key = paard.naam;
    const v = medicatie[key] || { ochtend: "", middag: "", avond: "" };
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <strong>${escapeHtml(paard.naam)}</strong><br>
      Ochtend: <input type="text" id="m-ochtend-${escapeId(key)}" value="${escapeAttr(v.ochtend)}" placeholder="bv. Ontstekingsremmer"><br>
      Middag: <input type="text" id="m-middag-${escapeId(key)}" value="${escapeAttr(v.middag)}" placeholder="bv. Ontstekingsremmer"><br>
      Avond: <input type="text" id="m-avond-${escapeId(key)}" value="${escapeAttr(v.avond)}" placeholder="bv. Ontstekingsremmer"><br>
      <button class="btn-save-medicatie" data-key="${escapeHtmlAttr(key)}">Opslaan</button>
    `;
    div.appendChild(card);
  });

  div.querySelectorAll(".btn-save-medicatie").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const key = e.target.dataset.key;
      saveMedicatie(key);
    });
  });
}

// ---- CRUD Acties ----
function deletePaard(i) {
  if (!Number.isInteger(i) || i < 0 || i >= paarden.length) return;
  if (confirm("Paard verwijderen?")) {
    paarden.splice(i, 1);
    saveData();
    // re-render everything relevant
    renderPaarden();
    renderStallen();
    renderVoeding();
    renderTraining();
    renderMedicatie();
  }
}

function deleteStal(i) {
  if (!Number.isInteger(i) || i < 0 || i >= stallen.length) return;
  if (confirm("Stal verwijderen?")) {
    const verwijderdeStal = stallen[i].naam;
    stallen.splice(i, 1);

    // ontkoppel paarden uit deze stal
    paarden.forEach(p => {
      if (p.stal === verwijderdeStal) p.stal = "-";
    });

    saveData();
    renderStallen();
    renderPaarden();
    renderVoeding();
    renderTraining();
    renderMedicatie();
  }
}

function saveVoeding(key) {
  const ochtend = document.getElementById("v-ochtend-" + escapeId(key))?.value || "";
  const middag = document.getElementById("v-middag-" + escapeId(key))?.value || "";
  const avond = document.getElementById("v-avond-" + escapeId(key))?.value || "";

  voeding[key] = { ochtend, middag, avond };
  saveData();
  alert("Voeding opgeslagen voor " + key);
}

function saveMedicatie(key) {
  const ochtend = document.getElementById("m-ochtend-" + escapeId(key))?.value || "";
  const middag = document.getElementById("m-middag-" + escapeId(key))?.value || "";
  const avond = document.getElementById("m-avond-" + escapeId(key))?.value || "";

  medicatie[key] = { ochtend, middag, avond };
  saveData();
  alert("Medicatie opgeslagen voor " + key);
}

function saveTraining(key) {
  const typetraining = document.getElementById("v-typetraining-" + escapeId(key))?.value || "";
  training[key] = { typetraining };
  saveData();
  alert("Training opgeslagen voor " + key);
}

// ---- Modal & formulier logica ----
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.style.display = "flex";
  // focus first input
  const first = modalEl.querySelector("input, select, textarea, button");
  if (first) first.focus();
}
function closeModal(modalEl) {
  if (!modalEl) return;
  modalEl.style.display = "none";
}

// Close modals when clicking outside content
document.querySelectorAll(".modal").forEach(m => {
  m.addEventListener("click", (e) => {
    if (e.target === m) closeModal(m);
  });
});
// Close modal on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach(m => closeModal(m));
  }
});

// Opslaan stal
if (btnOpslaanStal) {
  btnOpslaanStal.addEventListener("click", () => {
    const naam = (inpStalNaam.value || "").trim();
    const locatie = (inpStalLocatie.value || "").trim();
    if (!naam || !locatie) {
      alert("Vul alle velden in.");
      return;
    }
    // check duplicate naam
    if (stallen.some(s => s.naam.toLowerCase() === naam.toLowerCase())) {
      alert("Er bestaat al een stal met deze naam.");
      return;
    }
    stallen.push({ naam, locatie });
    saveData();
    inpStalNaam.value = "";
    inpStalLocatie.value = "";
    closeModal(modalStal);
    renderStallen();
    renderPaarden();
    renderVoeding();
    renderTraining();
    renderMedicatie();
    updateStalDropdown();
    updateFilterDropdown();
    alert("Stal toegevoegd!");
  });
}

// Opslaan paard
if (btnOpslaanPaard) {
  btnOpslaanPaard.addEventListener("click", () => {
    const naam = (inpPaardNaam.value || "").trim();
    const ras = (inpPaardRas.value || "").trim();
    const leeftijd = (inpPaardLeeftijd.value || "").trim();
    const stal = (selPaardStal.value || "-");

    if (!naam || !ras || !leeftijd) {
      alert("Vul alle verplichte velden in.");
      return;
    }

    // optional: prevent duplicate exact same paard name+ras
    // (We allow duplicate names but you can change this behavior)
    paarden.push({ naam, ras, leeftijd, stal });
    saveData();
    inpPaardNaam.value = "";
    inpPaardRas.value = "";
    inpPaardLeeftijd.value = "";
    selPaardStal.value = "";

    closeModal(modalPaard);
    renderPaarden();
    renderStallen();
    renderVoeding();
    renderTraining();
    renderMedicatie();
    alert("Paard toegevoegd!");
  });
}

// ---- + knop functionaliteit (open modals based on active tab) ----
if (addBtn) {
  addBtn.addEventListener("click", () => {
    const activeSection = document.querySelector("section.tab.active");
    if (!activeSection) return alert("Kies eerst een module.");
    const id = activeSection.id; // e.g. "tab-paarden" or "tab-stallen"
    if (id === "tab-paarden") {
      updateStalDropdown(); // update possible stallen
      openModal(modalPaard);
    } else if (id === "tab-stallen") {
      openModal(modalStal);
    } else {
      alert("Open eerst Paarden of Stallen om iets toe te voegen.");
    }
  });
}

// ---- Utility: escape helper functions to prevent broken ids/html ----
function escapeHtml(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function escapeAttr(str) {
  if (!str && str !== 0) return "";
  return String(str).replace(/"/g, "&quot;");
}
function escapeId(str) {
  if (!str && str !== 0) return "";
  // replace spaces and special chars for safe id usage
  return String(str).replace(/[^a-z0-9_\-]/gi, "_");
}
function escapeHtmlAttr(str) {
  if (!str && str !== 0) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ---- Initieel laden ----
window.addEventListener("DOMContentLoaded", () => {
  updateStalDropdown();
  updateFilterDropdown();
  renderPaarden();
  renderStallen();
  renderVoeding();
  renderTraining();
  renderMedicatie();
});
