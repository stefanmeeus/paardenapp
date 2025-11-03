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

}
