import { supabase } from "./supabaseClient.js";

/**
 * Universele data loader — gebruikt Supabase als beschikbaar, anders localStorage.
 */
export async function loadData(key) {
  try {
    if (key === "paarden") {
      const { data, error } = await supabase
        .from("paarden")
        .select("*")
        .order("naam", { ascending: true });

      if (error) throw error;
      console.log(`✅ Supabase: ${data.length} paarden geladen`);
      return data || [];
    }

    // fallback voor andere datasets
    const local = localStorage.getItem(key);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error("❌ Fout bij laden van", key, err.message);
    return [];
  }
}

/**
 * Universele data saver — schrijft naar Supabase of localStorage.
 */
export async function saveData(key, data) {
  try {
    if (key === "paarden") {
      // Wis eerst bestaande records (voor eenvoud)
      await supabase.from("paarden").delete().neq("id", 0);
      const { error } = await supabase.from("paarden").insert(data);

      if (error) throw error;
      console.log(`✅ Supabase: ${data.length} paarden opgeslagen`);
      return;
    }

    // fallback
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error("❌ Fout bij opslaan van", key, err.message);
  }
}
