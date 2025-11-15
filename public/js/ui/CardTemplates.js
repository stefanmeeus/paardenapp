// js/ui/CardTemplates.js

// ✅ Injecteer centrale styling éénmalig
if (!document.getElementById("kaart-icon-styling")) {
  const style = document.createElement("style");
  style.id = "kaart-icon-styling";
  style.textContent = `
    .kaart {
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 1rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      transition: box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .kaart:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .kaart-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: bold;
      font-size: 1.1rem;
      color: #333;
    }

    img.kaart-icon {
      width: 24px;
      height: 24px;
      object-fit: contain;
      vertical-align: middle;
    }

    img.kaart-icon-lg {
      width: 32px;
      height: 32px;
      object-fit: contain;
      vertical-align: middle;
    }

    .kaart-body {
      font-size: 0.95rem;
      color: #444;
      line-height: 1.4;
    }

    /* 🔴 Volle locatie */
    .kaart-locatie.vol {
      background: #ffe5e5;
      border-color: #cc0000;
    }

    /* ⭐ GLOBALE TOOLBAR */
    .kaart-toolbar {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 1rem auto 2rem auto;
      width: 100%;
      max-width: 1400px;
    }
      /* 🛠️ Kleine ronde actieknoppen (edit/verwijder) */
.kaart-acties {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.kaart-acties .btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  font-size: 1.2rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}


    /* 📄 FORM-KAART stijl (herbruikbaar) */
    .form-kaart {
      background: white;
      border: 1px solid #ccc;
      border-radius: 6px;
      padding: 1.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      max-width: 400px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-kaart h3 {
      margin-top: 0;
      font-size: 1.2rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-kaart label {
      font-weight: bold;
    }

    .form-kaart select,
    .form-kaart input[type="text"],
    .form-kaart input[type="number"] {
      padding: 0.4rem;
      border: 1px solid #aaa;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    .form-kaart button {
      padding: 0.4rem 0.8rem;
      margin-right: 0.5rem;
    }

    /* 🌙 MODAL OVERLAY centraal gecentreerd */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      min-width: 300px;
      max-width: 400px;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Zet een HTML string om naar een DOM-element.
 * @param {string} html 
 * @returns {HTMLElement}
 */
function htmlToElement(html) {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Genereert een dynamische, volledig gestylede kaart DOM-element.
 * Ondersteunt: paard, contact, stal, locatie
 * @param {Object} param0
 * @param {"paard"|"contact"|"stal"|"locatie"} param0.type
 * @param {Object} param0.data
 * @returns {HTMLElement} kaart-element
 */
export function renderKaart({ type, data }) {
  let titel = "";
  let lijnen = [];
  let iconPath = `../img/icons/${type}.png`;
  let extraClass = "";

  switch (type) {
    case "paard":
      titel = data.naam;
      lijnen = [
        `<strong>Eigenaar:</strong> ${data.eigenaar || "—"}`,
        `<strong>Dierenarts:</strong> ${data.dierenarts || "—"}`
      ];
      break;

    case "contact":
      titel = data.naam;
      lijnen = [
        `<strong>Telefoon:</strong> ${data.telefoon || "—"}`,
        `<strong>Email:</strong> ${data.email || "—"}`
      ];
      break;

    case "locatie":
      titel = data.naam;

      const vrij = data.vrij ?? 0;
      const totaal = data.totaal ?? 15;
      const isVol = vrij === 0;

      iconPath = `../img/icons/stal.png`;
      extraClass = `kaart-locatie${isVol ? " vol" : ""}`;

      lijnen = [
        `<strong>Beschikbare stallen:</strong> ${vrij} / ${totaal}`,
        `<em>Klik om te openen</em>`
      ];
      break;

    case "stal":
      const paard = data.paard;
      const isBezet = !!paard;
      titel = `Stal ${data.stalnr || "—"}`;
      extraClass = isBezet ? "bezet" : "vrij";
      lijnen = [
        `<strong>Locatie:</strong> ${data.locatienaam || "—"}`,
        isBezet
          ? `<strong>Paard:</strong> ${paard.naam}`
          : `<em>Vrij</em>`,
        isBezet
          ? `<button class="btn btn-danger ontkoppelBtn" data-id="${data.id}">❌ Ontkoppel</button>`
          : `<button class="btn btn-primary koppelBtn" data-id="${data.id}">🐎 Koppel</button>`,
        `<button class="btn btn-secondary verwijderBtn" data-id="${data.id}">🗑 Verwijder</button>`
      ];
      break;

    default:
      return htmlToElement(`<div style="padding:1rem;border:1px solid #ccc;">❌ Onbekend kaarttype</div>`);
  }

  const kaart = htmlToElement(`
    <div class="kaart kaart-${type} ${extraClass}">
      <div class="kaart-header">
        <img src="${iconPath}" alt="${type}" class="kaart-icon" />
        <span>${titel}</span>
      </div>
      <div class="kaart-body">
        ${lijnen.map(line => `<div>${line}</div>`).join("")}
      </div>
    </div>
  `);

  return kaart;
}
