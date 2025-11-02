import * as XLSX from "https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs";
import { saveData, loadData } from "../storage.js";

export class DataExchange {
  // -------------------------------------------------------
  // 📤 EXPORT naar Excel
  // -------------------------------------------------------
  static exportPaardenToExcel() {
    const paarden = loadData("paarden") || [];
    if (!paarden.length) return;

    const rows = paarden.map(p => ({
      id: p.id,
      naam: p.naam,
      leeftijd: p.leeftijd,
      ras: p.ras,
      stallocatie: p.stallocatie,
      stalnr: p.stalnr,
      voeding: p.voeding,
      training: p.training ? "ja" : "nee",
      trainer: p.trainer,
      eigenaar: p.eigenaar,
      dierenarts: p.dierenarts,
      hoefsmid: p.hoefsmid,
      vaccinatieDatum: p.vaccinatieDatum,
      ontwormingDatum: p.ontwormingDatum,
      opmerkingen: p.opmerkingen
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Paarden");

    XLSX.writeFile(workbook, "paarden.xlsx");
  }

  // -------------------------------------------------------
  // 📄 TEMPLATE DOWNLOAD (lege Excel)
  // -------------------------------------------------------
  static downloadPaardenTemplate() {
    const headers = [[
      "naam",
      "leeftijd",
      "ras",
      "stallocatie",
      "stalnr",
      "voeding",
      "training",
      "trainer",
      "eigenaar",
      "dierenarts",
      "hoefsmid",
      "vaccinatieDatum",
      "ontwormingDatum",
      "opmerkingen"
    ]];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "paarden-template.xlsx");
  }

  // -------------------------------------------------------
  // 📥 IMPORT vanuit Excel
  // -------------------------------------------------------
  static async importPaardenFromExcel(file, callback) {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const paarden = XLSX.utils.sheet_to_json(sheet);

      const geldigePaarden = paarden.filter(p => p.naam?.trim());
      if (!geldigePaarden.length) {
        alert("⚠️ Geen geldige rijen gevonden. Controleer de naamkolom.");
        return;
      }

      const normalizeDate = (value) => {
        const date = new Date(value);
        return isNaN(date) ? "" : date.toISOString().split("T")[0]; // → 'YYYY-MM-DD'
      };

      const withIds = geldigePaarden.map(p => ({
        id: Date.now() + Math.floor(Math.random() * 10000),
        naam: p.naam || "",
        leeftijd: parseInt(p.leeftijd) || 0,
        ras: p.ras || "",
        stallocatie: p.stallocatie || "",
        stalnr: parseInt(p.stalnr) || 0,
        voeding: p.voeding || "",
        training: (p.training?.toLowerCase?.() === "ja"),
        trainer: p.trainer || "",
        eigenaar: p.eigenaar || "",
        dierenarts: p.dierenarts || "",
        hoefsmid: p.hoefsmid || "",
        vaccinatieDatum: normalizeDate(p.vaccinatieDatum),
        ontwormingDatum: normalizeDate(p.ontwormingDatum),
        opmerkingen: p.opmerkingen || "",
        paspoort: null,
        verslagen: []
      }));

      const bestaande = loadData("paarden") || [];
      const alles = [...bestaande, ...withIds];
      saveData("paarden", alles);

      alert(`✅ ${withIds.length} paarden geïmporteerd.`);
      if (typeof callback === "function") callback();
    } catch (err) {
      console.error("❌ Importfout:", err);
      alert("❌ Importeren mislukt. Is het een geldig Excel-bestand?");
    }
  }
}
