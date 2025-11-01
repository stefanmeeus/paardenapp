export function loadData(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    console.warn("⚠️ Fout bij laden van", key);
    return [];
  }
}

export function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
