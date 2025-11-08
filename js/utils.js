/**
 * Genereert een uniek ID op basis van:
 * - prefix (bv. "paard", "contact")
 * - random string
 * - timestamp
 *
 * Resultaat voorbeeld:
 * paard_f8k3l9q_maj7k2d
 */
export function generateId(prefix = "") {
  return (
    prefix +
    "_" +
    Math.random().toString(36).substring(2, 9) +
    "_" +
    Date.now().toString(36)
  );
}

/**
 * Veilig JSON parsen.
 * Retourneert fallback als parsing faalt of waarde corrupt is.
 */
export function safeParse(json, fallback = null) {
  try {
    return JSON.parse(json);
  } catch (err) {
    console.warn("Corrupt JSON gedetecteerd -> fallback gebruikt.");
    return fallback;
  }
}

/**
 * Checkt of waarde leeg of undefined is.
 */
export function isEmpty(value) {
  return value === undefined || value === null || value === "";
}

/**
 * Escapet HTML om XSS te voorkomen.
 */
export function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
