// js/storage.js
const KEY = "paardenbeheer_data_v1";

/** Slaat data op in localStorage */
export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

/** Laadt data uit localStorage */
export function loadData() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    return { paarden: [], stallen: [], voeding: [], contacten: [] };
  }
  try {
    return JSON.parse(raw);
  } catch {
    console.warn("❌ Fout bij parsen van storage");
    return { paarden: [], stallen: [], voeding: [], contacten: [] };
  }
}

/** Voeg een paard toe */
export function addPaard(paard) {
  const data = loadData();
  data.paarden.push(paard);
  saveData(data);
}

/** Haal alle paarden op */
export function getPaarden() {
  const data = loadData();
  return data.paarden || [];
}
