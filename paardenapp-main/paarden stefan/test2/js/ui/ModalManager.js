import { saveData, loadData } from "../storage.js";

export class ModalManager {
  constructor() {}

  openPaardForm() {
    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Nieuw Paard</h3>
        <label>Naam: <input id="naam" type="text"></label>
        <label>Eigenaar: <input id="eigenaar" type="text"></label>
        <label>Trainer: <input id="trainer" type="text"></label>
        <label>Dierenarts: <input id="dierenarts" type="text"></label>
        <label>Hoefsmid: <input id="hoefsmid" type="text"></label>
        <label>Laatste vaccinatie: <input id="vaccinatie" type="date"></label>
        <div class="modal-buttons">
          <button id="savePaard">Opslaan</button>
          <button id="closeModal">Annuleer</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector("#closeModal").addEventListener("click", () => modal.remove());
    modal.querySelector("#savePaard").addEventListener("click", () => {
      const paarden = loadData("paarden") || [];
      const nieuwPaard = {
        id: Date.now(),
        naam: modal.querySelector("#naam").value,
        eigenaar: modal.querySelector("#eigenaar").value,
        trainer: modal.querySelector("#trainer").value,
        dierenarts: modal.querySelector("#dierenarts").value,
        hoefsmid: modal.querySelector("#hoefsmid").value,
        vaccinatie: modal.querySelector("#vaccinatie").value,
      };
      paarden.push(nieuwPaard);
      saveData("paarden", paarden);
      modal.remove();
      location.reload(); // vernieuw lijst
    });
  }
}
