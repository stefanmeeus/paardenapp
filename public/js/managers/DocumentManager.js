import { loadData, saveData } from "../storage.js";

export class DocumentManager {
  constructor(entityType, entityId) {
    this.entityType = entityType; // vb: 'paard' of 'contact'
    this.entityId = entityId;

    this.entityList = loadData(`${entityType}en`) || []; // bvb: 'paarden' of 'contacten'
    this.entity = this.entityList.find(e => e.id === entityId);

    if (!this.entity) {
      console.error(`❌ Geen entiteit gevonden met id: ${entityId}`);
      return;
    }

    // Initialiseer documenten indien niet aanwezig
    if (!this.entity.paspoort) this.entity.paspoort = null;
    if (!this.entity.verslagen) this.entity.verslagen = [];
    if (!this.entity.contract) this.entity.contract = [];
  }

  _saveEntity() {
    const index = this.entityList.findIndex(e => e.id === this.entityId);
    if (index !== -1) {
      this.entityList[index] = this.entity;
      saveData(`${this.entityType}en`, this.entityList);
    }
  }

  getPaspoort() {
    return this.entity?.paspoort || null;
  }

  getVerslagen() {
    return (this.entity?.verslagen || []).sort((a, b) => b.date.localeCompare(a.date));
  }

  getContracten() {
    return (this.entity?.contract || []).sort((a, b) => b.date.localeCompare(a.date));
  }

  addDocument(type, fileObj) {
    const entry = {
      id: Date.now(),
      name: fileObj.name,
      data: fileObj.data,
      date: new Date().toISOString(),
      ...(type === "verslag" && { jaar: new Date().getFullYear().toString() })
    };

    if (type === "paspoort") {
      this.entity.paspoort = entry;
    } else if (type === "verslag") {
      this.entity.verslagen.push(entry);
    } else if (type === "contract") {
      this.entity.contract.push(entry);
    }

    this._saveEntity();
  }

  removeDocument(type, id) {
    if (type === "paspoort") {
      this.entity.paspoort = null;
    } else if (type === "verslag") {
      this.entity.verslagen = this.entity.verslagen.filter(doc => doc.id !== id);
    } else if (type === "contract") {
      this.entity.contract = this.entity.contract.filter(doc => doc.id !== id);
    }

    this._saveEntity();
  }

  renderUploadUI(container, { type, max = null, onUploadComplete = () => {} }) {
    if (!this.entity) {
      container.innerHTML = `<p class="error">❌ Entiteit niet gevonden.</p>`;
      return;
    }

    const dropArea = document.createElement("div");
    dropArea.classList.add("upload-dropzone");
    dropArea.innerHTML = `
      <div class="drop-text">📁 Sleep hier een bestand in of klik</div>
      <input type="file" class="file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none" ${max === 1 ? "" : "multiple"} />
    `;

    container.innerHTML = "";
    container.appendChild(dropArea);

    const input = dropArea.querySelector(".file-input");

    const refreshList = () => {
      // ⚠️ GEEN BESTANDEN TONEN IN DE DROPZONE
      // Enkel dragtekst tonen, dus niks in HTML zetten
    };

    const handleFile = file => {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!allowedTypes.includes(file.type)) {
        alert("❗ Enkel PDF, JPG of PNG toegestaan.");
        return;
      }

      if (type === "paspoort" && this.entity.paspoort) {
        alert("❗ Slechts 1 paspoort toegestaan.");
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        this.addDocument(type, {
          name: file.name,
          data: e.target.result
        });
        refreshList();
        input.value = "";
        onUploadComplete();
      };
      reader.readAsDataURL(file);
    };

    dropArea.addEventListener("click", () => input.click());

    input.addEventListener("change", e => {
      const files = Array.from(e.target.files);
      files.forEach(file => handleFile(file));
    });

    dropArea.addEventListener("dragover", e => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dragover");
    });

    dropArea.addEventListener("drop", e => {
      e.preventDefault();
      dropArea.classList.remove("dragover");
      const files = Array.from(e.dataTransfer.files);
      files.forEach(file => handleFile(file));
    });

    refreshList();
  }
}
