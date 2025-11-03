import * as XLSX from "https://cdn.sheetjs.com/xlsx-latest/package/xlsx.mjs";
import { saveData, loadData } from "../storage.js";

export class DataExchange {
  // -------------------------------------------------------
  // 📤 EXPORT PAARDEN
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
  // 📄 TEMPLATE PAARDEN
  // -------------------------------------------------------
  static downloadPaardenTemplate() {
    const headers = [[
      "naam",
      "leeftijd",
      "ras",
      "stallocatie",
      "stalnr",
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
  // 📥 IMPORT PAARDEN
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
        return isNaN(date) ? "" : date.toISOString().split("T")[0];
      };

      const withIds = geldigePaarden.map(p => ({
        id: Date.now() + Math.floor(Math.random() * 10000),
        naam: p.naam || "",
        leeftijd: parseInt(p.leeftijd) || 0,
        ras: p.ras || "",
        stallocatie: p.stallocatie || "",
        stalnr: parseInt(p.stalnr) || 0,
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

  // -------------------------------------------------------
  // 📤 EXPORT STALLEN + LOCATIES
  // -------------------------------------------------------
  static exportStallen(locaties = [], stallen = [], paarden = []) {
    if (!locaties.length || !stallen.length) {
      alert("⚠️ Geen stallen of locaties beschikbaar om te exporteren.");
      return;
    }

    const rows = stallen.map(s => {
      const locatie = locaties.find(l => String(l.id) === String(s.locatieId));
      const paard = paarden.find(p => p.id === s.paardId);

      return {
        stalId: s.id,
        stalnr: s.stalnr,
        locatieId: s.locatieId,
        locatienaam: locatie?.naam || "—",
        paardId: paard?.id || "",
        paardNaam: paard?.naam || ""
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stallen");

    XLSX.writeFile(workbook, "stallen.xlsx");
  }

  // -------------------------------------------------------
  // 📄 TEMPLATE STALLEN
  // -------------------------------------------------------
  static downloadStallenTemplate() {
    const headers = [[
      "locatieId",
      "locatienaam",
      "stalnr",
      "paardId"
    ]];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    XLSX.writeFile(wb, "stallen-template.xlsx");
  }

  // -------------------------------------------------------
  // 📥 IMPORT STALLEN
  // -------------------------------------------------------
  static async importStallen(file, callback) {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      const geldige = rows.filter(r => r.locatieId && r.stalnr);

      if (!geldige.length) {
        alert("⚠️ Geen geldige rijen gevonden. Controleer de locatieId en stalnr.");
        return;
      }

      const bestaandeStallen = loadData("stallen") || [];

      const nieuweStallen = geldige.map(r => ({
        id: Date.now() + Math.floor(Math.random() * 10000),
        locatieId: r.locatieId,
        locatienaam: r.locatienaam || "",
        stalnr: parseInt(r.stalnr),
        paardId: r.paardId || null
      }));

      const alles = [...bestaandeStallen, ...nieuweStallen];
      saveData("stallen", alles);

      alert(`✅ ${nieuweStallen.length} stallen geïmporteerd.`);
      if (typeof callback === "function") callback();
    } catch (err) {
      console.error("❌ Fout bij import:", err);
      alert("❌ Importeren van stallen mislukt. Is het een geldig Excel-bestand?");
    }
  }
}
