import { saveData, loadData } from "../storage.js";
import { UploadManager } from "../classes/UploadManager.js";
import { Stal } from "../classes/Stal.js";

export class ModalManager {
  constructor(renderer) {
    this.renderer = renderer;
  }

  /* =====================================================
   🐴 FORMULIER PAARD
  ===================================================== */
  openPaardForm(paard = null, refreshCallback) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${paard ? "✏️ Bewerken" : "Nieuw Paard"}</h3>

        <label>Naam: <input id="naam" type="text" /></label>
        <label>Leeftijd: <input id="leeftijd" type="number" /></label>
        <label>Ras: <input id="ras" type="text" /></label>
        <label>Stallocatie: <input id="stallocatie" type="text" /></label>
        <label>Stalnummer: <input id="stalnr" type="number" /></label>
        <label>Training:
          <select id="training">
            <option value="true">Ja</option>
            <option value="false">Nee</option>
          </select>
        </label>
        <label>Trainer: <input id="trainer" type="text" /></label>
        <label>Eigenaar: <input id="eigenaar" type="text" /></label>
        <label>Dierenarts: <input id="dierenarts" type="text" /></label>
        <label>Hoefsmid: <input id="hoefsmid" type="text" /></label>
        <label>Laatste vaccinatie: <input id="vaccinatieDatum" type="date" /></label>
        <label>Laatste ontworming: <input id="ontwormingDatum" type="date" /></label>
        <label>Opmerkingen: <textarea id="opmerkingen" rows="3"></textarea></label>

        <h4>📁 Documenten</h4>
        <div>
          <h5>📘 Paspoort</h5>
          <div id="paspoortUpload" class="upload-zone"></div>
          <p class="upload-help">Enkel PDF of afbeelding (JPG, PNG)</p>
        </div>

        <div>
          <h5>🩺 Verslagen dierenarts</h5>
          <div id="verslagenUpload" class="upload-zone"></div>
          <p class="upload-help">Meerdere PDF’s of afbeeldingen (JPG, PNG)</p>
        </div>

        <div class="modal-buttons">
          <button id="savePaard">Opslaan</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    if (paard) {
      modal.querySelector("#naam").value = paard.naam || "";
      modal.querySelector("#leeftijd").value = paard.leeftijd || "";
      modal.querySelector("#ras").value = paard.ras || "";
      modal.querySelector("#stallocatie").value = paard.stallocatie || "";
      modal.querySelector("#stalnr").value = paard.stalnr || "";
      modal.querySelector("#training").value = paard.training ? "true" : "false";
      modal.querySelector("#trainer").value = paard.trainer || "";
      modal.querySelector("#eigenaar").value = paard.eigenaar || "";
      modal.querySelector("#dierenarts").value = paard.dierenarts || "";
      modal.querySelector("#hoefsmid").value = paard.hoefsmid || "";
      modal.querySelector("#vaccinatieDatum").value = paard.vaccinatieDatum || "";
      modal.querySelector("#ontwormingDatum").value = paard.ontwormingDatum || "";
      modal.querySelector("#opmerkingen").value = paard.opmerkingen || "";
    }

    let gekozenPaspoort = paard?.paspoort || null;
    let gekozenVerslagen = paard?.verslagen || [];

    const uploader = new UploadManager();

    uploader.createDropzone("paspoortUpload", {
      multiple: false,
      onFilesSelected: (files) => {
        const file = files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = e => {
          gekozenPaspoort = {
            naam: file.name,
            type: file.type,
            data: e.target.result
          };
        };
        reader.readAsDataURL(file);
      }
    });

    uploader.createDropzone("verslagenUpload", {
      multiple: true,
      onFilesSelected: (files) => {
        gekozenVerslagen = [];
        const fileReaders = [];

        Array.from(files).forEach(file => {
          const reader = new FileReader();
          const promise = new Promise(resolve => {
            reader.onload = e => {
              gekozenVerslagen.push({
                naam: file.name,
                type: file.type,
                data: e.target.result
              });
              resolve();
            };
          });
          reader.readAsDataURL(file);
          fileReaders.push(promise);
        });

        Promise.all(fileReaders).then(() => {
          console.log("✅ Alle verslagen ingelezen");
        });
      }
    });

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

    modal.querySelector("#savePaard").addEventListener("click", () => {
      const nieuwPaard = {
        id: paard?.id || Date.now(),
        naam: modal.querySelector("#naam").value.trim(),
        leeftijd: parseInt(modal.querySelector("#leeftijd").value) || 0,
        ras: modal.querySelector("#ras").value.trim(),
        stallocatie: modal.querySelector("#stallocatie").value.trim(),
        stalnr: parseInt(modal.querySelector("#stalnr").value) || 0,
        training: modal.querySelector("#training").value === "true",
        trainer: modal.querySelector("#trainer").value.trim(),
        eigenaar: modal.querySelector("#eigenaar").value.trim(),
        dierenarts: modal.querySelector("#dierenarts").value.trim(),
        hoefsmid: modal.querySelector("#hoefsmid").value.trim(),
        vaccinatieDatum: modal.querySelector("#vaccinatieDatum").value,
        ontwormingDatum: modal.querySelector("#ontwormingDatum").value,
        opmerkingen: modal.querySelector("#opmerkingen").value.trim(),
        paspoort: gekozenPaspoort,
        verslagen: gekozenVerslagen
      };

      if (!nieuwPaard.naam) {
        alert("❗ Geef een naam op.");
        return;
      }

      const paarden = loadData("paarden") || [];
      const index = paarden.findIndex(p => p.id === nieuwPaard.id);

      if (index > -1) paarden[index] = nieuwPaard;
      else paarden.push(nieuwPaard);

      // ✅ FIX: paard koppelen aan stal
      const stallen = loadData("stallen") || [];
      const stal = stallen.find(s =>
        s.stalnr === nieuwPaard.stalnr &&
        s.stallocatie === nieuwPaard.stallocatie
      );
      if (stal) {
        stal.paardId = nieuwPaard.id;
        saveData("stallen", stallen);
      }

      saveData("paarden", paarden);
      modal.remove();
      refreshCallback?.();
    });
  }

  /* =====================================================
   📍 FORMULIER STALLOCATIE
  ===================================================== */
  openStalLocatieForm(locatie = null, callback) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const naam = locatie?.naam || "";

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${locatie ? "✏️ Bewerken" : "Nieuwe Stallocatie"}</h3>
        <label>Locatienaam:
          <input id="locatieNaam" value="${naam}" />
        </label>

        <div class="modal-buttons">
          <button id="saveLocatie">Opslaan</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

    modal.querySelector("#saveLocatie").addEventListener("click", () => {
      const naam = modal.querySelector("#locatieNaam").value.trim();
      if (!naam) return alert("❗ Naam verplicht");

      const locaties = loadData("locaties") || [];

      const bestaat = locaties.some(l => l.naam === naam && l.id !== locatie?.id);
      if (bestaat) return alert("❌ Locatienaam bestaat al (hoofdlettergevoelig)");

      const nieuwe = {
        id: locatie?.id || Date.now(),
        naam
      };

      const result = locatie
        ? locaties.map(l => (l.id === locatie.id ? nieuwe : l))
        : [...locaties, nieuwe];

      saveData("locaties", result);
      modal.remove();
      callback?.();
    });
  }

  /* =====================================================
   🏚️ FORMULIER STAL
  ===================================================== */
  openStalForm(stal = null, locatie = null, callback) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    const locaties = loadData("locaties") || [];

    const locatieId = locatie?.id || stal?.locatieId || "";
    const nummer = stal?.stalnr || "";

    const opts = locaties.map(l => `
      <option value="${l.id}" ${l.id === locatieId ? "selected" : ""}>${l.naam}</option>
    `).join("");

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${stal ? "✏️ Stal bewerken" : "Nieuwe Stal"}</h3>

        <label>Locatie:
          <select id="locatieSelect">${opts}</select>
        </label>

        <label>Stalnummer:
          <input id="stalNr" type="number" value="${nummer}" />
        </label>

        <div class="modal-buttons">
          <button id="saveStal">Opslaan</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

    modal.querySelector("#saveStal").addEventListener("click", () => {
      const selectedLoc = modal.querySelector("#locatieSelect").value;
      const nummer = parseInt(modal.querySelector("#stalNr").value);

      if (!nummer) return alert("❗ Stalnummer verplicht");

      const stallen = loadData("stallen") || [];

      const bestaat = stallen.some(
        s => String(s.locatieId) === String(selectedLoc) &&
             s.stalnr === nummer &&
             s.id !== stal?.id
      );
      if (bestaat) return alert("❌ Dat nummer bestaat al in deze locatie");

      const locatieObj = locatie || locaties.find(l => String(l.id) === String(selectedLoc));
      const nieuwe = new Stal({
        id: stal?.id,
        locatieId: selectedLoc,
        locatienaam: locatieObj?.naam?.trim() || "",
        stalnr: nummer,
        paardId: stal?.paardId || null
      });

      const result = stal
        ? stallen.map(s => (s.id === stal.id ? nieuwe : s))
        : [...stallen, nieuwe];

      saveData("stallen", result);
      modal.remove();
      callback?.();
    });
  }
    /* =====================================================
   🐴 PAARD KOPPELEN AAN STAL
  ===================================================== */
  openPaardKoppelenForm(stal, locatieNaam, callback) {
    const paarden = loadData("paarden") || [];
    const stallen = loadData("stallen") || [];

    const vrijePaarden = paarden.filter(p => !p.stalnr && !p.stallocatie);

    if (!vrijePaarden.length) {
      alert("❗ Geen vrije paarden beschikbaar.");
      return;
    }

    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <h3>🐴 Koppel paard aan Stal ${stal.stalnr} (${locatieNaam})</h3>
        <label>Selecteer paard:
          <select id="paardSelect">
            ${vrijePaarden.map(p => `<option value="${p.id}">${p.naam}</option>`).join("")}
          </select>
        </label>
        <div class="modal-buttons">
          <button id="koppelBtn">Koppel</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

    modal.querySelector("#koppelBtn").addEventListener("click", () => {
      const paardId = parseInt(modal.querySelector("#paardSelect").value);
      const paard = paarden.find(p => p.id === paardId);
      if (!paard) return;

      // Paard bijwerken
      paard.stalnr = stal.stalnr;
      paard.stallocatie = locatieNaam;

      // Stal bijwerken
      const targetStal = stallen.find(s => s.id === stal.id);
      if (targetStal) targetStal.paardId = paard.id;

      saveData("paarden", paarden);
      saveData("stallen", stallen);

      modal.remove();
      callback?.();
    });
  }

  /* =====================================================
   📇 FORMULIER CONTACT
  ===================================================== */
  openContactForm(contact = null, refreshCallback) {
    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${contact ? "✏️ Contact bewerken" : "Nieuw Contact"}</h3>

        <label>Voornaam: <input id="voornaam" type="text" /></label>
        <label>Achternaam: <input id="achternaam" type="text" /></label>
        <label>Telefoon: <input id="telefoon" type="text" /></label>
        <label>Email: <input id="email" type="email" /></label>
        <label>Straat: <input id="straat" type="text" /></label>
        <label>Huisnummer: <input id="huisnummer" type="text" /></label>
        <label>Postcode: <input id="postcode" type="text" /></label>
        <label>Gemeente: <input id="gemeente" type="text" /></label>
        <label>Land: <input id="land" type="text" /></label>
        <label>Rol: <input id="rol" type="text" /></label>
        <label>Paardnaam: <input id="paardnaam" type="text" /></label>

        <h4>📁 Contracten</h4>
        <div id="contractUpload" class="upload-zone"></div>
        <p class="upload-help">Sleep contracten hier (PDF, JPG, PNG)</p>

        <div class="modal-buttons">
          <button id="saveContact">Opslaan</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = "flex";

    if (contact) {
      modal.querySelector("#voornaam").value = contact.Voornaam || "";
      modal.querySelector("#achternaam").value = contact.Achternaam || "";
      modal.querySelector("#telefoon").value = contact.Telefoon || "";
      modal.querySelector("#email").value = contact.Email || "";
      modal.querySelector("#adres").value = contact.Adres || "";
      modal.querySelector("#rol").value = contact.rol || "";
      modal.querySelector("#paardnaam").value = contact.Paardnaam || "";
    }

    let gekozenContracten = contact?.contract || [];
    const uploader = new UploadManager();

    uploader.createDropzone("contractUpload", {
      multiple: true,
      onFilesSelected: (files) => {
        gekozenContracten = [];
        const fileReaders = [];

        Array.from(files).forEach(file => {
          const reader = new FileReader();
          const promise = new Promise(resolve => {
            reader.onload = e => {
              gekozenContracten.push({
                naam: file.name,
                type: file.type,
                data: e.target.result
              });
              resolve();
            };
          });
          reader.readAsDataURL(file);
          fileReaders.push(promise);
        });

        Promise.all(fileReaders).then(() => {
          console.log("✅ Alle contracten ingelezen");
        });
      }
    });

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

    modal.querySelector("#saveContact").addEventListener("click", () => {
      const nieuwContact = {
        id: contact?.id || Date.now(),
        klant_ID: contact?.klant_ID || Date.now(),
        Voornaam: modal.querySelector("#voornaam").value.trim(),
        Achternaam: modal.querySelector("#achternaam").value.trim(),
        Telefoon: modal.querySelector("#telefoon").value.trim(),
        Email: modal.querySelector("#email").value.trim(),
        Straat: modal.querySelector("#straat").value.trim(),
        Huisnummer: modal.querySelector("#huisnummer").value.trim(),
        Postcode: modal.querySelector("#postcode").value.trim(),
        Gemeente: modal.querySelector("#gemeente").value.trim(),
        Land: modal.querySelector("#land").value.trim(),
        rol: modal.querySelector("#rol").value.trim(),
        Paardnaam: modal.querySelector("#paardnaam").value.trim(),
        contract: gekozenContracten
      };

      if (!nieuwContact.Voornaam || !nieuwContact.Achternaam) {
        alert("❗ Voornaam en achternaam zijn verplicht.");
        return;
      }

      const contacten = loadData("contacten") || [];
      const index = contacten.findIndex(c => c.id === nieuwContact.id);

      if (index > -1) contacten[index] = nieuwContact;
      else contacten.push(nieuwContact);

      saveData("contacten", contacten);
      modal.remove();
      refreshCallback?.();
    });
  }
/* =====================================================
 🩺 FORMULIER MEDICATIEPLAN (bewerken + toevoegen)
===================================================== */
openMedicatieForm(medicatie = null, callback) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const paarden = loadData("paarden") || [];
  const actievePaarden = paarden.filter(p => p.id);

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${medicatie ? "✏️ Medicatie bewerken" : "💊 Nieuwe Medicatie"}</h3>

      <div id="formErrorBox" class="form-error-box" style="display:none;">
        ❗ Controleer de invoer hieronder.
      </div>

      <label>Paard:
        <select id="medPaardId">
          <option value="">-- Kies een paard --</option>
          ${actievePaarden.map(p => `
            <option value="${p.id}">${p.naam || "Naamloos paard"}</option>
          `).join("")}
        </select>
        <small class="error-text" id="errPaard"></small>
      </label>

      <label>Naam medicatie:
        <input id="medNaam" type="text" placeholder="Bijv. Bute, AB-kuur..." />
        <small class="error-text" id="errNaam"></small>
      </label>

      <label>Startdatum:
        <input id="medStart" type="date" />
        <small class="error-text" id="errStart"></small>
      </label>

      <label>Aantal dagen:
        <input id="medAantalDagen" type="number" placeholder="Bijv. 5" />
      </label>

      <label>Einddatum:
        <input id="medEind" type="date" />
        <small class="error-text" id="errEind"></small>
      </label>

      <label>Dosering:
        <input id="medDosering" type="text" placeholder="Bijv. 1 pil, 2x per dag" />
      </label>

      <label>Frequentie:
        <input id="medFrequentie" type="text" placeholder="Bijv. Ochtend / Avond" />
      </label>

      <label>Toedieningswijze:
        <input id="medToediening" type="text" placeholder="Bijv. Oraal, injectie..." />
      </label>

      <label>Voorgeschreven door:
        <input id="medVoorgeschrevenDoor" type="text" placeholder="Naam dierenarts" />
      </label>

      <label>Opmerkingen:
        <textarea id="medOpmerking" rows="3" placeholder="Extra info..."></textarea>
      </label>

      <div class="modal-buttons">
        <button id="saveMedicatie" class="btn-primary">Opslaan</button>
        <button id="closeModal" class="btn-secondary">Annuleer</button>
      </div>
    </div>
  `;

  // Extra stijlen injecteren 
  const style = document.createElement("style");
  style.textContent = `
    .error-text {
      color: #c00;
      font-size: 0.85em;
      min-height: 1em;
      display: block;
    }
    .invalid {
      border-color: #c00 !important;
      background: #ffeaea !important;
    }
    .form-error-box {
      background: #ffe0e0;
      color: #a00;
      border: 1px solid #a00;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(modal);
  modal.style.display = "flex";

  // Prefill bij bewerken
  if (medicatie) {
    modal.querySelector("#medPaardId").value = medicatie.paardId ?? "";
    modal.querySelector("#medNaam").value = medicatie.medicatie || "";
    modal.querySelector("#medStart").value = medicatie.startDatum || "";
    modal.querySelector("#medEind").value = medicatie.eindDatum || "";
    modal.querySelector("#medDosering").value = medicatie.dosering || "";
    modal.querySelector("#medFrequentie").value = medicatie.frequentie || "";
    modal.querySelector("#medToediening").value = medicatie.toediening || "";
    modal.querySelector("#medVoorgeschrevenDoor").value = medicatie.voorgeschrevenDoor || "";
    modal.querySelector("#medOpmerking").value = medicatie.opmerking || "";
  }

  // Automatisch einddatum berekenen
  modal.querySelector("#medAantalDagen").addEventListener("input", () => {
    const start = modal.querySelector("#medStart").value;
    const dagen = parseInt(modal.querySelector("#medAantalDagen").value);
    if (start && dagen > 0) {
      const startDate = new Date(start);
      startDate.setDate(startDate.getDate() + dagen);
      modal.querySelector("#medEind").value = startDate.toISOString().split("T")[0];
    }
  });

  modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

  modal.querySelector("#saveMedicatie").addEventListener("click", () => {
    // Reset fouten
    modal.querySelector("#formErrorBox").style.display = "none";
    modal.querySelectorAll(".error-text").forEach(e => e.textContent = "");
    modal.querySelectorAll("input, select").forEach(i => i.classList.remove("invalid"));

    const paardId = modal.querySelector("#medPaardId").value;
    const paard = actievePaarden.find(p => String(p.id) === paardId);
    const naam = modal.querySelector("#medNaam").value.trim();
    const startDatum = modal.querySelector("#medStart").value;
    const eindDatum = modal.querySelector("#medEind").value;
    const dosering = modal.querySelector("#medDosering").value.trim();
    const frequentie = modal.querySelector("#medFrequentie").value.trim();
    const toediening = modal.querySelector("#medToediening").value.trim();
    const voorgeschrevenDoor = modal.querySelector("#medVoorgeschrevenDoor").value.trim();
    const opmerking = modal.querySelector("#medOpmerking").value.trim();

    const vandaag = new Date().toISOString().split("T")[0];
    let fouten = [];

    if (!paardId) {
      fouten.push("Kies een paard.");
      modal.querySelector("#errPaard").textContent = "Kies een paard.";
      modal.querySelector("#medPaardId").classList.add("invalid");
    }

    if (!naam) {
      fouten.push("Vul medicatienaam in.");
      modal.querySelector("#errNaam").textContent = "Vul medicatienaam in.";
      modal.querySelector("#medNaam").classList.add("invalid");
    }

    if (!startDatum) {
      fouten.push("Vul startdatum in.");
      modal.querySelector("#errStart").textContent = "Vul startdatum in.";
      modal.querySelector("#medStart").classList.add("invalid");
    }

    if (eindDatum && eindDatum < vandaag) {
      fouten.push("Einddatum ligt in het verleden.");
      modal.querySelector("#errEind").textContent = "Einddatum ligt in verleden.";
      modal.querySelector("#medEind").classList.add("invalid");
    }

    if (fouten.length > 0) {
      modal.querySelector("#formErrorBox").style.display = "block";
      return;
    }

    // ✅ Opslaan
    const nieuw = {
      id: medicatie?.id || Date.now(),
      paardId: parseInt(paardId),
      paardNaam: paard?.naam || "Onbekend",
      medicatie: naam,
      startDatum,
      eindDatum,
      dosering,
      frequentie,
      toediening,
      voorgeschrevenDoor,
      opmerking
    };

    const lijst = loadData("medicatie") || [];
    const index = lijst.findIndex(m => m.id === nieuw.id);
    if (index > -1) lijst[index] = nieuw;
    else lijst.push(nieuw);

    saveData("medicatie", lijst);
    modal.remove();
    callback?.();
  });
}
openVoedingForm(voeding = null, callback, isStandaard = false) {
  const modal = document.createElement("div");
  modal.classList.add("modal");

  const paarden = loadData("paarden") || [];
  const bestaandeVoedingen = loadData("voeding") || [];
  const gebruiktePaarden = bestaandeVoedingen.filter(v => v.paardId && v.id !== voeding?.id).map(v => String(v.paardId));

  // Filter beschikbare paarden voor dropdown
  const beschikbarePaarden = paarden.filter(p => !gebruiktePaarden.includes(String(p.id)));

  modal.innerHTML = `
    <div class="modal-content">
      <h3>${voeding ? "✏️ Voeding bewerken" : "🍽️ Nieuwe voeding"} ${isStandaard ? "(Standaard)" : ""}</h3>
      
      <div id="formError" class="form-error" style="display: none;">
        ❗ Controleer de invoer hieronder.
      </div>

      ${!isStandaard ? `
        <label>Paard:
          <select id="voedingPaard">
            <option value="">-- Selecteer paard --</option>
            ${paarden.map(p => `
              <option value="${p.id}" ${voeding?.paardId == p.id ? "selected" : ""} ${gebruiktePaarden.includes(String(p.id)) && voeding?.paardId != p.id ? "disabled" : ""}>
                ${p.naam} ${gebruiktePaarden.includes(String(p.id)) && voeding?.paardId != p.id ? "(al voeding)" : ""}
              </option>
            `).join("")}
          </select>
        </label>
      ` : ""}

      <h4>🕒 Voeding</h4>
      <label>Ochtend: <input id="vOchtend" type="text" value="${voeding?.ochtend || ""}" /></label>
      <label>Middag: <input id="vMiddag" type="text" value="${voeding?.middag || ""}" /></label>
      <label>Avond: <input id="vAvond" type="text" value="${voeding?.avond || ""}" /></label>

      <h4>💊 Supplementen</h4>
      <label>Ochtend: <input id="sOchtend" type="text" value="${voeding?.supplementen?.ochtend || ""}" /></label>
      <label>Middag: <input id="sMiddag" type="text" value="${voeding?.supplementen?.middag || ""}" /></label>
      <label>Avond: <input id="sAvond" type="text" value="${voeding?.supplementen?.avond || ""}" /></label>

      <div class="modal-buttons">
        <button id="saveVoeding" class="btn-primary">Opslaan</button>
        <button id="closeModal" class="btn-secondary">Annuleer</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.style.display = "flex";

  // ❌ Annuleren
  modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());

  // 💾 Opslaan
  modal.querySelector("#saveVoeding").addEventListener("click", () => {
    const paardId = isStandaard ? "" : modal.querySelector("#voedingPaard").value;

    const nieuweVoeding = {
      id: voeding?.id || Date.now().toString(),
      paardId: paardId || "",
      ochtend: modal.querySelector("#vOchtend").value.trim(),
      middag: modal.querySelector("#vMiddag").value.trim(),
      avond: modal.querySelector("#vAvond").value.trim(),
      supplementen: {
        ochtend: modal.querySelector("#sOchtend").value.trim(),
        middag: modal.querySelector("#sMiddag").value.trim(),
        avond: modal.querySelector("#sAvond").value.trim()
      }
    };

    // ✅ Validatie
    const formError = modal.querySelector("#formError");
    if (!isStandaard && !paardId) {
      formError.style.display = "block";
      return;
    } else {
      formError.style.display = "none";
    }

    const lijst = loadData("voeding") || [];
    const index = lijst.findIndex(v => v.id === nieuweVoeding.id);
    if (index > -1) lijst[index] = nieuweVoeding;
    else lijst.push(nieuweVoeding);

    saveData("voeding", lijst);
    modal.remove();
    callback?.();
  });
}

}
