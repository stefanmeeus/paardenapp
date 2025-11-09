import { loadData, saveData } from "../storage.js";

export class DocumentManager {
  constructor(entityType, entityId) {
    this.entityType = entityType; // vb: 'paard'
    this.entityId = entityId;

    this.entityList = loadData(`${entityType}en`) || []; // bvb: 'paarden'
    this.entity = this.entityList.find(e => e.id === entityId);

    if (!this.entity) {
      console.error(`❌ Geen entiteit gevonden met id: ${entityId}`);
      return;
    }

    // Initialiseer documenten indien niet aanwezig
    if (!this.entity.paspoort) this.entity.paspoort = null;
    if (!this.entity.verslagen) this.entity.verslagen = [];
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

  addDocument(type, fileObj) {
    const entry = {
      id: Date.now(),
      name: fileObj.name,
      data: fileObj.data,
      date: new Date().toISOString()
    };

    if (type === "paspoort") {
      this.entity.paspoort = entry;
    } else if (type === "verslag") {
      this.entity.verslagen.push(entry);
    }

    this._saveEntity();
  }

  removeDocument(type, id) {
    if (type === "paspoort") {
      this.entity.paspoort = null;
    } else if (type === "verslag") {
      this.entity.verslagen = this.entity.verslagen.filter(doc => doc.id !== id);
    }

    this._saveEntity();
  }

  renderUploadUI(container, { type, max = null, onUploadComplete = () => {} }) {
    if (!this.entity) {
      container.innerHTML = `<p class="error">❌ Entiteit niet gevonden.</p>`;
      return;
    }

    const dropArea = document.createElement("div");
    dropArea.classList.add("drop-area");
    dropArea.innerHTML = `
      <div class="drop-text">📁 Sleep hier een bestand in of klik</div>
      <input type="file" class="file-input" accept=".pdf,.png,.jpg,.jpeg" style="display:none" ${max === 1 ? "" : "multiple"} />
      <ul class="file-list"></ul>
    `;

    container.innerHTML = "";
    container.appendChild(dropArea);

    const input = dropArea.querySelector(".file-input");
    const list = dropArea.querySelector(".file-list");

    const refreshList = () => {
      list.innerHTML = "";

      if (type === "paspoort" && this.entity.paspoort) {
        const doc = this.entity.paspoort;
        list.innerHTML = `<li>${doc.name} <button data-id="${doc.id}" class="remove-btn">🗑️</button></li>`;
      }

      if (type === "verslag") {
        this.getVerslagen().forEach(doc => {
          const li = document.createElement("li");
          li.innerHTML = `${doc.name} <button data-id="${doc.id}" class="remove-btn">🗑️</button>`;
          list.appendChild(li);
        });
      }

      list.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = parseInt(btn.dataset.id);
          this.removeDocument(type, id);
          refreshList();
          onUploadComplete();
        });
      });
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
          data: e.target.result,
        });
        refreshList();
        input.value = ""; // ✅ Reset input na upload
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
