// ui/Renderer.js
export class Renderer {
  // toont dashboard met tiles en lege content area
  showDashboard(container) {
    if (!container) return;
    container.innerHTML = `
      <h2>Paardenbeheer</h2>
      <div class="info">Hier kies je een module.</div>
    `;
  }

  // render sectie basis + knop "Nieuw ..."
  renderSection(container, title, itemsHtml = "", showAdd = false, addLabel = "Nieuw") {
    if (!container) return;
    const addBtnHtml = showAdd ? `<button id="addNewBtn" class="btn-primary">+ ${addLabel}</button>` : "";
    container.innerHTML = `
      <div class="section-wrap">
        <h2>${title}</h2>
        <div class="section-controls">${addBtnHtml}</div>
        <div class="section-list">${itemsHtml || `<p>Er zijn nog geen ${title.toLowerCase()} toegevoegd.</p>`}</div>
      </div>
    `;
    // Return reference for caller to attach listeners if needed
    return {
      addBtn: container.querySelector("#addNewBtn"),
      list: container.querySelector(".section-list")
    };
  }

  // wrapper die door app.js gebruikt wordt
  showTab(container, tabName) {
    // kies content afhankelijk van tabName
    if (!container) return;
    if (tabName === "paarden") {
      const htmlList = ""; // lege placeholder — app.js zal later vullen
      const refs = this.renderSection(container, "Paarden", htmlList, true, "Nieuw Paard");
      console.log("📋 Renderer.renderSection() paarden");
      return refs;
    }
    if (tabName === "stallen") {
      const refs = this.renderSection(container, "Stallen", "", true, "Nieuwe Stal");
      return refs;
    }
    if (tabName === "voeding") {
      const refs = this.renderSection(container, "Voeding", "", false);
      return refs;
    }
    if (tabName === "contacten") {
      const refs = this.renderSection(container, "Contacten", "", true, "Nieuw Contact");
      return refs;
    }
    // fallback
    this.showDashboard(container);
    return {};
  }
}
