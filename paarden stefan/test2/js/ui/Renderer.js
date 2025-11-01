import { ModalManager } from "./ModalManager.js";
import { loadData } from "../storage.js";

export class Renderer {
  constructor(container) {
    this.container = container;
    this.modals = new ModalManager();
  }

  showDashboard() {
    this.container.innerHTML = `
      <h2>Welkom bij Paardenbeheer</h2>
      <p>Klik op een tegel om te beginnen.</p>
    `;
  }

  showPaarden() {
    const paarden = loadData("paarden") || [];
    this.container.innerHTML = `
      <div class="tab-header">
        <h2>Paarden</h2>
        <button id="addPaard" class="btn">+ Nieuw Paard</button>
      </div>
      <div class="paarden-lijst">
        ${
          paarden.length
            ? paarden
                .map(
                  p => `
              <div class="card">
                <h3>${p.naam}</h3>
                <p><strong>Eigenaar:</strong> ${p.eigenaar}</p>
                <p><strong>Trainer:</strong> ${p.trainer}</p>
                <p><strong>Dierenarts:</strong> ${p.dierenarts}</p>
                <p><strong>Hoefsmid:</strong> ${p.hoefsmid}</p>
                <p><strong>Laatste vaccinatie:</strong> ${p.vaccinatie}</p>
              </div>`
                )
                .join("")
            : `<p>Geen paarden gevonden.</p>`
        }
      </div>
    `;

    document.getElementById("addPaard").addEventListener("click", () => {
      this.modals.openPaardForm();
    });
  }

  showStallen() {
    this.container.innerHTML = `<h2>Stallen</h2><p>Stallendata volgt...</p>`;
  }

  showVoeding() {
    this.container.innerHTML = `<h2>Voeding</h2><p>Voedingsschema’s volgen...</p>`;
  }

  showContacten() {
    this.container.innerHTML = `<h2>Contacten</h2><p>Contactpersonen volgen...</p>`;
  }
}
