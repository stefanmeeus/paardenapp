export class ModalManager {
  constructor() {
    this.modal = null;
  }

  openForm(title, fields, onSubmit) {
    this.close(); // sluit bestaand modaal

    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");

    const modal = document.createElement("div");
    modal.classList.add("modal");

    modal.innerHTML = `
      <h2>${title}</h2>
      <form id="modal-form">
        ${fields
          .map(
            f => `
          <label>${f.charAt(0).toUpperCase() + f.slice(1)}:
            <input type="text" name="${f}" required />
          </label>`
          )
          .join("")}
        <div class="modal-actions">
          <button type="submit" class="btn-primary">Opslaan</button>
          <button type="button" id="cancel" class="btn-secondary">Annuleer</button>
        </div>
      </form>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    this.modal = overlay;

    const form = modal.querySelector("#modal-form");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      onSubmit(data);
      this.close();
    });

    modal.querySelector("#cancel").addEventListener("click", () => this.close());
  }

  close() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
    }
  }
}
