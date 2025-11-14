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
 * Ondersteunt: paard, contact, stal
 * @param {Object} param0
 * @param {"paard"|"contact"|"stal"} param0.type - Type kaart
 * @param {Object} param0.data - Data voor de kaart
 * @returns {HTMLElement} kaart-element
 */
export function renderKaart({ type, data }) {
  let titel = "";
  let lijnen = [];
  let iconPath = `../img/icons/${type}.png`;

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

    case "stal":
      titel = data.naam;
      lijnen = [
        `<strong>Capaciteit:</strong> ${data.capaciteit || "—"}`,
        `<strong>Locatie:</strong> ${data.locatie || "—"}`
      ];
      break;

    default:
      return htmlToElement(`<div style="padding:1rem;border:1px solid #ccc;">❌ Onbekend kaarttype</div>`);
  }

  const kaart = htmlToElement(`
    <button style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
      padding: 1rem;
      background-color: #fff;
      border: 1px solid #ccc;
      border-radius: 6px;
      width: 100%;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      transition: all 0.2s ease;
      max-height: 180px;
      overflow-y: auto;
    " onmouseover="this.style.boxShadow='0 4px 10px rgba(0,0,0,0.15)'" 
       onmouseout="this.style.boxShadow='0 2px 4px rgba(0,0,0,0.05)'">

      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <img src="${iconPath}" alt="${type}" style="width: 24px; height: 24px;" />
        <span style="font-weight: bold; font-size: 1.1rem; color: #333;">${titel}</span>
      </div>

      ${lijnen.map(line => `
        <div style="font-size: 0.95rem; color: #444; line-height: 1.4;">
          ${line}
        </div>
      `).join("")}
    </button>
  `);

  return kaart;
}
