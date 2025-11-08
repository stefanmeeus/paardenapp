// js/classes/UploadManager.js

export class UploadManager {
  constructor(allowedTypes = ["application/pdf", "image/jpeg", "image/png"]) {
    this.allowedTypes = allowedTypes;
  }

  createDropzone(targetId, { multiple = false, onFilesSelected }) {
    const target = document.getElementById(targetId);
    if (!target) return;

    target.classList.add("dropzone");

    target.innerHTML = `
      <div class="dropzone-area">
        📂 Sleep hier een bestand in of klik
        <input type="file" ${multiple ? "multiple" : ""} style="display: none;" />
      </div>
      <ul class="file-preview-list"></ul>
    `;

    const area = target.querySelector(".dropzone-area");
    const input = area.querySelector("input");
    const previewList = target.querySelector(".file-preview-list");

    const clearList = () => {
      previewList.innerHTML = "";
    };

    const updatePreview = (files) => {
      clearList();
      files.forEach(file => {
        const li = document.createElement("li");
        li.textContent = file.name;
        previewList.appendChild(li);
      });
    };

    const handleInputFiles = (fileList) => {
      const validFiles = Array.from(fileList).filter(file => {
        const isValid = this.allowedTypes.includes(file.type);
        if (!isValid) {
          alert(`❌ Ongeldig bestand: ${file.name}. Alleen PDF, JPG of PNG toegestaan.`);
        }
        return isValid;
      });

      if (validFiles.length) {
        updatePreview(validFiles);
        if (typeof onFilesSelected === "function") {
          onFilesSelected(validFiles);
        }
      }

      // Reset input zodat dezelfde bestanden opnieuw gekozen kunnen worden
      input.value = "";
    };

    // Klik opent file picker
    area.addEventListener("click", () => input.click());

    input.addEventListener("change", e => {
      handleInputFiles(e.target.files);
    });

    area.addEventListener("dragover", e => {
      e.preventDefault();
      area.classList.add("dragover");
    });

    area.addEventListener("dragleave", () => {
      area.classList.remove("dragover");
    });

    area.addEventListener("drop", e => {
      e.preventDefault();
      area.classList.remove("dragover");
      handleInputFiles(e.dataTransfer.files);
    });
  }
}
