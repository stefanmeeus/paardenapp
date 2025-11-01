// Handige hulpfuncties

export function generateId(prefix = "item") {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("nl-BE");
}
